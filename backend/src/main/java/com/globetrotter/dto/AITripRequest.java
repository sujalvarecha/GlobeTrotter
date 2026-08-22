package com.globetrotter.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AITripRequest {

    @NotBlank(message = "Destination, country, or region is required")
    private String destination;

    @Min(value = 1, message = "Duration must be at least 1 day")
    @Max(value = 30, message = "Duration cannot exceed 30 days")
    private int durationDays = 5;

    private Double targetBudget;

    private String tier = "standard"; // "budget", "standard", "luxury"

    private List<String> interests; // e.g. ["Culture", "Food", "Sightseeing", "Adventure", "Nature", "Shopping"]

    private boolean saveToAccount = false;

    public AITripRequest() {
    }

    public AITripRequest(String destination, int durationDays, Double targetBudget, String tier, List<String> interests, boolean saveToAccount) {
        this.destination = destination;
        this.durationDays = durationDays;
        this.targetBudget = targetBudget;
        this.tier = tier;
        this.interests = interests;
        this.saveToAccount = saveToAccount;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public int getDurationDays() {
        return durationDays;
    }

    public void setDurationDays(int durationDays) {
        this.durationDays = durationDays;
    }

    public Double getTargetBudget() {
        return targetBudget;
    }

    public void setTargetBudget(Double targetBudget) {
        this.targetBudget = targetBudget;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public List<String> getInterests() {
        return interests;
    }

    public void setInterests(List<String> interests) {
        this.interests = interests;
    }

    public boolean isSaveToAccount() {
        return saveToAccount;
    }

    public void setSaveToAccount(boolean saveToAccount) {
        this.saveToAccount = saveToAccount;
    }
}
