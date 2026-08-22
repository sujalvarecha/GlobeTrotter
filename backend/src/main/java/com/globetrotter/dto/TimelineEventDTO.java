package com.globetrotter.dto;

import java.time.LocalDate;

public class TimelineEventDTO {

    private String id;
    private int dayNumber;
    private LocalDate date;
    private String time;
    private String title;
    private String eventType; // "ARRIVAL", "ACTIVITY", "DEPARTURE", "TRANSIT"
    private String category;
    private String location;
    private Double costUsd;
    private String notes;
    private String imageUrl;

    public TimelineEventDTO() {
    }

    public TimelineEventDTO(String id, int dayNumber, LocalDate date, String time, String title,
                            String eventType, String category, String location, Double costUsd,
                            String notes, String imageUrl) {
        this.id = id;
        this.dayNumber = dayNumber;
        this.date = date;
        this.time = time;
        this.title = title;
        this.eventType = eventType;
        this.category = category;
        this.location = location;
        this.costUsd = costUsd;
        this.notes = notes;
        this.imageUrl = imageUrl;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getDayNumber() {
        return dayNumber;
    }

    public void setDayNumber(int dayNumber) {
        this.dayNumber = dayNumber;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getCostUsd() {
        return costUsd;
    }

    public void setCostUsd(Double costUsd) {
        this.costUsd = costUsd;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
