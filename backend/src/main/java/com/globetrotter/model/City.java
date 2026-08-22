package com.globetrotter.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String country;

    private String region;

    @Column(name = "cost_index")
    private Double costIndex; // Scale 1.0 to 5.0 (1 = budget, 5 = luxury)

    private Integer popularity; // Rating scale 1 to 100

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    private Double latitude;
    private Double longitude;

    @OneToMany(mappedBy = "city", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Activity> activities = new ArrayList<>();

    public City() {
    }

    public City(String name, String country, String region, Double costIndex, Integer popularity, String imageUrl) {
        this.name = name;
        this.country = country;
        this.region = region;
        this.costIndex = costIndex;
        this.popularity = popularity;
        this.imageUrl = imageUrl;
    }

    public City(String name, String country, String region, Double costIndex, Integer popularity, String imageUrl, Double latitude, Double longitude) {
        this.name = name;
        this.country = country;
        this.region = region;
        this.costIndex = costIndex;
        this.popularity = popularity;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Helper method to add activity
    public void addActivity(Activity activity) {
        activities.add(activity);
        activity.setCity(this);
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

    public List<Activity> getActivities() { return activities; }
    public void setActivities(List<Activity> activities) { this.activities = activities; }
}
