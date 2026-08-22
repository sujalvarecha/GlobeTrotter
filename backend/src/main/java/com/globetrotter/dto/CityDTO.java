package com.globetrotter.dto;

import com.globetrotter.model.City;
import java.util.List;
import java.util.stream.Collectors;

public class CityDTO {

    private Long id;
    private String name;
    private String country;
    private String region;
    private Double costIndex;
    private Integer popularity;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private List<ActivityDTO> activities;

    public CityDTO() {
    }

    public static CityDTO fromEntity(City city) {
        CityDTO dto = new CityDTO();
        dto.setId(city.getId());
        dto.setName(city.getName());
        dto.setCountry(city.getCountry());
        dto.setRegion(city.getRegion());
        dto.setCostIndex(city.getCostIndex());
        dto.setPopularity(city.getPopularity());
        dto.setImageUrl(city.getImageUrl());
        dto.setLatitude(city.getLatitude());
        dto.setLongitude(city.getLongitude());
        if (city.getActivities() != null) {
            dto.setActivities(city.getActivities().stream().map(ActivityDTO::fromEntity).collect(Collectors.toList()));
        }
        return dto;
    }

    // Lightweight variant used inside TripStopDTO — skips activity list to avoid extra queries
    public static CityDTO fromEntityWithoutActivities(City city) {
        CityDTO dto = new CityDTO();
        dto.setId(city.getId());
        dto.setName(city.getName());
        dto.setCountry(city.getCountry());
        dto.setRegion(city.getRegion());
        dto.setCostIndex(city.getCostIndex());
        dto.setPopularity(city.getPopularity());
        dto.setImageUrl(city.getImageUrl());
        dto.setLatitude(city.getLatitude());
        dto.setLongitude(city.getLongitude());
        return dto;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public Double getCostIndex() { return costIndex; }
    public void setCostIndex(Double costIndex) { this.costIndex = costIndex; }

    public Integer getPopularity() { return popularity; }
    public void setPopularity(Integer popularity) { this.popularity = popularity; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public List<ActivityDTO> getActivities() { return activities; }
    public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }
}
