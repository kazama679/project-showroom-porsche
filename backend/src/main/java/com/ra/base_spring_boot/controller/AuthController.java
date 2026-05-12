package com.ra.base_spring_boot.controller;

import com.ra.base_spring_boot.dto.ResponseWrapper;
import com.ra.base_spring_boot.dto.req.FormLogin;
import com.ra.base_spring_boot.dto.req.FormRegister;
import com.ra.base_spring_boot.dto.req.VerifyOtpRequest;
import com.ra.base_spring_boot.dto.resp.JwtResponse;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IAuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController
{
    private final IAuthService authService;

    @Value("${jwt.expired.access}")
    private Long jwtExpiredAccess;

    /**
     * @param formLogin FormLogin
     * @apiNote handle login with { email , password }
     * Set JWT into httpOnly cookie and return user info + roles in body (without token)
     */
    @PostMapping("/login")
    public ResponseEntity<?> handleLogin(@Valid @RequestBody FormLogin formLogin, HttpServletResponse response)
    {
        JwtResponse jwtResponse = authService.login(formLogin);

        // Set JWT as httpOnly cookie
        Cookie cookie = new Cookie("accessToken", jwtResponse.getAccessToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production (HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge((int) (jwtExpiredAccess / 1000)); // convert ms to seconds
        response.addCookie(cookie);

        // Return user + roles in body (accessToken is @JsonIgnore so it won't appear)
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(jwtResponse)
                        .build()
        );
    }

    /**
     * @param formRegister FormRegister
     * @apiNote handle register with { fullName , username , email , password }
     */
    @PostMapping("/register")
    public ResponseEntity<?> handleRegister(@Valid @RequestBody FormRegister formRegister)
    {
        authService.register(formRegister);
        return ResponseEntity.created(URI.create("api/v1/auth/register")).body(
                ResponseWrapper.builder()
                        .status(HttpStatus.CREATED)
                        .code(201)
                        .data("Register successfully. Please check your email for OTP verification.")
                        .build()
        );
    }

    /**
     * @param request VerifyOtpRequest
     * @apiNote verify OTP code sent to email
     */
    @PostMapping("/verify")
    public ResponseEntity<?> handleVerifyOtp(@Valid @RequestBody VerifyOtpRequest request)
    {
        authService.verifyOtp(request);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Verify successfully. Your account is now activated.")
                        .build()
        );
    }

    /**
     * @param email user email
     * @apiNote resend OTP code to email
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> handleResendOtp(@RequestParam String email)
    {
        authService.resendOtp(email);
        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("OTP has been resent to your email.")
                        .build()
        );
    }

    /**
     * @apiNote Clear the httpOnly cookie to log the user out
     */
    @PostMapping("/logout")
    public ResponseEntity<?> handleLogout(HttpServletResponse response)
    {
        Cookie cookie = new Cookie("accessToken", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // set true in production (HTTPS)
        cookie.setPath("/");
        cookie.setMaxAge(0); // expire immediately
        response.addCookie(cookie);

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data("Logged out successfully.")
                        .build()
        );
    }

    /**
     * @apiNote Get current authenticated user info from cookie/token
     * Returns user info and roles if authenticated, 401 if not
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser()
    {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser"))
        {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.UNAUTHORIZED)
                            .code(401)
                            .data("Not authenticated")
                            .build()
            );
        }

        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
        Map<String, Object> data = new HashMap<>();
        data.put("user", userDetails.getUser());
        data.put("roles", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toSet()));

        return ResponseEntity.ok().body(
                ResponseWrapper.builder()
                        .status(HttpStatus.OK)
                        .code(200)
                        .data(data)
                        .build()
        );
    }

}
