package com.globetrotter.dto;

import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String name;

    private String profileImage;

    private String language;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String name, String profileImage, String language) {
        this.name = name;
        this.profileImage = profileImage;
        this.language = language;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
