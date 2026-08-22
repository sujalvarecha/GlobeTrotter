package com.globetrotter.dto;

import java.time.LocalDate;
import java.util.List;

public class ItineraryResponseDTO {

    private Long tripId;
    private String tripName;
    private String description;
    private String coverImage;
    private LocalDate startDate;
    private LocalDate endDate;
    private int totalDays;
    private int totalStops;
    private int totalActivities;
    private double totalEstimatedCostUsd;
    private double averageDailyCostUsd;
    private List<DayPlanDTO> days;

    public ItineraryResponseDTO() {
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

    public int getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(int totalDays) {
        this.totalDays = totalDays;
    }

    public int getTotalStops() {
        return totalStops;
    }

    public void setTotalStops(int totalStops) {
        this.totalStops = totalStops;
    }

    public int getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(int totalActivities) {
        this.totalActivities = totalActivities;
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

    public List<DayPlanDTO> getDays() {
        return days;
    }

    public void setDays(List<DayPlanDTO> days) {
        this.days = days;
    }
}
