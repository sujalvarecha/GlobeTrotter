package com.globetrotter.dto;

import com.globetrotter.model.TripStop;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class TripStopDTO {

    private Long id;
    private Long tripId;
    private CityDTO city;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer stopOrder;
    private List<TripActivityDTO> activities;

    public TripStopDTO() {
    }

    public static TripStopDTO fromEntity(TripStop stop) {
        TripStopDTO dto = new TripStopDTO();
        dto.setId(stop.getId());
        dto.setTripId(stop.getTrip() != null ? stop.getTrip().getId() : null);
        dto.setCity(CityDTO.fromEntityWithoutActivities(stop.getCity()));
        dto.setStartDate(stop.getStartDate());
        dto.setEndDate(stop.getEndDate());
        dto.setStopOrder(stop.getStopOrder());
        if (stop.getTripActivities() != null) {
            dto.setActivities(stop.getTripActivities().stream()
                    .map(TripActivityDTO::fromEntity)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public CityDTO getCity() { return city; }
    public void setCity(CityDTO city) { this.city = city; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getStopOrder() { return stopOrder; }
    public void setStopOrder(Integer stopOrder) { this.stopOrder = stopOrder; }

    public List<TripActivityDTO> getActivities() { return activities; }
    public void setActivities(List<TripActivityDTO> activities) { this.activities = activities; }
}
