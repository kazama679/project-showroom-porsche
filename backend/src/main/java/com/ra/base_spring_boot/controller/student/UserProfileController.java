package com.ra.base_spring_boot.controller.student;

import com.ra.base_spring_boot.dto.request.ChangePasswordRequest;
import com.ra.base_spring_boot.dto.request.UpdateProfileRequest;
import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.common.exception.HttpBadRequest;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new HttpBadRequest("Not authenticated");
        }
        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
        return userDetails.getUser();
    }

    /**
     * GET /api/v1/user/profile
     * Returns the full profile of the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<?> getProfile() {
        User user = getCurrentUser();
        // Reload from DB to get latest data
    User freshUser = userRepository.findById(user.getId())
                .orElseThrow(() -> new HttpBadRequest("User not found"));

        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .code(200)
                        .status(HttpStatus.OK)
                        .data(freshUser)
                        .build()
        );
    }

    /**
     * PUT /api/v1/user/profile
     * Updates basic profile info: fullName, phone, birthDate, address, city, country
     */
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = getCurrentUser();
        User target = userRepository.findById(user.getId())
                .orElseThrow(() -> new HttpBadRequest("User not found"));

        target.setFullName(request.getFullName());
        target.setPhone(request.getPhone());
        target.setBirthDate(request.getBirthDate());
        target.setAddress(request.getAddress());
        target.setCity(request.getCity());
        target.setCountry(request.getCountry());

        User saved = userRepository.save(target);

        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .code(200)
                        .status(HttpStatus.OK)
                        .message("Profile updated successfully")
                        .data(saved)
                        .build()
        );
    }

    /**
     * PUT /api/v1/user/profile/change-password
     * Changes the user's password after verifying the current one.
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = getCurrentUser();
        User target = userRepository.findById(user.getId())
                .orElseThrow(() -> new HttpBadRequest("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), target.getPassword())) {
            throw new HttpBadRequest("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new HttpBadRequest("New password and confirm password do not match");
        }

        target.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(target);

        return ResponseEntity.ok(
                ResponseWrapper.builder()
                        .code(200)
                        .status(HttpStatus.OK)
                        .message("Password changed successfully")
                        .data("Password changed successfully")
                        .build()
        );
    }
}
