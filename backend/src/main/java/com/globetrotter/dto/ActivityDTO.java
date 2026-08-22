package com.globetrotter.dto;

import com.globetrotter.model.Activity;

public class ActivityDTO {

    private Long id;
    private Long cityId;
    private String cityName;
    private String name;
    private String description;
    private String category;
    private Integer durationMinutes;
    private Double estimatedCost;
    private String imageUrl;

    public ActivityDTO() {
    }

    public static ActivityDTO fromEntity(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        if (activity.getCity() != null) {
            dto.setCityId(activity.getCity().getId());
            dto.setCityName(activity.getCity().getName());
        }
        dto.setName(activity.getName());
        dto.setDescription(activity.getDescription());
        dto.setCategory(activity.getCategory());
        dto.setDurationMinutes(activity.getDurationMinutes());
        dto.setEstimatedCost(activity.getEstimatedCost());
        dto.setImageUrl(activity.getImageUrl());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
    }

    public String getCityName() {
        return cityName;
    }

    public void setCityName(String cityName) {
        this.cityName = cityName;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Double getEstimatedCost() {
        return estimatedCost;
    }

    public void setEstimatedCost(Double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
