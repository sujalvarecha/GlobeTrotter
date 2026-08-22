package com.globetrotter.service;

import com.globetrotter.dto.ActivityCostItemDTO;
import com.globetrotter.dto.StopBudgetDTO;
import com.globetrotter.dto.TripBudgetDTO;
import com.globetrotter.model.*;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class BudgetService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    // Currency exchange rates relative to 1 USD
    private static final Map<String, Double> EXCHANGE_RATES = Map.of(
            "USD", 1.0,
            "EUR", 0.92,
            "GBP", 0.79,
            "JPY", 155.0,
            "INR", 83.5,
            "CAD", 1.36,
            "AUD", 1.52
    );

    // Tier daily base costs (in USD) before multiplying with city costIndex
    // e.g. lodging base: budget=35, standard=85, luxury=250
    private static final Map<String, double[]> TIER_RATES = Map.of(
            "budget",   new double[]{35.0, 25.0, 10.0},  // [lodging, food, transport]
            "standard", new double[]{85.0, 50.0, 25.0},
            "luxury",   new double[]{250.0, 120.0, 60.0}
    );

    @Autowired
    public BudgetService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public TripBudgetDTO calculateTripBudget(Long tripId, String tierParam, String currencyParam) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip belongs to another user");
        }

        String tier = (tierParam != null && TIER_RATES.containsKey(tierParam.toLowerCase()))
                ? tierParam.toLowerCase()
                : "standard";

        String currency = (currencyParam != null && EXCHANGE_RATES.containsKey(currencyParam.toUpperCase()))
                ? currencyParam.toUpperCase()
                : "USD";

        double exchangeRate = EXCHANGE_RATES.get(currency);
        double[] baseRates = TIER_RATES.get(tier);
        double lodgingBase = baseRates[0];
        double foodBase = baseRates[1];
        double transportBase = baseRates[2];

        TripBudgetDTO response = new TripBudgetDTO();
        response.setTripId(trip.getId());
        response.setTripName(trip.getName());
        response.setBudgetTier(tier);
        response.setCurrency(currency);

        List<StopBudgetDTO> stopBudgets = new ArrayList<>();
        double totalActivities = 0.0;
        double totalAccommodation = 0.0;
        double totalFood = 0.0;
        double totalTransport = 0.0;
        int totalDays = 0;

        List<TripStop> stops = trip.getStops() != null ? trip.getStops() : Collections.emptyList();

        for (TripStop stop : stops) {
            City city = stop.getCity();
            double costIndex = (city != null && city.getCostIndex() != null) ? city.getCostIndex() : 3.0;

            int days = 1;
            if (stop.getStartDate() != null && stop.getEndDate() != null) {
                long diff = ChronoUnit.DAYS.between(stop.getStartDate(), stop.getEndDate());
                days = Math.max(1, (int) diff);
            }
            totalDays += days;

            // Calculate costs in USD first
            double stopLodging = lodgingBase * costIndex * days;
            double stopFood = foodBase * costIndex * days;
            double stopTransport = transportBase * costIndex * days;

            double stopActivitiesCost = 0.0;
            List<ActivityCostItemDTO> activityItems = new ArrayList<>();

            if (stop.getTripActivities() != null) {
                for (TripActivity ta : stop.getTripActivities()) {
                    Activity act = ta.getActivity();
                    if (act != null) {
                        double actCostUsd = act.getEstimatedCost() != null ? act.getEstimatedCost() : 0.0;
                        stopActivitiesCost += actCostUsd;
                        activityItems.add(new ActivityCostItemDTO(
                                act.getId(),
                                act.getName(),
                                act.getCategory(),
                                round(actCostUsd * exchangeRate)
                        ));
                    }
                }
            }

            double stopTotalUsd = stopLodging + stopFood + stopTransport + stopActivitiesCost;

            StopBudgetDTO stopDto = new StopBudgetDTO();
            stopDto.setStopId(stop.getId());
            stopDto.setCityName(city != null ? city.getName() : "Unknown");
            stopDto.setCountry(city != null ? city.getCountry() : "Unknown");
            stopDto.setDurationDays(days);
            stopDto.setCostIndex(costIndex);

            // Converted values
            stopDto.setAccommodationCost(round(stopLodging * exchangeRate));
            stopDto.setFoodCost(round(stopFood * exchangeRate));
            stopDto.setLocalTransportCost(round(stopTransport * exchangeRate));
            stopDto.setActivitiesCost(round(stopActivitiesCost * exchangeRate));
            stopDto.setTotalStopCost(round(stopTotalUsd * exchangeRate));
            stopDto.setActivityItems(activityItems);

            stopBudgets.add(stopDto);

            totalAccommodation += stopLodging;
            totalFood += foodBase * costIndex * days;
            totalTransport += transportBase * costIndex * days;
            totalActivities += stopActivitiesCost;
        }

        double grandTotalUsd = totalAccommodation + totalFood + totalTransport + totalActivities;

        response.setTotalDays(totalDays);
        response.setTotalAccommodationCost(round(totalAccommodation * exchangeRate));
        response.setTotalFoodAndDiningCost(round(totalFood * exchangeRate));
        response.setTotalLocalTransportCost(round(totalTransport * exchangeRate));
        response.setTotalActivitiesCost(round(totalActivities * exchangeRate));
        response.setTotalEstimatedCost(round(grandTotalUsd * exchangeRate));
        response.setStopBudgets(stopBudgets);

        // Percentage breakdown
        Map<String, Double> breakdown = new HashMap<>();
        if (grandTotalUsd > 0) {
            breakdown.put("accommodationPercentage", round((totalAccommodation / grandTotalUsd) * 100));
            breakdown.put("foodPercentage", round((totalFood / grandTotalUsd) * 100));
            breakdown.put("transportPercentage", round((totalTransport / grandTotalUsd) * 100));
            breakdown.put("activitiesPercentage", round((totalActivities / grandTotalUsd) * 100));
        } else {
            breakdown.put("accommodationPercentage", 0.0);
            breakdown.put("foodPercentage", 0.0);
            breakdown.put("transportPercentage", 0.0);
            breakdown.put("activitiesPercentage", 0.0);
        }
        response.setCategoryBreakdown(breakdown);

        return response;
    }

    public Map<String, Double> getSupportedCurrencies() {
        return EXCHANGE_RATES;
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
