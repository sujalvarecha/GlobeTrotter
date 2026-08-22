package com.globetrotter.dto;

public class DayActivityItemDTO {

    private Long id;
    private Long activityId;
    private String activityName;
    private String category;
    private String imageUrl;
    private String startTime;
    private String endTime;
    private Integer durationMinutes;
    private Double estimatedCostUsd;
    private String notes;

    public DayActivityItemDTO() {
    }

    public DayActivityItemDTO(Long id, Long activityId, String activityName, String category, String imageUrl,
                              String startTime, String endTime, Integer durationMinutes, Double estimatedCostUsd, String notes) {
        this.id = id;
        this.activityId = activityId;
        this.activityName = activityName;
        this.category = category;
        this.imageUrl = imageUrl;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.estimatedCostUsd = estimatedCostUsd;
        this.notes = notes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long activityId) {
        this.activityId = activityId;
    }

    public String getActivityName() {
        return activityName;
    }

    public void setActivityName(String activityName) {
        this.activityName = activityName;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getEstimatedCostUsd() {
        return estimatedCostUsd;
    }

    public void setEstimatedCostUsd(Double estimatedCostUsd) {
        this.estimatedCostUsd = estimatedCostUsd;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
