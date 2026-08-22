package com.globetrotter.dto;

import java.util.List;

public class ReorderStopsRequest {

    // List of stop IDs in the desired new order
    private List<Long> stopIds;

    public ReorderStopsRequest() {
    }

    public List<Long> getStopIds() {
        return stopIds;
    }

    public void setStopIds(List<Long> stopIds) {
        this.stopIds = stopIds;
    }
}
