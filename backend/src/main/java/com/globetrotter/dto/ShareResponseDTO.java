package com.globetrotter.dto;

public class ShareResponseDTO {

    private Long tripId;
    private boolean isPublic;
    private String shareToken;
    private String shareUrl;

    public ShareResponseDTO() {
    }

    public ShareResponseDTO(Long tripId, boolean isPublic, String shareToken, String shareUrl) {
        this.tripId = tripId;
        this.isPublic = isPublic;
        this.shareToken = shareToken;
        this.shareUrl = shareUrl;
    }

    public Long getTripId() { return tripId; }
    public void setTripId(Long tripId) { this.tripId = tripId; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean aPublic) { isPublic = aPublic; }

    public String getShareToken() { return shareToken; }
    public void setShareToken(String shareToken) { this.shareToken = shareToken; }

    public String getShareUrl() { return shareUrl; }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }
}
