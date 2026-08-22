package com.globetrotter.dto;

public class ActivityRecommendationDTO {

    private ActivityDTO activity;
    private int matchScore; // 0 - 100
    private String matchReason;
    private String category;

    public ActivityRecommendationDTO() {
    }

    public ActivityRecommendationDTO(ActivityDTO activity, int matchScore, String matchReason, String category) {
        this.activity = activity;
        this.matchScore = matchScore;
        this.matchReason = matchReason;
        this.category = category;
    }

    public ActivityDTO getActivity() { return activity; }
    public void setActivity(ActivityDTO activity) { this.activity = activity; }

    public int getMatchScore() { return matchScore; }
    public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

    public String getMatchReason() { return matchReason; }
    public void setMatchReason(String matchReason) { this.matchReason = matchReason; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
}
