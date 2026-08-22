package com.globetrotter.service;

import com.globetrotter.dto.AITripRequest;
import com.globetrotter.dto.AITripResponse;
import com.globetrotter.dto.DayActivityItemDTO;
import com.globetrotter.dto.DayPlanDTO;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AIService {

    private final CityRepository cityRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;
    private final TripStopRepository tripStopRepository;
    private final TripActivityRepository tripActivityRepository;
    private final UserRepository userRepository;

    private static final Map<String, double[]> TIER_BASE_RATES = Map.of(
            "budget", new double[]{35.0, 25.0, 10.0},
            "standard", new double[]{85.0, 50.0, 25.0},
            "luxury", new double[]{250.0, 120.0, 60.0}
    );

    @Autowired
    public AIService(CityRepository cityRepository,
                     ActivityRepository activityRepository,
                     TripRepository tripRepository,
                     TripStopRepository tripStopRepository,
                     TripActivityRepository tripActivityRepository,
                     UserRepository userRepository) {
        this.cityRepository = cityRepository;
        this.activityRepository = activityRepository;
        this.tripRepository = tripRepository;
        this.tripStopRepository = tripStopRepository;
        this.tripActivityRepository = tripActivityRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        return userRepository.findByEmail(authentication.getName()).orElse(null);
    }

    @Transactional
    public AITripResponse generateItinerary(AITripRequest request) {
        String destQuery = request.getDestination().trim().toLowerCase();
        int totalDuration = Math.max(1, Math.min(30, request.getDurationDays()));
        String tier = (request.getTier() != null && TIER_BASE_RATES.containsKey(request.getTier().toLowerCase()))
                ? request.getTier().toLowerCase()
                : "standard";

        List<City> allCities = cityRepository.findAll();

        // 1. Find matching candidate cities for destination
        List<City> matchedCities = allCities.stream()
                .filter(c -> c.getName().toLowerCase().contains(destQuery)
                        || c.getCountry().toLowerCase().contains(destQuery)
                        || c.getRegion().toLowerCase().contains(destQuery))
                .sorted(Comparator.comparingInt((City c) -> c.getPopularity() != null ? c.getPopularity() : 0).reversed())
                .collect(Collectors.toList());

        // Fallback to top popular cities if no direct text match
        if (matchedCities.isEmpty()) {
            matchedCities = allCities.stream()
                    .sorted(Comparator.comparingInt((City c) -> c.getPopularity() != null ? c.getPopularity() : 0).reversed())
                    .limit(3)
                    .collect(Collectors.toList());
        }

        // Determine number of cities to include
        int stopsCount = 1;
        if (totalDuration >= 7 && matchedCities.size() >= 3) {
            stopsCount = 3;
        } else if (totalDuration >= 4 && matchedCities.size() >= 2) {
            stopsCount = 2;
        }

        List<City> selectedCities = matchedCities.subList(0, Math.min(stopsCount, matchedCities.size()));

        // Distribute days across selected stops
        int baseDaysPerStop = totalDuration / selectedCities.size();
        int remainderDays = totalDuration % selectedCities.size();

        LocalDate startDate = LocalDate.now().plusDays(14); // default 2 weeks ahead
        LocalDate endDate = startDate.plusDays(totalDuration - 1);

        AITripResponse response = new AITripResponse();
        String primaryLocation = selectedCities.get(0).getName();
        if (selectedCities.size() > 1) {
            primaryLocation += " & " + selectedCities.get(1).getName();
        }

        String interestsStr = (request.getInterests() != null && !request.getInterests().isEmpty())
                ? String.join(", ", request.getInterests())
                : "Top Highlights";

        response.setTripName(request.getDestination() + " " + totalDuration + "-Day Signature Experience");
        response.setDescription(String.format("AI-tailored %d-day itinerary exploring %s. Curated themes: %s. Tailored for %s tier comfort.",
                totalDuration, primaryLocation, interestsStr, capitalize(tier)));
        response.setCoverImage(selectedCities.get(0).getImageUrl());
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setDurationDays(totalDuration);
        response.setBudgetTier(tier);
        response.setTargetBudget(request.getTargetBudget());
        response.setPlannedCities(selectedCities.stream().map(City::getName).collect(Collectors.toList()));

        double[] tierRates = TIER_BASE_RATES.get(tier);
        double lodgingBase = tierRates[0];
        double foodBase = tierRates[1];
        double transportBase = tierRates[2];

        List<DayPlanDTO> dayPlans = new ArrayList<>();
        int dayCounter = 1;
        LocalDate cursorDate = startDate;
        double totalCostAccumulated = 0.0;

        // Keep track of planned stops for database persistence
        List<PersistedStopPlan> plannedStopsForDb = new ArrayList<>();

        for (int i = 0; i < selectedCities.size(); i++) {
            City city = selectedCities.get(i);
            int stopDays = baseDaysPerStop + (i == 0 ? remainderDays : 0);
            LocalDate stopStart = cursorDate;
            LocalDate stopEnd = cursorDate.plusDays(stopDays - 1);

            double costIndex = city.getCostIndex() != null ? city.getCostIndex() : 3.0;

            // Fetch & score city activities
            List<Activity> availableActs = activityRepository.findByCityId(city.getId());
            Set<String> userInterests = (request.getInterests() != null)
                    ? request.getInterests().stream().map(String::toLowerCase).collect(Collectors.toSet())
                    : Collections.emptySet();

            availableActs.sort((a, b) -> {
                boolean aMatch = a.getCategory() != null && userInterests.contains(a.getCategory().toLowerCase());
                boolean bMatch = b.getCategory() != null && userInterests.contains(b.getCategory().toLowerCase());
                if (aMatch && !bMatch) return -1;
                if (!aMatch && bMatch) return 1;
                return Double.compare(
                        b.getEstimatedCost() != null ? b.getEstimatedCost() : 0,
                        a.getEstimatedCost() != null ? a.getEstimatedCost() : 0
                );
            });

            PersistedStopPlan stopPlan = new PersistedStopPlan(city, stopStart, stopEnd, i + 1);
            int actCursor = 0;

            for (int d = 0; d < stopDays; d++) {
                LocalDate dayDate = stopStart.plusDays(d);
                DayPlanDTO dayPlan = new DayPlanDTO();
                dayPlan.setDayNumber(dayCounter++);
                dayPlan.setDate(dayDate);
                dayPlan.setCityName(city.getName());
                dayPlan.setCountry(city.getCountry());
                dayPlan.setCityImageUrl(city.getImageUrl());

                List<DayActivityItemDTO> dayActivityList = new ArrayList<>();
                double dayActCost = 0.0;

                // Pick 2 activities per day
                String[] times = new String[]{"10:00 AM", "03:00 PM"};
                String[] endTimes = new String[]{"12:30 PM", "05:30 PM"};

                for (int slot = 0; slot < 2; slot++) {
                    if (availableActs.isEmpty()) break;
                    Activity chosen = availableActs.get(actCursor % availableActs.size());
                    actCursor++;

                    double actCost = chosen.getEstimatedCost() != null ? chosen.getEstimatedCost() : 0.0;
                    dayActCost += actCost;

                    DayActivityItemDTO dayItem = new DayActivityItemDTO(
                            null,
                            chosen.getId(),
                            chosen.getName(),
                            chosen.getCategory(),
                            chosen.getImageUrl(),
                            times[slot],
                            endTimes[slot],
                            chosen.getDurationMinutes(),
                            actCost,
                            "Curated based on your interests in " + chosen.getCategory()
                    );
                    dayActivityList.add(dayItem);
                    stopPlan.addActivity(chosen, dayDate, times[slot], endTimes[slot], dayItem.getNotes());
                }

                double lodging = round(lodgingBase * costIndex);
                double food = round(foodBase * costIndex);
                double transport = round(transportBase * costIndex);
                double totalDay = round(lodging + food + transport + dayActCost);

                dayPlan.setActivities(dayActivityList);
                dayPlan.setDailyAccommodationCostUsd(lodging);
                dayPlan.setDailyFoodCostUsd(food);
                dayPlan.setDailyActivitiesCostUsd(round(dayActCost));
                dayPlan.setTotalDayCostUsd(totalDay);

                totalCostAccumulated += totalDay;
                dayPlans.add(dayPlan);
            }

            plannedStopsForDb.add(stopPlan);
            cursorDate = stopEnd.plusDays(1);
        }

        response.setDays(dayPlans);
        response.setTotalEstimatedCostUsd(round(totalCostAccumulated));
        response.setAverageDailyCostUsd(round(totalCostAccumulated / totalDuration));
        response.setAiRecommendationsSummary(String.format(
                "Successfully composed a balanced %d-day itinerary with %d destinations and %d personalized activities matching %s.",
                totalDuration, selectedCities.size(), dayPlans.stream().mapToInt(dp -> dp.getActivities().size()).sum(), interestsStr
        ));

        // 8. Auto-persist to account if requested
        if (request.isSaveToAccount()) {
            User currentUser = getCurrentUser();
            if (currentUser != null) {
                Trip trip = new Trip(
                        response.getTripName(),
                        response.getDescription(),
                        response.getStartDate(),
                        response.getEndDate(),
                        response.getCoverImage()
                );
                trip.setUser(currentUser);
                trip.setTargetBudget(request.getTargetBudget());
                Trip savedTrip = tripRepository.save(trip);

                for (PersistedStopPlan sp : plannedStopsForDb) {
                    TripStop tripStop = new TripStop(
                            savedTrip,
                            sp.city,
                            sp.startDate,
                            sp.endDate,
                            sp.stopOrder
                    );
                    TripStop savedStop = tripStopRepository.save(tripStop);

                    for (PersistedActivityPlan ap : sp.activities) {
                        TripActivity ta = new TripActivity(
                                savedStop,
                                ap.activity,
                                ap.date,
                                ap.startTime,
                                ap.endTime,
                                ap.notes
                        );
                        tripActivityRepository.save(ta);
                    }
                }

                response.setTripId(savedTrip.getId());
                response.setSavedToAccount(true);
            }
        }

        return response;
    }

    private static class PersistedStopPlan {
        City city;
        LocalDate startDate;
        LocalDate endDate;
        int stopOrder;
        List<PersistedActivityPlan> activities = new ArrayList<>();

        PersistedStopPlan(City city, LocalDate startDate, LocalDate endDate, int stopOrder) {
            this.city = city;
            this.startDate = startDate;
            this.endDate = endDate;
            this.stopOrder = stopOrder;
        }

        void addActivity(Activity act, LocalDate date, String startTime, String endTime, String notes) {
            activities.add(new PersistedActivityPlan(act, date, startTime, endTime, notes));
        }
    }

    private static class PersistedActivityPlan {
        Activity activity;
        LocalDate date;
        String startTime;
        String endTime;
        String notes;

        PersistedActivityPlan(Activity activity, LocalDate date, String startTime, String endTime, String notes) {
            this.activity = activity;
            this.date = date;
            this.startTime = startTime;
            this.endTime = endTime;
            this.notes = notes;
        }
    }

    private double round(double val) {
        return Math.round(val * 100.0) / 100.0;
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return "";
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
}
