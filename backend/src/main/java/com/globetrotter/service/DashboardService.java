package com.globetrotter.service;

import com.globetrotter.dto.CityDTO;
import com.globetrotter.dto.DashboardSummaryDTO;
import com.globetrotter.dto.TripBudgetDTO;
import com.globetrotter.dto.TripResponse;
import com.globetrotter.dto.UserDTO;
import com.globetrotter.model.City;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final CityRepository cityRepository;
    private final BudgetService budgetService;

    @Autowired
    public DashboardService(UserRepository userRepository,
                            TripRepository tripRepository,
                            CityRepository cityRepository,
                            BudgetService budgetService) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.cityRepository = cityRepository;
        this.budgetService = budgetService;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        User user = getCurrentUser();
        List<Trip> allUserTrips = tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        LocalDate today = LocalDate.now();

        // 1. Upcoming trips (startDate >= today)
        List<TripResponse> upcomingTrips = allUserTrips.stream()
                .filter(t -> t.getStartDate() != null && !t.getStartDate().isBefore(today))
                .sorted(Comparator.comparing(Trip::getStartDate))
                .limit(5)
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());

        // 2. Recent trips (latest created)
        List<TripResponse> recentTrips = allUserTrips.stream()
                .limit(4)
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());

        // 3. Popular destinations
        List<CityDTO> popularDestinations = cityRepository.findByOrderByPopularityDesc()
                .stream()
                .limit(6)
                .map(CityDTO::fromEntity)
                .collect(Collectors.toList());

        // 4. Personal stats
        Set<Long> uniqueCityIds = new HashSet<>();
        double totalEstimatedSpend = 0.0;

        for (Trip trip : allUserTrips) {
            if (trip.getStops() != null) {
                trip.getStops().forEach(s -> {
                    if (s.getCity() != null) {
                        uniqueCityIds.add(s.getCity().getId());
                    }
                });
            }
            try {
                TripBudgetDTO budget = budgetService.calculateTripBudget(trip.getId(), "standard", "USD");
                totalEstimatedSpend += budget.getTotalEstimatedCost();
            } catch (Exception ignored) {
            }
        }

        totalEstimatedSpend = Math.round(totalEstimatedSpend * 100.0) / 100.0;

        String welcome = String.format("Welcome back, %s! Ready to map your next journey?", user.getName());

        return new DashboardSummaryDTO(
                welcome,
                UserDTO.fromEntity(user),
                upcomingTrips,
                recentTrips,
                popularDestinations,
                allUserTrips.size(),
                uniqueCityIds.size(),
                totalEstimatedSpend
        );
    }
}
