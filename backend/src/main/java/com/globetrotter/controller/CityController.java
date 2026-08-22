package com.globetrotter.controller;

import com.globetrotter.dto.CityDTO;
import com.globetrotter.service.CityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cities")
public class CityController {

    private final CityService cityService;

    @Autowired
    public CityController(CityService cityService) {
        this.cityService = cityService;
    }

    // GET /api/cities — List all cities
    @GetMapping
    public ResponseEntity<List<CityDTO>> getAllCities() {
        return ResponseEntity.ok(cityService.getAllCities());
    }

    // GET /api/cities/{id} — Single city details
    @GetMapping("/{id}")
    public ResponseEntity<CityDTO> getCityById(@PathVariable Long id) {
        return ResponseEntity.ok(cityService.getCityById(id));
    }

    // GET /api/cities/search?query=...&region=...&maxCostIndex=...&minPopularity=...
    @GetMapping("/search")
    public ResponseEntity<List<CityDTO>> searchCities(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) Double maxCostIndex,
            @RequestParam(required = false) Integer minPopularity) {
        return ResponseEntity.ok(cityService.searchCities(query, region, maxCostIndex, minPopularity));
    }
}
