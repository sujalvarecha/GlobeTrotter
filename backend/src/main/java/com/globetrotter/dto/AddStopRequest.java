package com.globetrotter.dto;

import java.time.LocalDate;

public class AddStopRequest {

    private Long cityId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer stopOrder; // optional; auto-assigned if null

    public AddStopRequest() {
    }

    public AddStopRequest(Long cityId, LocalDate startDate, LocalDate endDate, Integer stopOrder) {
        this.cityId = cityId;
        this.startDate = startDate;
        this.endDate = endDate;
        this.stopOrder = stopOrder;
    }

    public Long getCityId() {
        return cityId;
    }

    public void setCityId(Long cityId) {
        this.cityId = cityId;
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

    public Integer getStopOrder() {
        return stopOrder;
    }

    public void setStopOrder(Integer stopOrder) {
        this.stopOrder = stopOrder;
    }
}
