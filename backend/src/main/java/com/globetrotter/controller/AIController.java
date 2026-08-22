package com.globetrotter.controller;

import com.globetrotter.dto.AITripRequest;
import com.globetrotter.dto.AITripResponse;
import com.globetrotter.service.AIService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;

    @Autowired
    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    // POST /api/ai/generate-itinerary — AI Travel Assistant itinerary synthesizer
    @PostMapping("/generate-itinerary")
    public ResponseEntity<AITripResponse> generateItinerary(@Valid @RequestBody AITripRequest request) {
        return ResponseEntity.ok(aiService.generateItinerary(request));
    }
}
