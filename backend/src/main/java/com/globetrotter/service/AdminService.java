package com.globetrotter.service;

import com.globetrotter.dto.AdminStatsDTO;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final TripStopRepository tripStopRepository;
    private final TripActivityRepository tripActivityRepository;
    private final CityRepository cityRepository;
    private final ActivityRepository activityRepository;

    @Autowired
    public AdminService(UserRepository userRepository,
                        TripRepository tripRepository,
                        TripStopRepository tripStopRepository,
                        TripActivityRepository tripActivityRepository,
                        CityRepository cityRepository,
                        ActivityRepository activityRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
        this.tripStopRepository = tripStopRepository;
        this.tripActivityRepository = tripActivityRepository;
        this.cityRepository = cityRepository;
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getAdminStatistics() {
        long totalUsers = userRepository.count();
        long totalTrips = tripRepository.count();
        long totalStops = tripStopRepository.count();
        long totalActivitiesScheduled = tripActivityRepository.count();
        long totalCuratedCities = cityRepository.count();
        long totalCuratedActivities = activityRepository.count();

        List<Trip> allTrips = tripRepository.findAll();
        double avgDuration = 0.0;
        if (!allTrips.isEmpty()) {
            long totalDays = 0;
            for (Trip t : allTrips) {
                if (t.getStartDate() != null && t.getEndDate() != null) {
                    long diff = ChronoUnit.DAYS.between(t.getStartDate(), t.getEndDate()) + 1;
                    totalDays += Math.max(1, diff);
                } else {
                    totalDays += 1;
                }
            }
            avgDuration = Math.round(((double) totalDays / allTrips.size()) * 10.0) / 10.0;
        }

        // Top destinations planned
        List<TripStop> allStops = tripStopRepository.findAll();
        Map<String, Long> topDestinations = allStops.stream()
                .filter(s -> s.getCity() != null)
                .collect(Collectors.groupingBy(s -> s.getCity().getName(), Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        // Activity category distribution
        List<Activity> allActs = activityRepository.findAll();
        Map<String, Long> categoryDistribution = allActs.stream()
                .filter(a -> a.getCategory() != null)
                .collect(Collectors.groupingBy(Activity::getCategory, Collectors.counting()))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        return new AdminStatsDTO(
                totalUsers,
                totalTrips,
                totalStops,
                totalActivitiesScheduled,
                totalCuratedCities,
                totalCuratedActivities,
                avgDuration,
                topDestinations,
                categoryDistribution
        );
    }
}
