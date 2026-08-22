package com.globetrotter.dto;

import java.util.Map;

public class AdminStatsDTO {

    private long totalUsers;
    private long totalTrips;
    private long totalStops;
    private long totalScheduledActivities;
    private long totalCuratedCities;
    private long totalCuratedActivities;
    private double averageTripDurationDays;
    private Map<String, Long> topDestinations;
    private Map<String, Long> activityCategoryDistribution;

    public AdminStatsDTO() {
    }

    public AdminStatsDTO(long totalUsers, long totalTrips, long totalStops, long totalScheduledActivities,
                         long totalCuratedCities, long totalCuratedActivities, double averageTripDurationDays,
                         Map<String, Long> topDestinations, Map<String, Long> activityCategoryDistribution) {
        this.totalUsers = totalUsers;
        this.totalTrips = totalTrips;
        this.totalStops = totalStops;
        this.totalScheduledActivities = totalScheduledActivities;
        this.totalCuratedCities = totalCuratedCities;
        this.totalCuratedActivities = totalCuratedActivities;
        this.averageTripDurationDays = averageTripDurationDays;
        this.topDestinations = topDestinations;
        this.activityCategoryDistribution = activityCategoryDistribution;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(long totalTrips) {
        this.totalTrips = totalTrips;
    }

    public long getTotalStops() {
        return totalStops;
    }

    public void setTotalStops(long totalStops) {
        this.totalStops = totalStops;
    }

    public long getTotalScheduledActivities() {
        return totalScheduledActivities;
    }

    public void setTotalScheduledActivities(long totalScheduledActivities) {
        this.totalScheduledActivities = totalScheduledActivities;
    }

    public long getTotalCuratedCities() {
        return totalCuratedCities;
    }

    public void setTotalCuratedCities(long totalCuratedCities) {
        this.totalCuratedCities = totalCuratedCities;
    }

    public long getTotalCuratedActivities() {
        return totalCuratedActivities;
    }

    public void setTotalCuratedActivities(long totalCuratedActivities) {
        this.totalCuratedActivities = totalCuratedActivities;
    }

    public double getAverageTripDurationDays() {
        return averageTripDurationDays;
    }

    public void setAverageTripDurationDays(double averageTripDurationDays) {
        this.averageTripDurationDays = averageTripDurationDays;
    }

    public Map<String, Long> getTopDestinations() {
        return topDestinations;
    }

    public void setTopDestinations(Map<String, Long> topDestinations) {
        this.topDestinations = topDestinations;
    }

    public Map<String, Long> getActivityCategoryDistribution() {
        return activityCategoryDistribution;
    }

    public void setActivityCategoryDistribution(Map<String, Long> activityCategoryDistribution) {
        this.activityCategoryDistribution = activityCategoryDistribution;
    }
}
