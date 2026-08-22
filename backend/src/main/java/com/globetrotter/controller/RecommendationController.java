package com.globetrotter.controller;

import com.globetrotter.dto.ActivityRecommendationDTO;
import com.globetrotter.dto.CityRecommendationDTO;
import com.globetrotter.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    // GET /api/trips/{tripId}/recommendations/cities
    @GetMapping("/cities")
    public ResponseEntity<List<CityRecommendationDTO>> recommendNextCities(@PathVariable Long tripId) {
        return ResponseEntity.ok(recommendationService.recommendNextCities(tripId));
    }

    // GET /api/trips/{tripId}/recommendations/activities?stopId=1&category=Food
    @GetMapping("/activities")
    public ResponseEntity<List<ActivityRecommendationDTO>> recommendActivities(
            @PathVariable Long tripId,
            @RequestParam Long stopId,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(recommendationService.recommendActivitiesForStop(tripId, stopId, category));
    }
}
