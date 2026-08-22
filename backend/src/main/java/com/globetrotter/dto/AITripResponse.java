package com.globetrotter.dto;

import java.time.LocalDate;
import java.util.List;

public class AITripResponse {

    private Long tripId;
    private String tripName;
    private String description;
    private String coverImage;
    private LocalDate startDate;
    private LocalDate endDate;
    private int durationDays;
    private Double targetBudget;
    private double totalEstimatedCostUsd;
    private double averageDailyCostUsd;
    private String budgetTier;
    private String aiRecommendationsSummary;
    private List<String> plannedCities;
    private List<DayPlanDTO> days;
    private boolean savedToAccount;

    public AITripResponse() {
    }

    public Long getTripId() {
        return tripId;
    }

    public void setTripId(Long tripId) {
        this.tripId = tripId;
    }

    public String getTripName() {
        return tripName;
    }

    public void setTripName(String tripName) {
        this.tripName = tripName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
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

    public double getTotalEstimatedCostUsd() {
        return totalEstimatedCostUsd;
    }

    public void setTotalEstimatedCostUsd(double totalEstimatedCostUsd) {
        this.totalEstimatedCostUsd = totalEstimatedCostUsd;
    }

    public double getAverageDailyCostUsd() {
        return averageDailyCostUsd;
    }

    public void setAverageDailyCostUsd(double averageDailyCostUsd) {
        this.averageDailyCostUsd = averageDailyCostUsd;
    }

    public String getBudgetTier() {
        return budgetTier;
    }

    public void setBudgetTier(String budgetTier) {
        this.budgetTier = budgetTier;
    }

    public String getAiRecommendationsSummary() {
        return aiRecommendationsSummary;
    }

    public void setAiRecommendationsSummary(String aiRecommendationsSummary) {
        this.aiRecommendationsSummary = aiRecommendationsSummary;
    }

    public List<String> getPlannedCities() {
        return plannedCities;
    }

    public void setPlannedCities(List<String> plannedCities) {
        this.plannedCities = plannedCities;
    }

    public List<DayPlanDTO> getDays() {
        return days;
    }

    public void setDays(List<DayPlanDTO> days) {
        this.days = days;
    }

    public boolean isSavedToAccount() {
        return savedToAccount;
    }

    public void setSavedToAccount(boolean savedToAccount) {
        this.savedToAccount = savedToAccount;
    }
}
