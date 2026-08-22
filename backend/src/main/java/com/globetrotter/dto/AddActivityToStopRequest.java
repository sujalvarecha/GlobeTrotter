package com.globetrotter.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class AddActivityToStopRequest {

    @NotNull(message = "Activity ID is required")
    private Long activityId;

    private LocalDate activityDate;
    private String startTime; // "09:00"
    private String endTime;   // "11:00"
    private String notes;

    public AddActivityToStopRequest() {
    }

    public Long getActivityId() {
        return activityId;
    }

    public void setActivityId(Long activityId) {
        this.activityId = activityId;
    }

    public LocalDate getActivityDate() {
        return activityDate;
    }

    public void setActivityDate(LocalDate activityDate) {
        this.activityDate = activityDate;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
