package com.globetrotter.controller;

import com.globetrotter.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trips/{tripId}/export")
public class ExportController {

    private final ExportService exportService;

    @Autowired
    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    // GET /api/trips/{tripId}/export/markdown
    @GetMapping(value = "/markdown", produces = MediaType.TEXT_MARKDOWN_VALUE + ";charset=UTF-8")
    public ResponseEntity<String> exportMarkdown(@PathVariable Long tripId) {
        String markdown = exportService.exportItineraryMarkdown(tripId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"itinerary-trip-" + tripId + ".md\"")
                .body(markdown);
    }

    // GET /api/trips/{tripId}/export/text
    @GetMapping(value = "/text", produces = MediaType.TEXT_PLAIN_VALUE + ";charset=UTF-8")
    public ResponseEntity<String> exportText(@PathVariable Long tripId) {
        String markdown = exportService.exportItineraryMarkdown(tripId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"itinerary-trip-" + tripId + ".txt\"")
                .body(markdown);
    }
}
