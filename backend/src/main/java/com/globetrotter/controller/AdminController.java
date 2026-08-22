package com.globetrotter.controller;

import com.globetrotter.dto.AdminStatsDTO;
import com.globetrotter.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // GET /api/admin/stats — Aggregate platform engagement and travel trends
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        return ResponseEntity.ok(adminService.getAdminStatistics());
    }
}
