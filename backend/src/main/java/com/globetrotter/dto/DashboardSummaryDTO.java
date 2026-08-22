package com.globetrotter.dto;

import java.util.List;

public class DashboardSummaryDTO {

    private String welcomeMessage;
    private UserDTO user;
    private List<TripResponse> upcomingTrips;
    private List<TripResponse> recentTrips;
    private List<CityDTO> popularDestinations;
    private int totalTrips;
    private int totalDestinations;
    private double totalEstimatedSpendUsd;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(String welcomeMessage, UserDTO user, List<TripResponse> upcomingTrips,
                               List<TripResponse> recentTrips, List<CityDTO> popularDestinations,
                               int totalTrips, int totalDestinations, double totalEstimatedSpendUsd) {
        this.welcomeMessage = welcomeMessage;
        this.user = user;
        this.upcomingTrips = upcomingTrips;
        this.recentTrips = recentTrips;
        this.popularDestinations = popularDestinations;
        this.totalTrips = totalTrips;
        this.totalDestinations = totalDestinations;
        this.totalEstimatedSpendUsd = totalEstimatedSpendUsd;
    }

    public String getWelcomeMessage() {
        return welcomeMessage;
    }

    public void setWelcomeMessage(String welcomeMessage) {
        this.welcomeMessage = welcomeMessage;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public List<TripResponse> getUpcomingTrips() {
        return upcomingTrips;
    }

    public void setUpcomingTrips(List<TripResponse> upcomingTrips) {
        this.upcomingTrips = upcomingTrips;
    }

    public List<TripResponse> getRecentTrips() {
        return recentTrips;
    }

    public void setRecentTrips(List<TripResponse> recentTrips) {
        this.recentTrips = recentTrips;
    }

    public List<CityDTO> getPopularDestinations() {
        return popularDestinations;
    }

    public void setPopularDestinations(List<CityDTO> popularDestinations) {
        this.popularDestinations = popularDestinations;
    }

    public int getTotalTrips() {
        return totalTrips;
    }

    public void setTotalTrips(int totalTrips) {
        this.totalTrips = totalTrips;
    }

    public int getTotalDestinations() {
        return totalDestinations;
    }

    public void setTotalDestinations(int totalDestinations) {
        this.totalDestinations = totalDestinations;
    }

    public double getTotalEstimatedSpendUsd() {
        return totalEstimatedSpendUsd;
    }

    public void setTotalEstimatedSpendUsd(double totalEstimatedSpendUsd) {
        this.totalEstimatedSpendUsd = totalEstimatedSpendUsd;
    }
}
