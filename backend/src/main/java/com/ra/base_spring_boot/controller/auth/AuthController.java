package com.ra.base_spring_boot.controller.auth;

import com.ra.base_spring_boot.dto.response.ResponseWrapper;
import com.ra.base_spring_boot.dto.request.FormLogin;
import com.ra.base_spring_boot.dto.request.FormRegister;
import com.ra.base_spring_boot.dto.request.VerifyOtpRequest;
import com.ra.base_spring_boot.dto.response.JwtResponse;
import com.ra.base_spring_boot.common.exception.HttpUnAuthorized;
import com.ra.base_spring_boot.security.AuthCookieService;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.service.IAuthService;
import com.ra.base_spring_boot.service.IRefreshTokenService;
import com.ra.base_spring_boot.service.TokenPair;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    private final IRefreshTokenService refreshTokenService;
    private final AuthCookieService authCookieService;

    /**
     * @param formLogin FormLogin
     * @apiNote handle login with { email , password }
     * Set JWT into httpOnly cookie and return user info + roles in body (without token)
     */
    @PostMapping("/login")
    public ResponseEntity<?> handleLogin(@Valid @RequestBody FormLogin formLogin, HttpServletResponse response)
    {
        JwtResponse jwtResponse = authService.login(formLogin);

        String refreshRaw = refreshTokenService.createForUser(jwtResponse.getUser());
        authCookieService.setAccessTokenCookie(response, jwtResponse.getAccessToken());
        authCookieService.setRefreshTokenCookie(response, refreshRaw);

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
     * @apiNote Issue new access + refresh cookies using refreshToken cookie
     */
    @PostMapping("/refresh")
    public ResponseEntity<?> handleRefresh(HttpServletRequest request, HttpServletResponse response)
    {
        String rawRefresh = authCookieService.getRefreshTokenFromRequest(request);
        try
        {
            TokenPair tokens = refreshTokenService.rotate(rawRefresh);
            authCookieService.setAccessTokenCookie(response, tokens.getAccessToken());
            authCookieService.setRefreshTokenCookie(response, tokens.getRefreshToken());

            return ResponseEntity.ok().body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.OK)
                            .code(200)
                            .data("Token refreshed")
                            .build()
            );
        }
        catch (HttpUnAuthorized ex)
        {
            authCookieService.clearAuthCookies(response);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                    ResponseWrapper.builder()
                            .status(HttpStatus.UNAUTHORIZED)
                            .code(401)
                            .data(ex.getMessage())
                            .build()
            );
        }
    }

    /**
     * @apiNote Clear cookies and revoke current refresh token
     */
    @PostMapping("/logout")
    public ResponseEntity<?> handleLogout(HttpServletRequest request, HttpServletResponse response)
    {
        String rawRefresh = authCookieService.getRefreshTokenFromRequest(request);
        refreshTokenService.revokeByRawToken(rawRefresh);
        authCookieService.clearAuthCookies(response);

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
