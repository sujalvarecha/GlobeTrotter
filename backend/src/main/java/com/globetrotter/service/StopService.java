package com.globetrotter.service;

import com.globetrotter.dto.*;
import com.globetrotter.model.*;
import com.globetrotter.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StopService {

    private final TripRepository tripRepository;
    private final CityRepository cityRepository;
    private final ActivityRepository activityRepository;
    private final TripStopRepository tripStopRepository;
    private final TripActivityRepository tripActivityRepository;
    private final UserRepository userRepository;

    @Autowired
    public StopService(TripRepository tripRepository,
                       CityRepository cityRepository,
                       ActivityRepository activityRepository,
                       TripStopRepository tripStopRepository,
                       TripActivityRepository tripActivityRepository,
                       UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.cityRepository = cityRepository;
        this.activityRepository = activityRepository;
        this.tripStopRepository = tripStopRepository;
        this.tripActivityRepository = tripActivityRepository;
        this.userRepository = userRepository;
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

    // ── STOP CRUD ──────────────────────────────────────────────────────────

    @Transactional
    public TripStopDTO addStop(Long tripId, AddStopRequest request) {
        Trip trip = getOwnedTrip(tripId);

        if (request.getCityId() == null) {
            throw new RuntimeException("City ID is required to add a stop");
        }
        City city = cityRepository.findById(request.getCityId())
                .orElseThrow(() -> new RuntimeException("City not found with id: " + request.getCityId()));

        // Auto-assign stop order after current last stop if not provided
        int order = request.getStopOrder() != null
                ? request.getStopOrder()
                : tripStopRepository.findByTripIdOrderByStopOrderAsc(tripId).size() + 1;

        TripStop stop = new TripStop(trip, city, request.getStartDate(), request.getEndDate(), order);
        return TripStopDTO.fromEntity(tripStopRepository.save(stop));
    }

    @Transactional
    public TripStopDTO updateStop(Long tripId, Long stopId, AddStopRequest request) {
        getOwnedTrip(tripId); // authorization check

        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + stopId));

        if (request.getCityId() != null) {
            City city = cityRepository.findById(request.getCityId())
                    .orElseThrow(() -> new RuntimeException("City not found with id: " + request.getCityId()));
            stop.setCity(city);
        }
        if (request.getStartDate() != null) {
            stop.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            stop.setEndDate(request.getEndDate());
        }
        if (request.getStopOrder() != null) {
            stop.setStopOrder(request.getStopOrder());
        }

        return TripStopDTO.fromEntity(tripStopRepository.save(stop));
    }

    @Transactional
    public void deleteStop(Long tripId, Long stopId) {
        getOwnedTrip(tripId); // authorization check
        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + stopId));
        tripStopRepository.delete(stop);
    }

    @Transactional(readOnly = true)
    public List<TripStopDTO> getStopsForTrip(Long tripId) {
        getOwnedTrip(tripId);
        return tripStopRepository.findByTripIdOrderByStopOrderAsc(tripId)
                .stream()
                .map(TripStopDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<TripStopDTO> reorderStops(Long tripId, ReorderStopsRequest request) {
        getOwnedTrip(tripId);
        List<Long> orderedIds = request.getStopIds();

        for (int i = 0; i < orderedIds.size(); i++) {
            TripStop stop = tripStopRepository.findById(orderedIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Stop not found during reorder"));
            stop.setStopOrder(i + 1);
            tripStopRepository.save(stop);
        }

        return tripStopRepository.findByTripIdOrderByStopOrderAsc(tripId)
                .stream()
                .map(TripStopDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ── ACTIVITY ASSIGNMENT ────────────────────────────────────────────────

    @Transactional
    public TripActivityDTO addActivityToStop(Long tripId, Long stopId, AddActivityToStopRequest request) {
        getOwnedTrip(tripId);

        TripStop stop = tripStopRepository.findById(stopId)
                .orElseThrow(() -> new RuntimeException("Stop not found with id: " + stopId));

        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new RuntimeException("Activity not found with id: " + request.getActivityId()));

        TripActivity tripActivity = new TripActivity(
                stop,
                activity,
                request.getActivityDate(),
                request.getStartTime(),
                request.getEndTime(),
                request.getNotes()
        );

        return TripActivityDTO.fromEntity(tripActivityRepository.save(tripActivity));
    }

    @Transactional
    public void removeActivityFromStop(Long tripId, Long stopId, Long tripActivityId) {
        getOwnedTrip(tripId);
        TripActivity ta = tripActivityRepository.findById(tripActivityId)
                .orElseThrow(() -> new RuntimeException("TripActivity not found with id: " + tripActivityId));
        if (!ta.getTripStop().getId().equals(stopId)) {
            throw new RuntimeException("This activity does not belong to the specified stop");
        }
        tripActivityRepository.delete(ta);
    }

    @Transactional(readOnly = true)
    public List<TripActivityDTO> getActivitiesForStop(Long tripId, Long stopId) {
        getOwnedTrip(tripId);
        return tripActivityRepository.findByTripStopIdOrderByActivityDateAscStartTimeAsc(stopId)
                .stream()
                .map(TripActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
