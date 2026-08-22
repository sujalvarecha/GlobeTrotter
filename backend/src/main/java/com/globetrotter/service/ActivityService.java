package com.globetrotter.service;

import com.globetrotter.dto.ActivityDTO;
import com.globetrotter.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;

    @Autowired
    public ActivityService(ActivityRepository activityRepository) {
        this.activityRepository = activityRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesByCity(Long cityId, String category) {
        if (category != null && !category.isBlank()) {
            return activityRepository.findByCityIdAndCategory(cityId, category.trim())
                    .stream()
                    .map(ActivityDTO::fromEntity)
                    .collect(Collectors.toList());
        }
        return activityRepository.findByCityId(cityId)
                .stream()
                .map(ActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> searchActivities(String query) {
        if (query == null || query.isBlank()) {
            return activityRepository.findAll()
                    .stream()
                    .map(ActivityDTO::fromEntity)
                    .collect(Collectors.toList());
        }
        return activityRepository.searchActivities(query.trim())
                .stream()
                .map(ActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
