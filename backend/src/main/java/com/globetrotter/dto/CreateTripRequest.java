package com.globetrotter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class CreateTripRequest {

    @NotBlank(message = "Trip name is required")
    private String name;

    private String description;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    private String coverImage;

    private Double targetBudget;

    public CreateTripRequest() {
    }

    public CreateTripRequest(String name, String description, LocalDate startDate, LocalDate endDate, String coverImage) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.coverImage = coverImage;
    }

    public CreateTripRequest(String name, String description, LocalDate startDate, LocalDate endDate, String coverImage, Double targetBudget) {
        this.name = name;
        this.description = description;
        this.startDate = startDate;
        this.endDate = endDate;
        this.coverImage = coverImage;
        this.targetBudget = targetBudget;
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
}
