package com.globetrotter.service;

import com.globetrotter.dto.UpdateProfileRequest;
import com.globetrotter.dto.UserProfileDTO;
import com.globetrotter.model.Trip;
import com.globetrotter.model.User;
import com.globetrotter.repository.TripRepository;
import com.globetrotter.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;

    @Autowired
    public UserService(UserRepository userRepository, TripRepository tripRepository) {
        this.userRepository = userRepository;
        this.tripRepository = tripRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileDTO getProfile() {
        User user = getCurrentUser();
        List<Trip> trips = tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        Set<Long> uniqueCities = new HashSet<>();
        for (Trip t : trips) {
            if (t.getStops() != null) {
                t.getStops().forEach(s -> {
                    if (s.getCity() != null) {
                        uniqueCities.add(s.getCity().getId());
                    }
                });
            }
        }

        return new UserProfileDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getProfileImage(),
                user.getLanguage(),
                trips.size(),
                uniqueCities.size(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserProfileDTO updateProfile(UpdateProfileRequest request) {
        User user = getCurrentUser();

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getProfileImage() != null) {
            user.setProfileImage(request.getProfileImage().trim());
        }
        if (request.getLanguage() != null && !request.getLanguage().isBlank()) {
            user.setLanguage(request.getLanguage().trim());
        }

        User updated = userRepository.save(user);
        List<Trip> trips = tripRepository.findByUserIdOrderByCreatedAtDesc(updated.getId());

        Set<Long> uniqueCities = new HashSet<>();
        for (Trip t : trips) {
            if (t.getStops() != null) {
                t.getStops().forEach(s -> {
                    if (s.getCity() != null) {
                        uniqueCities.add(s.getCity().getId());
                    }
                });
            }
        }

        return new UserProfileDTO(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getProfileImage(),
                updated.getLanguage(),
                trips.size(),
                uniqueCities.size(),
                updated.getCreatedAt()
        );
    }

    @Transactional
    public void deleteAccount() {
        User user = getCurrentUser();
        // Delete user's trips and all cascading stops/activities
        List<Trip> trips = tripRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        tripRepository.deleteAll(trips);
        userRepository.delete(user);
    }
}
