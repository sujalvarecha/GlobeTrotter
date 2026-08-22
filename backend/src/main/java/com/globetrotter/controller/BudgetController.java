package com.globetrotter.controller;

import com.globetrotter.dto.TripBudgetDTO;
import com.globetrotter.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/trips/{tripId}/budget")
public class BudgetController {

    private final BudgetService budgetService;

    @Autowired
    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // GET /api/trips/{tripId}/budget?tier=standard&currency=USD
    @GetMapping
    public ResponseEntity<TripBudgetDTO> getTripBudget(
            @PathVariable Long tripId,
            @RequestParam(required = false, defaultValue = "standard") String tier,
            @RequestParam(required = false, defaultValue = "USD") String currency) {
        TripBudgetDTO budget = budgetService.calculateTripBudget(tripId, tier, currency);
        return ResponseEntity.ok(budget);
    }

    // GET /api/trips/{tripId}/budget/currencies
    @GetMapping("/currencies")
    public ResponseEntity<Map<String, Double>> getCurrencies() {
        return ResponseEntity.ok(budgetService.getSupportedCurrencies());
    }
}
