package com.globetrotter.controller;

import com.globetrotter.dto.PublicTripDTO;
import com.globetrotter.dto.TripResponse;
import com.globetrotter.service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/trips")
public class PublicTripController {

    private final ShareService shareService;

    @Autowired
    public PublicTripController(ShareService shareService) {
        this.shareService = shareService;
    }

    // GET /api/public/trips/{shareToken} — View public trip without login
    @GetMapping("/{shareToken}")
    public ResponseEntity<PublicTripDTO> getPublicTrip(@PathVariable String shareToken) {
        return ResponseEntity.ok(shareService.getPublicTrip(shareToken));
    }

    // POST /api/public/trips/{shareToken}/fork — Clone/fork public trip into user's account
    @PostMapping("/{shareToken}/fork")
    public ResponseEntity<TripResponse> forkTrip(@PathVariable String shareToken) {
        return new ResponseEntity<>(shareService.forkTrip(shareToken), HttpStatus.CREATED);
    }
}
