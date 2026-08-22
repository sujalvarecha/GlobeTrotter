package com.globetrotter.dto;

import java.util.List;

public class StopBudgetDTO {

    private Long stopId;
    private String cityName;
    private String country;
    private int durationDays;
    private double costIndex;

    private double totalStopCost;
    private double accommodationCost;
    private double activitiesCost;
    private double foodCost;
    private double localTransportCost;

    private List<ActivityCostItemDTO> activityItems;

    public StopBudgetDTO() {
    }

    // Getters and Setters
    public Long getStopId() { return stopId; }
    public void setStopId(Long stopId) { this.stopId = stopId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public int getDurationDays() { return durationDays; }
    public void setDurationDays(int durationDays) { this.durationDays = durationDays; }

    public double getCostIndex() { return costIndex; }
    public void setCostIndex(double costIndex) { this.costIndex = costIndex; }

    public double getTotalStopCost() { return totalStopCost; }
    public void setTotalStopCost(double totalStopCost) { this.totalStopCost = totalStopCost; }

    public double getAccommodationCost() { return accommodationCost; }
    public void setAccommodationCost(double accommodationCost) { this.accommodationCost = accommodationCost; }

    public double getActivitiesCost() { return activitiesCost; }
    public void setActivitiesCost(double activitiesCost) { this.activitiesCost = activitiesCost; }

    public double getFoodCost() { return foodCost; }
    public void setFoodCost(double foodCost) { this.foodCost = foodCost; }

    public double getLocalTransportCost() { return localTransportCost; }
    public void setLocalTransportCost(double localTransportCost) { this.localTransportCost = localTransportCost; }

    public List<ActivityCostItemDTO> getActivityItems() { return activityItems; }
    public void setActivityItems(List<ActivityCostItemDTO> activityItems) { this.activityItems = activityItems; }
}
