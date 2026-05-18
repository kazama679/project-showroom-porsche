package com.ra.base_spring_boot.services.impl;

import com.ra.base_spring_boot.dto.req.FormLogin;
import com.ra.base_spring_boot.dto.req.FormRegister;
import com.ra.base_spring_boot.dto.req.VerifyOtpRequest;
import com.ra.base_spring_boot.dto.resp.JwtResponse;
import com.ra.base_spring_boot.exception.HttpBadRequest;
import com.ra.base_spring_boot.model.Role;
import com.ra.base_spring_boot.model.User;
import com.ra.base_spring_boot.model.constants.RoleName;
import com.ra.base_spring_boot.repository.IUserRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.security.principle.MyUserDetails;
import com.ra.base_spring_boot.services.IAuthService;
import com.ra.base_spring_boot.services.IEmailService;
import com.ra.base_spring_boot.services.IRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements IAuthService
{
    private final IRoleService roleService;
    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final RedisTemplate<String, Object> redisTemplate;
    private final IEmailService emailService;

    @Override
    public void register(FormRegister formRegister)
    {
        // Generate OTP 6 digits
        String otp = String.valueOf(
                (int) ((Math.random() * 900000) + 100000)
        );

        Set<Role> roles = new HashSet<>();
        roles.add(roleService.findByRoleName(RoleName.ROLE_USER));

        User user = User.builder()
                .fullName(formRegister.getFullName())
                .username(formRegister.getUsername())
                .email(formRegister.getEmail())
                .password(passwordEncoder.encode(formRegister.getPassword()))
                .status(true)
                .enabled(false) // account chưa xác thực
                .roles(roles)
                .build();

        userRepository.save(user);

        // Save OTP to Redis with TTL 5 minutes
        redisTemplate.opsForValue().set(
                "otp:" + user.getEmail(),
                otp,
                Duration.ofMinutes(5)
        );

        try {
            // Send OTP via email
            emailService.sendOtpEmail(user.getEmail(), otp);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to send OTP email: " + e.getMessage());
            System.out.println(">>> [DEVELOPMENT MODE] OTP CODE FOR EMAIL " + user.getEmail() + " IS: " + otp);
        }
    }

    @Override
    public JwtResponse login(FormLogin formLogin)
    {
        Authentication authentication;
        try
        {
            authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(formLogin.getEmail(), formLogin.getPassword()));
        }
        catch (AuthenticationException e)
        {
            throw new HttpBadRequest("Email or password is incorrect");
        }

        MyUserDetails userDetails = (MyUserDetails) authentication.getPrincipal();
        if (!userDetails.getUser().getStatus())
        {
            throw new HttpBadRequest("your account is blocked");
        }

        // Check if account is verified
        if (!userDetails.getUser().getEnabled())
        {
            throw new HttpBadRequest("Account not verified. Please check your email for OTP.");
        }

        return JwtResponse.builder()
                .accessToken(jwtProvider.generateToken(userDetails.getUsername()))
                .user(userDetails.getUser())
                .roles(userDetails.getAuthorities().stream().map(GrantedAuthority::getAuthority).collect(Collectors.toSet()))
                .build();
    }

    @Override
    public void verifyOtp(VerifyOtpRequest request)
    {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new HttpBadRequest("Email not found"));

        // Get OTP from Redis
        String otpRedis = (String) redisTemplate.opsForValue()
                .get("otp:" + request.getEmail());

        if (otpRedis == null)
        {
            throw new HttpBadRequest("OTP expired. Please request a new one.");
        }

        if (!otpRedis.equals(request.getOtp()))
        {
            throw new HttpBadRequest("OTP invalid");
        }

        // Activate account
        user.setEnabled(true);
        userRepository.save(user);

        // Delete OTP from Redis
        redisTemplate.delete("otp:" + request.getEmail());
    }

    @Override
    public void resendOtp(String email)
    {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new HttpBadRequest("Email not found"));

        if (user.getEnabled())
        {
            throw new HttpBadRequest("Account already verified");
        }

        // Generate new OTP
        String otp = String.valueOf(
                (int) ((Math.random() * 900000) + 100000)
        );

        // Save new OTP to Redis with TTL 5 minutes
        redisTemplate.opsForValue().set(
                "otp:" + email,
                otp,
                Duration.ofMinutes(5)
        );

        try {
            // Send OTP via email
            emailService.sendOtpEmail(email, otp);
        } catch (Exception e) {
            System.err.println("WARNING: Failed to send OTP email: " + e.getMessage());
            System.out.println(">>> [DEVELOPMENT MODE] OTP CODE FOR EMAIL " + email + " IS: " + otp);
        }
    }

}
