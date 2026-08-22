package com.globetrotter.dto;

import java.time.LocalDate;
import java.util.List;

public class DayPlanDTO {

    private int dayNumber;
    private LocalDate date;
    private Long stopId;
    private String cityName;
    private String country;
    private String cityImageUrl;
    private List<DayActivityItemDTO> activities;
    private double dailyAccommodationCostUsd;
    private double dailyFoodCostUsd;
    private double dailyActivitiesCostUsd;
    private double totalDayCostUsd;

    public DayPlanDTO() {
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getStopId() {
        return stopId;
    }

    public void setStopId(Long stopId) {
        this.stopId = stopId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCityImageUrl() {
        return cityImageUrl;
    }

    public void setCityImageUrl(String cityImageUrl) {
        this.cityImageUrl = cityImageUrl;
    }

    public List<DayActivityItemDTO> getActivities() {
        return activities;
    }

    public void setActivities(List<DayActivityItemDTO> activities) {
        this.activities = activities;
    }

    public double getDailyAccommodationCostUsd() {
        return dailyAccommodationCostUsd;
    }

    public void setDailyAccommodationCostUsd(double dailyAccommodationCostUsd) {
        this.dailyAccommodationCostUsd = dailyAccommodationCostUsd;
    }

    public double getDailyFoodCostUsd() {
        return dailyFoodCostUsd;
    }

    public void setDailyFoodCostUsd(double dailyFoodCostUsd) {
        this.dailyFoodCostUsd = dailyFoodCostUsd;
    }

    public double getDailyActivitiesCostUsd() {
        return dailyActivitiesCostUsd;
    }

    public void setDailyActivitiesCostUsd(double dailyActivitiesCostUsd) {
        this.dailyActivitiesCostUsd = dailyActivitiesCostUsd;
    }

    public double getTotalDayCostUsd() {
        return totalDayCostUsd;
    }

    public void setTotalDayCostUsd(double totalDayCostUsd) {
        this.totalDayCostUsd = totalDayCostUsd;
    }
}
