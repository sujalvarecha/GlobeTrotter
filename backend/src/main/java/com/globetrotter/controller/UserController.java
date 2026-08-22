package com.globetrotter.controller;

import com.globetrotter.dto.UpdateProfileRequest;
import com.globetrotter.dto.UserProfileDTO;
import com.globetrotter.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET /api/users/me — Get user profile & personal statistics
    @GetMapping("/me")
    public ResponseEntity<UserProfileDTO> getMyProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    // PUT /api/users/me — Update user profile details
    @PutMapping("/me")
    public ResponseEntity<UserProfileDTO> updateMyProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    // DELETE /api/users/me — Delete account
    @DeleteMapping("/me")
    public ResponseEntity<Map<String, String>> deleteAccount() {
        userService.deleteAccount();
        return ResponseEntity.ok(Map.of("message", "User account and all associated travel plans successfully deleted"));
    }
}
