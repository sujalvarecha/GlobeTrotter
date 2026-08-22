package com.globetrotter.controller;

import com.globetrotter.dto.ItineraryResponseDTO;
import com.globetrotter.dto.TimelineEventDTO;
import com.globetrotter.service.ItineraryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}")
public class ItineraryController {

    private final ItineraryService itineraryService;

    @Autowired
    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    // GET /api/trips/{tripId}/itinerary — Structured day-by-day chronological itinerary with activity schedules & costs
    @GetMapping("/itinerary")
    public ResponseEntity<ItineraryResponseDTO> getTripItinerary(@PathVariable Long tripId) {
        return ResponseEntity.ok(itineraryService.getStructuredItinerary(tripId));
    }

    // GET /api/trips/{tripId}/timeline — Visual timeline & calendar events payload
    @GetMapping("/timeline")
    public ResponseEntity<List<TimelineEventDTO>> getTripTimeline(@PathVariable Long tripId) {
        return ResponseEntity.ok(itineraryService.getTimelineEvents(tripId));
    }
}
