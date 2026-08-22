package com.globetrotter.dto;

import java.util.List;

public class TripRouteDTO {

    private Long tripId;
    private String tripName;
    private int totalStops;
    private double totalDistanceKm;
    private double totalDistanceMiles;
    private List<WaypointDTO> waypoints;
    private List<RouteLegDTO> legs;

    public TripRouteDTO() {
    }

    // Getters and Setters
    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public String getTripName() { return tripName; }
    public void setTripName(String tripName) { this.tripName = tripName; }

    public int getTotalStops() { return totalStops; }
    public void setTotalStops(int totalStops) { this.totalStops = totalStops; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public double getTotalDistanceMiles() { return totalDistanceMiles; }
    public void setTotalDistanceMiles(double totalDistanceMiles) { this.totalDistanceMiles = totalDistanceMiles; }

    public List<WaypointDTO> getWaypoints() { return waypoints; }
    public void setWaypoints(List<WaypointDTO> waypoints) { this.waypoints = waypoints; }

    public List<RouteLegDTO> getLegs() { return legs; }
    public void setLegs(List<RouteLegDTO> legs) { this.legs = legs; }
}
