package com.globetrotter.repository;

import com.globetrotter.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByCityId(Long cityId);

    @Query("SELECT a FROM Activity a WHERE a.city.id = :cityId AND LOWER(a.category) = LOWER(:category)")
    List<Activity> findByCityIdAndCategory(@Param("cityId") Long cityId, @Param("category") String category);

    @Query("SELECT a FROM Activity a WHERE LOWER(a.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Activity> searchActivities(@Param("query") String query);
}
