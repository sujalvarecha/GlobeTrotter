package com.globetrotter.controller;

import com.globetrotter.dto.*;
import com.globetrotter.service.StopService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips/{tripId}/stops")
public class StopController {

    private final StopService stopService;

    @Autowired
    public StopController(StopService stopService) {
        this.stopService = stopService;
    }

    // GET /api/trips/{tripId}/stops — list all stops for a trip (ordered)
    @GetMapping
    public ResponseEntity<List<TripStopDTO>> getStops(@PathVariable Long tripId) {
        return ResponseEntity.ok(stopService.getStopsForTrip(tripId));
    }

    // POST /api/trips/{tripId}/stops — add a city stop to a trip
    @PostMapping
    public ResponseEntity<TripStopDTO> addStop(@PathVariable Long tripId,
                                                @Valid @RequestBody AddStopRequest request) {
        return new ResponseEntity<>(stopService.addStop(tripId, request), HttpStatus.CREATED);
    }

    // PUT /api/trips/{tripId}/stops/{stopId} — update stop dates/city
    @PutMapping("/{stopId}")
    public ResponseEntity<TripStopDTO> updateStop(@PathVariable Long tripId,
                                                   @PathVariable Long stopId,
                                                   @Valid @RequestBody AddStopRequest request) {
        return ResponseEntity.ok(stopService.updateStop(tripId, stopId, request));
    }

    // DELETE /api/trips/{tripId}/stops/{stopId}
    @DeleteMapping("/{stopId}")
    public ResponseEntity<Void> deleteStop(@PathVariable Long tripId,
                                            @PathVariable Long stopId) {
        stopService.deleteStop(tripId, stopId);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/trips/{tripId}/stops/reorder — reorder all stops
    @PutMapping("/reorder")
    public ResponseEntity<List<TripStopDTO>> reorderStops(@PathVariable Long tripId,
                                                            @RequestBody ReorderStopsRequest request) {
        return ResponseEntity.ok(stopService.reorderStops(tripId, request));
    }

    // ── Activity endpoints nested under a stop ──────────────────────────────

    // GET /api/trips/{tripId}/stops/{stopId}/activities
    @GetMapping("/{stopId}/activities")
    public ResponseEntity<List<TripActivityDTO>> getActivities(@PathVariable Long tripId,
                                                                @PathVariable Long stopId) {
        return ResponseEntity.ok(stopService.getActivitiesForStop(tripId, stopId));
    }

    // POST /api/trips/{tripId}/stops/{stopId}/activities — add an activity to a stop
    @PostMapping("/{stopId}/activities")
    public ResponseEntity<TripActivityDTO> addActivity(@PathVariable Long tripId,
                                                        @PathVariable Long stopId,
                                                        @Valid @RequestBody AddActivityToStopRequest request) {
        return new ResponseEntity<>(stopService.addActivityToStop(tripId, stopId, request), HttpStatus.CREATED);
    }

    // DELETE /api/trips/{tripId}/stops/{stopId}/activities/{tripActivityId}
    @DeleteMapping("/{stopId}/activities/{tripActivityId}")
    public ResponseEntity<Void> removeActivity(@PathVariable Long tripId,
                                                @PathVariable Long stopId,
                                                @PathVariable Long tripActivityId) {
        stopService.removeActivityFromStop(tripId, stopId, tripActivityId);
        return ResponseEntity.noContent().build();
    }
}
