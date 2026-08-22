package com.globetrotter.dto;

import java.util.List;
import java.util.Map;

public class TripBudgetDTO {

    private Long tripId;
    private String tripName;
    private String currency;
    private String budgetTier; // "budget", "standard", "luxury"
    private int totalDays;
    
    // Overall totals
    private double totalEstimatedCost;
    private double totalActivitiesCost;
    private double totalAccommodationCost;
    private double totalFoodAndDiningCost;
    private double totalLocalTransportCost;

    // Breakdown by category percentage
    private Map<String, Double> categoryBreakdown;

    // Breakdown per stop
    private List<StopBudgetDTO> stopBudgets;

    public TripBudgetDTO() {
    }

    // Getters and Setters
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getBudgetTier() { return budgetTier; }
    public void setBudgetTier(String budgetTier) { this.budgetTier = budgetTier; }

    public int getTotalDays() { return totalDays; }
    public void setTotalDays(int totalDays) { this.totalDays = totalDays; }

    public double getTotalEstimatedCost() { return totalEstimatedCost; }
    public void setTotalEstimatedCost(double totalEstimatedCost) { this.totalEstimatedCost = totalEstimatedCost; }

    public double getTotalActivitiesCost() { return totalActivitiesCost; }
    public void setTotalActivitiesCost(double totalActivitiesCost) { this.totalActivitiesCost = totalActivitiesCost; }

    public double getTotalAccommodationCost() { return totalAccommodationCost; }
    public void setTotalAccommodationCost(double totalAccommodationCost) { this.totalAccommodationCost = totalAccommodationCost; }

    public double getTotalFoodAndDiningCost() { return totalFoodAndDiningCost; }
    public void setTotalFoodAndDiningCost(double totalFoodAndDiningCost) { this.totalFoodAndDiningCost = totalFoodAndDiningCost; }

    public double getTotalLocalTransportCost() { return totalLocalTransportCost; }
    public void setTotalLocalTransportCost(double totalLocalTransportCost) { this.totalLocalTransportCost = totalLocalTransportCost; }

    public Map<String, Double> getCategoryBreakdown() { return categoryBreakdown; }
    public void setCategoryBreakdown(Map<String, Double> categoryBreakdown) { this.categoryBreakdown = categoryBreakdown; }

    public List<StopBudgetDTO> getStopBudgets() { return stopBudgets; }
    public void setStopBudgets(List<StopBudgetDTO> stopBudgets) { this.stopBudgets = stopBudgets; }
}
