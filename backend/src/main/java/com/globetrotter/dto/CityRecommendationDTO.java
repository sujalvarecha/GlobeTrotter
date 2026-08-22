package com.globetrotter.dto;

public class CityRecommendationDTO {

    private CityDTO city;
    private int matchScore; // 0 - 100
    private String matchReason;
    private String closestCurrentStop;
    private Double distanceKmFromClosestStop;
    private String suggestedTransit;

    public CityRecommendationDTO() {
    }

    public CityDTO getCity() { return city; }
    public void setCity(CityDTO city) { this.city = city; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getClosestCurrentStop() { return closestCurrentStop; }
    public void setClosestCurrentStop(String closestCurrentStop) { this.closestCurrentStop = closestCurrentStop; }

    public Double getDistanceKmFromClosestStop() { return distanceKmFromClosestStop; }
    public void setDistanceKmFromClosestStop(Double distanceKmFromClosestStop) { this.distanceKmFromClosestStop = distanceKmFromClosestStop; }

    public String getSuggestedTransit() { return suggestedTransit; }
    public void setSuggestedTransit(String suggestedTransit) { this.suggestedTransit = suggestedTransit; }
}
