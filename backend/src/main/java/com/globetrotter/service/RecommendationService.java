package com.globetrotter.service;

import com.globetrotter.dto.ActivityDTO;
import com.globetrotter.dto.ActivityRecommendationDTO;
import com.globetrotter.dto.CityDTO;
import com.globetrotter.dto.CityRecommendationDTO;
import com.globetrotter.model.*;
import com.globetrotter.repository.ActivityRepository;
import com.globetrotter.repository.CityRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.TripStopRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final TripRepository tripRepository;
    private final CityRepository cityRepository;
    private final ActivityRepository activityRepository;
    private final TripStopRepository tripStopRepository;
    private final UserRepository userRepository;

    @Autowired
    public RecommendationService(TripRepository tripRepository,
                                 CityRepository cityRepository,
                                 ActivityRepository activityRepository,
                                 TripStopRepository tripStopRepository,
                                 UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.cityRepository = cityRepository;
        this.activityRepository = activityRepository;
        this.tripStopRepository = tripStopRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public List<CityRecommendationDTO> recommendNextCities(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip belongs to another user");
        }

        List<TripStop> currentStops = trip.getStops() != null ? trip.getStops() : Collections.emptyList();
        Set<Long> existingCityIds = currentStops.stream()
                .filter(s -> s.getCity() != null)
                .map(s -> s.getCity().getId())
                .collect(Collectors.toSet());

        Set<String> currentRegions = currentStops.stream()
                .filter(s -> s.getCity() != null && s.getCity().getRegion() != null)
                .map(s -> s.getCity().getRegion())
                .collect(Collectors.toSet());

        List<City> allCities = cityRepository.findAll();
        List<CityRecommendationDTO> recommendations = new ArrayList<>();

        for (City candidate : allCities) {
            if (existingCityIds.contains(candidate.getId())) {
                continue; // Skip cities already in itinerary
            }

            int score = 50; // base score
            StringBuilder reason = new StringBuilder();

            // Check proximity to existing stops
            Double minDistance = null;
            String closestStopName = null;

            for (TripStop stop : currentStops) {
                if (stop.getCity() != null && stop.getCity().getLatitude() != null && candidate.getLatitude() != null) {
                    double dist = RouteService.haversineDistance(
                            stop.getCity().getLatitude(), stop.getCity().getLongitude(),
                            candidate.getLatitude(), candidate.getLongitude()
                    );
                    if (minDistance == null || dist < minDistance) {
                        minDistance = dist;
                        closestStopName = stop.getCity().getName();
                    }
                }
            }

            if (candidate.getRegion() != null && currentRegions.contains(candidate.getRegion())) {
                score += 25;
                reason.append("Same region (").append(candidate.getRegion()).append("); seamless travel. ");
            }

            if (minDistance != null) {
                if (minDistance < 600) {
                    score += 20;
                    reason.append(String.format("Only %.0f km from %s (easy rail/drive). ", minDistance, closestStopName));
                } else {
                    reason.append(String.format("%.0f km from %s. ", minDistance, closestStopName));
                }
            }

            // Popularity boost
            if (candidate.getPopularity() != null && candidate.getPopularity() >= 95) {
                score += 15;
                reason.append("Top-rated world destination. ");
            }

            // Bound score to max 99
            score = Math.min(99, Math.max(10, score));

            CityRecommendationDTO dto = new CityRecommendationDTO();
            dto.setCity(CityDTO.fromEntity(candidate));
            dto.setMatchScore(score);
            dto.setMatchReason(reason.toString().trim());
            dto.setClosestCurrentStop(closestStopName);
            dto.setDistanceKmFromClosestStop(minDistance != null ? Math.round(minDistance * 10.0) / 10.0 : null);
            dto.setSuggestedTransit(minDistance != null ? (minDistance < 600 ? "High-Speed Rail" : "Direct Flight") : "Flight");

            recommendations.add(dto);
        }

        // Sort descending by match score
        recommendations.sort(Comparator.comparingInt(CityRecommendationDTO::getMatchScore).reversed());
        return recommendations;
    }

    @Transactional(readOnly = true)
    public List<ActivityRecommendationDTO> recommendActivitiesForStop(Long tripId, Long stopId, String preferredCategory) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip does not belong to another user");
        }

        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + stopId));

        City city = stop.getCity();
        if (city == null) {
            return Collections.emptyList();
        }

        Set<Long> existingActivityIds = stop.getTripActivities() != null
                ? stop.getTripActivities().stream().filter(ta -> ta.getActivity() != null).map(ta -> ta.getActivity().getId()).collect(Collectors.toSet())
                : Collections.emptySet();

        List<Activity> cityActivities = activityRepository.findByCityId(city.getId());
        List<ActivityRecommendationDTO> recommendations = new ArrayList<>();

        for (Activity act : cityActivities) {
            if (existingActivityIds.contains(act.getId())) {
                continue; // Skip already added
            }

            int score = 70;
            StringBuilder reason = new StringBuilder();

            if (preferredCategory != null && preferredCategory.equalsIgnoreCase(act.getCategory())) {
                score += 25;
                reason.append("Matches your preferred theme: ").append(act.getCategory()).append(". ");
            } else {
                reason.append("Highly recommended in ").append(city.getName()).append(". ");
            }

            if (act.getEstimatedCost() != null && act.getEstimatedCost() == 0) {
                score += 10;
                reason.append("Free admission / no ticket cost! ");
            }

            score = Math.min(99, Math.max(20, score));

            recommendations.add(new ActivityRecommendationDTO(
                    ActivityDTO.fromEntity(act),
                    score,
                    reason.toString().trim(),
                    act.getCategory()
            ));
        }

        recommendations.sort(Comparator.comparingInt(ActivityRecommendationDTO::getMatchScore).reversed());
        return recommendations;
    }
}
