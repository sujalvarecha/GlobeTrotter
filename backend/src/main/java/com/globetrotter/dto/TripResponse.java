package com.globetrotter.dto;

import com.globetrotter.model.Trip;
import com.globetrotter.model.TripStop;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class TripResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverImage;
    private Double targetBudget;
    private Boolean isPublic;
    private String shareToken;
    private Integer stopsCount;
    private Integer totalDays;
    private List<TripStopDTO> stops;
    private LocalDateTime createdAt;

    public TripResponse() {
    }

    public static TripResponse fromEntity(Trip trip) {
        TripResponse dto = new TripResponse();
        dto.setId(trip.getId());
        dto.setName(trip.getName());
        dto.setDescription(trip.getDescription());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setCoverImage(trip.getCoverImage());
        dto.setTargetBudget(trip.getTargetBudget());
        dto.setIsPublic(trip.getIsPublic());
        dto.setShareToken(trip.getShareToken());
        dto.setCreatedAt(trip.getCreatedAt());

        if (trip.getStartDate() != null && trip.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(trip.getStartDate(), trip.getEndDate()) + 1;
            dto.setTotalDays(Math.max(1, (int) days));
        } else {
            dto.setTotalDays(1);
        }

        if (trip.getStops() != null && !trip.getStops().isEmpty()) {
            dto.setStopsCount(trip.getStops().size());
            List<TripStopDTO> stopDTOs = trip.getStops().stream()
                    .sorted(Comparator.comparingInt(TripStop::getStopOrder))
                    .map(TripStopDTO::fromEntity)
                    .collect(Collectors.toList());
            dto.setStops(stopDTOs);
        } else {
            dto.setStopsCount(0);
            dto.setStops(Collections.emptyList());
        }

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public String getCoverImage() {
        return coverImage;
    }

    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }

    public Double getTargetBudget() {
        return targetBudget;
    }

    public void setTargetBudget(Double targetBudget) {
        this.targetBudget = targetBudget;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getShareToken() {
        return shareToken;
    }

    public void setShareToken(String shareToken) {
        this.shareToken = shareToken;
    }

    public Integer getStopsCount() {
        return stopsCount;
    }

    public void setStopsCount(Integer stopsCount) {
        this.stopsCount = stopsCount;
    }

    public Integer getTotalDays() {
        return totalDays;
    }

    public void setTotalDays(Integer totalDays) {
        this.totalDays = totalDays;
    }

    public List<TripStopDTO> getStops() {
        return stops;
    }

    public void setStops(List<TripStopDTO> stops) {
        this.stops = stops;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
