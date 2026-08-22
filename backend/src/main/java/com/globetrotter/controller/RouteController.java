package com.globetrotter.controller;

import com.globetrotter.dto.TripRouteDTO;
import com.globetrotter.service.RouteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trips/{tripId}/route")
public class RouteController {

    private final RouteService routeService;

    @Autowired
    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    // GET /api/trips/{tripId}/route
    @GetMapping
    public ResponseEntity<TripRouteDTO> getTripRoute(@PathVariable Long tripId) {
        TripRouteDTO route = routeService.calculateTripRoute(tripId);
        return ResponseEntity.ok(route);
    }
}
