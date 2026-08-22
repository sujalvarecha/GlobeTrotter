package com.globetrotter.service;

import com.globetrotter.dto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ItineraryService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;

    // Standard daily base rates in USD
    private static final double DAILY_LODGING_BASE = 85.0;
    private static final double DAILY_FOOD_BASE = 50.0;
    private static final double DAILY_TRANSPORT_BASE = 25.0;

    @Autowired
    public ItineraryService(TripRepository tripRepository,
                            UserRepository userRepository,
                            BudgetService budgetService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.budgetService = budgetService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    private Trip getOwnedTrip(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip does not belong to current user");
        }
        return trip;
    }

    @Transactional(readOnly = true)
    public ItineraryResponseDTO getStructuredItinerary(Long tripId) {
        Trip trip = getOwnedTrip(tripId);

        List<TripStop> stops = trip.getStops() != null ? new ArrayList<>(trip.getStops()) : new ArrayList<>();
        stops.sort(Comparator.comparingInt(TripStop::getStopOrder));

        ItineraryResponseDTO response = new ItineraryResponseDTO();
        response.setTripId(trip.getId());
        response.setTripName(trip.getName());
        response.setDescription(trip.getDescription());
        response.setCoverImage(trip.getCoverImage());
        response.setStartDate(trip.getStartDate());
        response.setEndDate(trip.getEndDate());
        response.setTotalStops(stops.size());

        List<DayPlanDTO> dayPlans = new ArrayList<>();
        int dayIndex = 1;
        int totalActivitiesCount = 0;

        LocalDate tripCursorDate = trip.getStartDate() != null ? trip.getStartDate() : LocalDate.now();

        for (TripStop stop : stops) {
            City city = stop.getCity();
            double costIndex = (city != null && city.getCostIndex() != null) ? city.getCostIndex() : 3.0;

            int durationDays = 1;
            if (stop.getStartDate() != null && stop.getEndDate() != null) {
                long diff = ChronoUnit.DAYS.between(stop.getStartDate(), stop.getEndDate());
                durationDays = Math.max(1, (int) diff);
            }

            LocalDate stopStart = stop.getStartDate() != null ? stop.getStartDate() : tripCursorDate;

            List<TripActivity> stopActivities = stop.getTripActivities() != null
                    ? new ArrayList<>(stop.getTripActivities())
                    : Collections.emptyList();

            totalActivitiesCount += stopActivities.size();

            // Distribute activities by date or across days
            for (int d = 0; d < durationDays; d++) {
                LocalDate currentDayDate = stopStart.plusDays(d);
                DayPlanDTO dayPlan = new DayPlanDTO();
                dayPlan.setDayNumber(dayIndex++);
                dayPlan.setDate(currentDayDate);
                dayPlan.setStopId(stop.getId());
                dayPlan.setCityName(city != null ? city.getName() : "Unknown City");
                dayPlan.setCountry(city != null ? city.getCountry() : "Unknown Country");
                dayPlan.setCityImageUrl(city != null ? city.getImageUrl() : null);

                // Find activities on this date or assigned to this day
                final int currentOffset = d;
                List<DayActivityItemDTO> dayActivities = new ArrayList<>();
                double dayActivitiesCost = 0.0;

                for (TripActivity ta : stopActivities) {
                    boolean matchesDate = ta.getActivityDate() != null && ta.getActivityDate().isEqual(currentDayDate);
                    boolean isUnscheduled = ta.getActivityDate() == null && (currentOffset == 0);

                    if (matchesDate || isUnscheduled) {
                        Activity act = ta.getActivity();
                        double cost = (act != null && act.getEstimatedCost() != null) ? act.getEstimatedCost() : 0.0;
                        dayActivitiesCost += cost;

                        dayActivities.add(new DayActivityItemDTO(
                                ta.getId(),
                                act != null ? act.getId() : null,
                                act != null ? act.getName() : "Activity",
                                act != null ? act.getCategory() : "General",
                                act != null ? act.getImageUrl() : null,
                                ta.getStartTime() != null ? ta.getStartTime() : "10:00 AM",
                                ta.getEndTime() != null ? ta.getEndTime() : "12:00 PM",
                                act != null ? act.getDurationMinutes() : 120,
                                cost,
                                ta.getNotes()
                        ));
                    }
                }

                double lodgingDay = round(DAILY_LODGING_BASE * costIndex);
                double foodDay = round(DAILY_FOOD_BASE * costIndex);
                double transportDay = round(DAILY_TRANSPORT_BASE * costIndex);
                double totalDayCost = round(lodgingDay + foodDay + transportDay + dayActivitiesCost);

                dayPlan.setActivities(dayActivities);
                dayPlan.setDailyAccommodationCostUsd(lodgingDay);
                dayPlan.setDailyFoodCostUsd(foodDay);
                dayPlan.setDailyActivitiesCostUsd(round(dayActivitiesCost));
                dayPlan.setTotalDayCostUsd(totalDayCost);

                dayPlans.add(dayPlan);
            }

            tripCursorDate = stopStart.plusDays(durationDays);
        }

        response.setDays(dayPlans);
        response.setTotalDays(dayPlans.size());
        response.setTotalActivities(totalActivitiesCount);

        try {
            TripBudgetDTO budget = budgetService.calculateTripBudget(tripId, "standard", "USD");
            response.setTotalEstimatedCostUsd(budget.getTotalEstimatedCost());
            response.setAverageDailyCostUsd(budget.getAverageCostPerDay());
        } catch (Exception e) {
            double fallbackTotal = dayPlans.stream().mapToDouble(DayPlanDTO::getTotalDayCostUsd).sum();
            response.setTotalEstimatedCostUsd(round(fallbackTotal));
            response.setAverageDailyCostUsd(dayPlans.isEmpty() ? 0.0 : round(fallbackTotal / dayPlans.size()));
        }

        return response;
    }

    @Transactional(readOnly = true)
    public List<TimelineEventDTO> getTimelineEvents(Long tripId) {
        ItineraryResponseDTO itinerary = getStructuredItinerary(tripId);
        List<TimelineEventDTO> events = new ArrayList<>();

        for (DayPlanDTO day : itinerary.getDays()) {
            // 1. Day Arrival / Morning Start Event
            events.add(new TimelineEventDTO(
                    "day-start-" + day.getDayNumber(),
                    day.getDayNumber(),
                    day.getDate(),
                    "09:00 AM",
                    "Morning in " + day.getCityName(),
                    "ARRIVAL",
                    "Schedule",
                    day.getCityName() + ", " + day.getCountry(),
                    day.getDailyAccommodationCostUsd(),
                    "Lodging & morning preparations",
                    day.getCityImageUrl()
            ));

            // 2. Activities on this day
            if (day.getActivities() != null) {
                for (DayActivityItemDTO act : day.getActivities()) {
                    events.add(new TimelineEventDTO(
                            "act-" + act.getId(),
                            day.getDayNumber(),
                            day.getDate(),
                            act.getStartTime(),
                            act.getActivityName(),
                            "ACTIVITY",
                            act.getCategory(),
                            day.getCityName(),
                            act.getEstimatedCostUsd(),
                            act.getNotes(),
                            act.getImageUrl()
                    ));
                }
            }

            // 3. Evening Dining Event
            events.add(new TimelineEventDTO(
                    "day-end-" + day.getDayNumber(),
                    day.getDayNumber(),
                    day.getDate(),
                    "08:00 PM",
                    "Local Dining & Leisure",
                    "ACTIVITY",
                    "Food",
                    day.getCityName(),
                    day.getDailyFoodCostUsd(),
                    "Dinner and evening relaxation in " + day.getCityName(),
                    null
            ));
        }

        return events;
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }
}
