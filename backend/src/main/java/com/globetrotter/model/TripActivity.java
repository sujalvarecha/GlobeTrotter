package com.globetrotter.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "trip_activities")
public class TripActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_stop_id", nullable = false)
    @JsonIgnore
    private TripStop tripStop;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Column(name = "activity_date")
    private LocalDate activityDate;

    @Column(name = "start_time")
    private String startTime; // e.g. "09:00"

    @Column(name = "end_time")
    private String endTime;   // e.g. "12:00"

    private String notes;

    public TripActivity() {
    }

    public TripActivity(TripStop tripStop, Activity activity, LocalDate activityDate, String startTime, String endTime, String notes) {
        this.tripStop = tripStop;
        this.activity = activity;
        this.activityDate = activityDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TripStop getTripStop() {
        return tripStop;
    }

    public void setTripStop(TripStop tripStop) {
        this.tripStop = tripStop;
    }

    public Activity getActivity() {
        return activity;
    }

    public void setActivity(Activity activity) {
        this.activity = activity;
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
