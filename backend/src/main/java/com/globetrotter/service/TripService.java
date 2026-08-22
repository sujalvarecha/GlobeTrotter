package com.globetrotter.service;

import com.globetrotter.dto.CreateTripRequest;
import com.globetrotter.dto.TripResponse;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Autowired
    public TripService(TripRepository tripRepository, UserRepository userRepository) {
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found in database"));
    }

    @Transactional
    public TripResponse createTrip(CreateTripRequest request) {
        User currentUser = getCurrentUser();

        Trip trip = new Trip(
                request.getName(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate(),
                request.getCoverImage()
        );
        trip.setUser(currentUser);

        Trip saved = tripRepository.save(trip);
        return TripResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<TripResponse> getAllTrips() {
        User currentUser = getCurrentUser();
        return tripRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(TripResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TripResponse getTripById(Long id) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));

        if (trip.getUser() != null && !trip.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: this trip belongs to another user");
        }
        return TripResponse.fromEntity(trip);
    }

    @Transactional
    public TripResponse updateTrip(Long id, CreateTripRequest request) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));

        if (trip.getUser() != null && !trip.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: this trip belongs to another user");
        }

        trip.setName(request.getName());
        trip.setDescription(request.getDescription());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        if (request.getCoverImage() != null) {
            trip.setCoverImage(request.getCoverImage());
        }

        return TripResponse.fromEntity(tripRepository.save(trip));
    }

    @Transactional
    public void deleteTrip(Long id) {
        User currentUser = getCurrentUser();
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));

        if (trip.getUser() != null && !trip.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied: this trip belongs to another user");
        }

        tripRepository.delete(trip);
    }
}
