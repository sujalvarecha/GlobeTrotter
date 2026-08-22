package com.globetrotter.service;

import com.globetrotter.dto.PublicTripDTO;
import com.globetrotter.dto.ShareResponseDTO;
import com.globetrotter.dto.TripResponse;
import com.globetrotter.model.*;
import com.globetrotter.repository.TripActivityRepository;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.TripStopRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ShareService {

    private final TripRepository tripRepository;
    private final TripStopRepository tripStopRepository;
    private final TripActivityRepository tripActivityRepository;
    private final UserRepository userRepository;

    @Autowired
    public ShareService(TripRepository tripRepository,
                        TripStopRepository tripStopRepository,
                        TripActivityRepository tripActivityRepository,
                        UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.tripStopRepository = tripStopRepository;
        this.tripActivityRepository = tripActivityRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional
    public ShareResponseDTO enableSharing(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip does not belong to current user");
        }

        if (trip.getShareToken() == null || trip.getShareToken().isBlank()) {
            trip.setShareToken(UUID.randomUUID().toString().replace("-", ""));
        }
        trip.setPublic(true);
        tripRepository.save(trip);

        String shareUrl = "/api/public/trips/" + trip.getShareToken();
        return new ShareResponseDTO(trip.getId(), true, trip.getShareToken(), shareUrl);
    }

    @Transactional
    public ShareResponseDTO disableSharing(Long tripId) {
        User user = getCurrentUser();
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + tripId));

        if (trip.getUser() == null || !trip.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: trip does not belong to current user");
        }

        trip.setPublic(false);
        tripRepository.save(trip);

        return new ShareResponseDTO(trip.getId(), false, null, null);
    }

    @Transactional(readOnly = true)
    public PublicTripDTO getPublicTrip(String shareToken) {
        Trip trip = tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Trip not found or link has expired"));

        if (!trip.isPublic()) {
            throw new RuntimeException("This trip is private and cannot be viewed");
        }

        return PublicTripDTO.fromEntity(trip);
    }

    @Transactional
    public TripResponse forkTrip(String shareToken) {
        User user = getCurrentUser();
        Trip sourceTrip = tripRepository.findByShareToken(shareToken)
                .orElseThrow(() -> new RuntimeException("Trip not found with share token: " + shareToken));

        if (!sourceTrip.isPublic()) {
            throw new RuntimeException("Cannot clone a private trip");
        }

        // Clone trip
        Trip forkedTrip = new Trip(
                sourceTrip.getName() + " (Copy)",
                sourceTrip.getDescription(),
                sourceTrip.getStartDate(),
                sourceTrip.getEndDate(),
                sourceTrip.getCoverImage()
        );
        forkedTrip.setUser(user);
        forkedTrip.setPublic(false);
        Trip savedTrip = tripRepository.save(forkedTrip);

        // Deep clone stops and activities
        if (sourceTrip.getStops() != null) {
            for (TripStop sourceStop : sourceTrip.getStops()) {
                TripStop newStop = new TripStop(
                        savedTrip,
                        sourceStop.getCity(),
                        sourceStop.getStartDate(),
                        sourceStop.getEndDate(),
                        sourceStop.getStopOrder()
                );
                TripStop savedStop = tripStopRepository.save(newStop);

                if (sourceStop.getTripActivities() != null) {
                    for (TripActivity sourceTa : sourceStop.getTripActivities()) {
                        TripActivity newTa = new TripActivity(
                                savedStop,
                                sourceTa.getActivity(),
                                sourceTa.getActivityDate(),
                                sourceTa.getStartTime(),
                                sourceTa.getEndTime(),
                                sourceTa.getNotes()
                        );
                        tripActivityRepository.save(newTa);
                    }
                }
            }
        }

        return TripResponse.fromEntity(savedTrip);
    }
}
