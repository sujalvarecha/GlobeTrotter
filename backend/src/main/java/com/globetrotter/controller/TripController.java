package com.globetrotter.controller;

import com.globetrotter.dto.CreateTripRequest;
import com.globetrotter.dto.TripResponse;
import com.globetrotter.service.TripService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    @Autowired
    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    // POST /api/trips  — Create a new trip for the logged-in user
    @PostMapping
    public ResponseEntity<TripResponse> createTrip(@Valid @RequestBody CreateTripRequest request) {
        TripResponse created = tripService.createTrip(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    // GET /api/trips  — Get all trips for the logged-in user
    @GetMapping
    public ResponseEntity<List<TripResponse>> getAllTrips() {
        List<TripResponse> trips = tripService.getAllTrips();
        return ResponseEntity.ok(trips);
    }

    // GET /api/trips/{id}  — Get a specific trip (must belong to logged-in user)
    @GetMapping("/{id}")
    public ResponseEntity<TripResponse> getTripById(@PathVariable Long id) {
        TripResponse trip = tripService.getTripById(id);
        return ResponseEntity.ok(trip);
    }

    // PUT /api/trips/{id}  — Update a trip (must belong to logged-in user)
    @PutMapping("/{id}")
    public ResponseEntity<TripResponse> updateTrip(@PathVariable Long id,
                                                    @Valid @RequestBody CreateTripRequest request) {
        TripResponse updated = tripService.updateTrip(id, request);
        return ResponseEntity.ok(updated);
    }

    // DELETE /api/trips/{id}  — Delete a trip (must belong to logged-in user)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return ResponseEntity.noContent().build();
    }
}
