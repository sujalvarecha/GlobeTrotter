package com.globetrotter.dto;

import java.util.List;

public class RouteLegDTO {

    private int legIndex;
    private Long fromStopId;
    private String fromCity;
    private String fromCountry;
    private Double fromLatitude;
    private Double fromLongitude;

    private Long toStopId;
    private String toCity;
    private String toCountry;
    private Double toLatitude;
    private Double toLongitude;

    private double distanceKm;
    private double distanceMiles;
    private String recommendedTransport; // "Flight", "High-Speed Rail", "Drive", "Ferry"
    private String estimatedTransitTime; // "2 hrs 15 mins"
    private double estimatedTransitCostUsd;

    private List<List<Double>> polylineCoordinates; // [[lat, lng], [lat, lng]]

    public RouteLegDTO() {
    }

    // Getters and Setters
    public int getLegIndex() { return legIndex; }
    public void setLegIndex(int legIndex) { this.legIndex = legIndex; }

    public Long getFromStopId() { return fromStopId; }
    public void setFromStopId(Long fromStopId) { this.fromStopId = fromStopId; }

    public String getFromCity() { return fromCity; }
    public void setFromCity(String fromCity) { this.fromCity = fromCity; }

    public String getFromCountry() { return fromCountry; }
    public void setFromCountry(String fromCountry) { this.fromCountry = fromCountry; }

    public Double getFromLatitude() { return fromLatitude; }
    public void setFromLatitude(Double fromLatitude) { this.fromLatitude = fromLatitude; }

    public Double getFromLongitude() { return fromLongitude; }
    public void setFromLongitude(Double fromLongitude) { this.fromLongitude = fromLongitude; }

    public Long getToStopId() { return toStopId; }
    public void setToStopId(Long toStopId) { this.toStopId = toStopId; }

    public String getToCity() { return toCity; }
    public void setToCity(String toCity) { this.toCity = toCity; }

    public String getToCountry() { return toCountry; }
    public void setToCountry(String toCountry) { this.toCountry = toCountry; }

    public Double getToLatitude() { return toLatitude; }
    public void setToLatitude(Double toLatitude) { this.toLatitude = toLatitude; }

    public Double getToLongitude() { return toLongitude; }
    public void setToLongitude(Double toLongitude) { this.toLongitude = toLongitude; }

    public double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(double distanceKm) { this.distanceKm = distanceKm; }

    public double getDistanceMiles() { return distanceMiles; }
    public void setDistanceMiles(double distanceMiles) { this.distanceMiles = distanceMiles; }

    public String getRecommendedTransport() { return recommendedTransport; }
    public void setRecommendedTransport(String recommendedTransport) { this.recommendedTransport = recommendedTransport; }

    public String getEstimatedTransitTime() { return estimatedTransitTime; }
    public void setEstimatedTransitTime(String estimatedTransitTime) { this.estimatedTransitTime = estimatedTransitTime; }

    public double getEstimatedTransitCostUsd() { return estimatedTransitCostUsd; }
    public void setEstimatedTransitCostUsd(double estimatedTransitCostUsd) { this.estimatedTransitCostUsd = estimatedTransitCostUsd; }

    public List<List<Double>> getPolylineCoordinates() { return polylineCoordinates; }
    public void setPolylineCoordinates(List<List<Double>> polylineCoordinates) { this.polylineCoordinates = polylineCoordinates; }
}
