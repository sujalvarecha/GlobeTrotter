package com.globetrotter.controller;

import com.globetrotter.dto.ShareResponseDTO;
import com.globetrotter.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/share")
public class ShareController {

    private final ShareService shareService;

    @Autowired
    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    // POST /api/trips/{tripId}/share — Enable public sharing
    @PostMapping
    public ResponseEntity<ShareResponseDTO> enableSharing(@PathVariable Long tripId) {
        return ResponseEntity.ok(shareService.enableSharing(tripId));
    }

    // DELETE /api/trips/{tripId}/share — Disable public sharing
    @DeleteMapping
    public ResponseEntity<ShareResponseDTO> disableSharing(@PathVariable Long tripId) {
        return ResponseEntity.ok(shareService.disableSharing(tripId));
    }
}
