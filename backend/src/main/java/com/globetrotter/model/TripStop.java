package com.globetrotter.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "trip_stops")
public class TripStop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    @JsonIgnore
    private Trip trip;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id", nullable = false)
    private City city;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "stop_order")
    private Integer stopOrder;

    @OneToMany(mappedBy = "tripStop", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TripActivity> tripActivities = new ArrayList<>();

    public TripStop() {
    }

    public TripStop(Trip trip, City city, LocalDate startDate, LocalDate endDate, Integer stopOrder) {
        this.trip = trip;
        this.city = city;
        this.startDate = startDate;
        this.endDate = endDate;
        this.stopOrder = stopOrder;
    }

    public void addTripActivity(TripActivity tripActivity) {
        tripActivities.add(tripActivity);
        tripActivity.setTripStop(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public City getCity() {
        return city;
    }

    public void setCity(City city) {
        this.city = city;
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

    public List<TripActivity> getTripActivities() {
        return tripActivities;
    }

    public void setTripActivities(List<TripActivity> tripActivities) {
        this.tripActivities = tripActivities;
    }
}
