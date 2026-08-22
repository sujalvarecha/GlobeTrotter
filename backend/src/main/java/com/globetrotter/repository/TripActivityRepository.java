package com.globetrotter.repository;

import com.globetrotter.model.TripActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripActivityRepository extends JpaRepository<TripActivity, Long> {
    List<TripActivity> findByTripStopIdOrderByActivityDateAscStartTimeAsc(Long tripStopId);
}
