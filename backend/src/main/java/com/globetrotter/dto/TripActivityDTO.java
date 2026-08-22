package com.globetrotter.dto;

import com.globetrotter.model.TripActivity;
import java.time.LocalDate;

public class TripActivityDTO {

    private Long id;
    private Long tripStopId;
    private ActivityDTO activity;
    private LocalDate activityDate;
    private String startTime;
    private String endTime;
    private String notes;

    public TripActivityDTO() {
    }

    public static TripActivityDTO fromEntity(TripActivity ta) {
        TripActivityDTO dto = new TripActivityDTO();
        dto.setId(ta.getId());
        dto.setTripStopId(ta.getTripStop() != null ? ta.getTripStop().getId() : null);
        dto.setActivity(ActivityDTO.fromEntity(ta.getActivity()));
        dto.setActivityDate(ta.getActivityDate());
        dto.setStartTime(ta.getStartTime());
        dto.setEndTime(ta.getEndTime());
        dto.setNotes(ta.getNotes());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripStopId() { return tripStopId; }
    public void setTripStopId(Long tripStopId) { this.tripStopId = tripStopId; }

    public ActivityDTO getActivity() { return activity; }
    public void setActivity(ActivityDTO activity) { this.activity = activity; }

    public LocalDate getActivityDate() { return activityDate; }
    public void setActivityDate(LocalDate activityDate) { this.activityDate = activityDate; }

    public String getStartTime() { return startTime; }
    public void setStartTime(String startTime) { this.startTime = startTime; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
