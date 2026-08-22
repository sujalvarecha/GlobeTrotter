package com.globetrotter.service;

import com.globetrotter.dto.TripBudgetDTO;
import com.globetrotter.dto.TripRouteDTO;
import com.globetrotter.model.*;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Service
public class ExportService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final BudgetService budgetService;
    private final RouteService routeService;

    @Autowired
    public ExportService(TripRepository tripRepository,
                         UserRepository userRepository,
                         BudgetService budgetService,
                         RouteService routeService) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
        this.budgetService = budgetService;
        this.routeService = routeService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public String exportItineraryMarkdown(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        TripBudgetDTO budget = budgetService.calculateTripBudget(tripId, "standard", "USD");
        TripRouteDTO route = routeService.calculateTripRoute(tripId);

        StringBuilder sb = new StringBuilder();
        sb.append("# 🌍 Trip Itinerary: ").append(trip.getName()).append("\n\n");
        if (trip.getDescription() != null) {
            sb.append("> ").append(trip.getDescription()).append("\n\n");
        }
        sb.append("**Traveler:** ").append(user.getName()).append("\n");
        sb.append("**Dates:** ").append(trip.getStartDate()).append(" to ").append(trip.getEndDate()).append("\n");
        sb.append("**Total Route Distance:** ").append(route.getTotalDistanceKm()).append(" km (").append(route.getTotalDistanceMiles()).append(" miles)\n");
        sb.append("**Estimated Total Budget (Standard Tier):** $").append(budget.getTotalEstimatedCost()).append(" USD\n\n");

        sb.append("## 🗺️ Travel Stops & Schedule\n\n");

        List<TripStop> stops = trip.getStops() != null ? trip.getStops() : List.of();
        stops.sort(Comparator.comparingInt(TripStop::getStopOrder));

        for (int i = 0; i < stops.size(); i++) {
            TripStop stop = stops.get(i);
            City city = stop.getCity();
            sb.append("### Stop ").append(stop.getStopOrder()).append(": ")
              .append(city != null ? city.getName() : "City")
              .append(", ").append(city != null ? city.getCountry() : "Country")
              .append("\n");

            sb.append("- **Dates:** ").append(stop.getStartDate()).append(" → ").append(stop.getEndDate()).append("\n");

            if (stop.getTripActivities() != null && !stop.getTripActivities().isEmpty()) {
                sb.append("- **Planned Activities:**\n");
                for (TripActivity ta : stop.getTripActivities()) {
                    Activity act = ta.getActivity();
                    sb.append("  - 📍 **").append(act != null ? act.getName() : "Activity").append("**");
                    if (ta.getActivityDate() != null) {
                        sb.append(" (").append(ta.getActivityDate());
                        if (ta.getStartTime() != null) {
                            sb.append(" at ").append(ta.getStartTime());
                        }
                        sb.append(")");
                    }
                    if (act != null && act.getEstimatedCost() != null) {
                        sb.append(" — $").append(act.getEstimatedCost()).append(" USD");
                    }
                    if (ta.getNotes() != null && !ta.getNotes().isBlank()) {
                        sb.append("\n    *Note: ").append(ta.getNotes()).append("*");
                    }
                    sb.append("\n");
                }
            } else {
                sb.append("- *No specific activities scheduled yet.*\n");
            }
            sb.append("\n");
        }

        sb.append("## 💰 Budget Breakdown\n\n");
        sb.append("| Category | Amount (USD) | Percentage |\n");
        sb.append("| :--- | :--- | :--- |\n");
        sb.append("| 🏨 Accommodation | $").append(budget.getTotalAccommodationCost()).append(" | ").append(budget.getCategoryBreakdown().getOrDefault("accommodationPercentage", 0.0)).append("% |\n");
        sb.append("| 🍽️ Food & Dining | $").append(budget.getTotalFoodAndDiningCost()).append(" | ").append(budget.getCategoryBreakdown().getOrDefault("foodPercentage", 0.0)).append("% |\n");
        sb.append("| 🚆 Local Transport | $").append(budget.getTotalLocalTransportCost()).append(" | ").append(budget.getCategoryBreakdown().getOrDefault("transportPercentage", 0.0)).append("% |\n");
        sb.append("| 🎟️ Activities & Tours | $").append(budget.getTotalActivitiesCost()).append(" | ").append(budget.getCategoryBreakdown().getOrDefault("activitiesPercentage", 0.0)).append("% |\n");
        sb.append("| **TOTAL** | **$").append(budget.getTotalEstimatedCost()).append("** | **100%** |\n\n");

        sb.append("---\n*Generated by GlobeTrotter Travel Planner Platform*\n");
        return sb.toString();
    }
}
