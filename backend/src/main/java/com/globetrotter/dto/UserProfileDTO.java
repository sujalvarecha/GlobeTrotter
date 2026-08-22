package com.globetrotter.dto;

import java.time.LocalDateTime;

public class UserProfileDTO {

    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private String language;
    private Integer totalTripsPlanned;
    private Integer totalDestinationsVisited;
    private LocalDateTime memberSince;

    public UserProfileDTO() {
    }

    public UserProfileDTO(Long id, String name, String email, String profileImage, String language,
                          Integer totalTripsPlanned, Integer totalDestinationsVisited, LocalDateTime memberSince) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.profileImage = profileImage;
        this.language = language;
        this.totalTripsPlanned = totalTripsPlanned;
        this.totalDestinationsVisited = totalDestinationsVisited;
        this.memberSince = memberSince;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Integer getTotalTripsPlanned() {
        return totalTripsPlanned;
    }

    public void setTotalTripsPlanned(Integer totalTripsPlanned) {
        this.totalTripsPlanned = totalTripsPlanned;
    }

    public Integer getTotalDestinationsVisited() {
        return totalDestinationsVisited;
    }

    public void setTotalDestinationsVisited(Integer totalDestinationsVisited) {
        this.totalDestinationsVisited = totalDestinationsVisited;
    }

    public LocalDateTime getMemberSince() {
        return memberSince;
    }

    public void setMemberSince(LocalDateTime memberSince) {
        this.memberSince = memberSince;
    }
}
