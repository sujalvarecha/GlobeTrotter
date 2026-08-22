package com.globetrotter.dto;

import com.globetrotter.model.Trip;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class PublicTripDTO {

    private Long id;
    private String name;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private String coverImage;
    private String creatorName;
    private String shareToken;
    private List<TripStopDTO> stops;

    public PublicTripDTO() {
    }

    public static PublicTripDTO fromEntity(Trip trip) {
        PublicTripDTO dto = new PublicTripDTO();
        dto.setId(trip.getId());
        dto.setName(trip.getName());
        dto.setDescription(trip.getDescription());
        dto.setStartDate(trip.getStartDate());
        dto.setEndDate(trip.getEndDate());
        dto.setCoverImage(trip.getCoverImage());
        dto.setShareToken(trip.getShareToken());
        if (trip.getUser() != null) {
            dto.setCreatorName(trip.getUser().getName());
        }
        if (trip.getStops() != null) {
            dto.setStops(trip.getStops().stream()
                    .map(TripStopDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getCreatorName() { return creatorName; }
    public void setCreatorName(String creatorName) { this.creatorName = creatorName; }

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }

    public List<TripStopDTO> getStops() { return stops; }
    public void setStops(List<TripStopDTO> stops) { this.stops = stops; }
}
