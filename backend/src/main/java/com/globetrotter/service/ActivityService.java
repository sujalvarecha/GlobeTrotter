package com.globetrotter.service;

import com.globetrotter.dto.ActivityDTO;
import com.globetrotter.model.Activity;
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
    public List<ActivityDTO> searchActivities(String query, String category, Double maxCost, Integer maxDuration) {
        List<Activity> baseList;
        if (query == null || query.isBlank()) {
            baseList = activityRepository.findAll();
        } else {
            baseList = activityRepository.searchActivities(query.trim());
        }

        return baseList.stream()
                .filter(a -> {
                    if (category != null && !category.isBlank()) {
                        if (a.getCategory() == null || !a.getCategory().equalsIgnoreCase(category.trim())) {
                            return false;
                        }
                    }
                    if (maxCost != null) {
                        if (a.getEstimatedCost() != null && a.getEstimatedCost() > maxCost) {
                            return false;
                        }
                    }
                    if (maxDuration != null) {
                        if (a.getDurationMinutes() != null && a.getDurationMinutes() > maxDuration) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(ActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
