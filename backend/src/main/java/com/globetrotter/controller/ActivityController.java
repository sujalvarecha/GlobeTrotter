package com.globetrotter.controller;

import com.globetrotter.dto.ActivityDTO;
import com.globetrotter.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    private final ActivityService activityService;

    @Autowired
    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/city/{cityId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesByCity(
            @PathVariable Long cityId,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(activityService.getActivitiesByCity(cityId, category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ActivityDTO>> searchActivities(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(activityService.searchActivities(query));
    }
}
