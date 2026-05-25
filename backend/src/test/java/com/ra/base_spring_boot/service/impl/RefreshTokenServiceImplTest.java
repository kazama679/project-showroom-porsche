package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.common.exception.HttpUnAuthorized;
import com.ra.base_spring_boot.entity.RefreshToken;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.repository.IRefreshTokenRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.service.TokenPair;
import com.ra.base_spring_boot.common.utils.TokenHashUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest
{
    @Mock
    private IRefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtProvider jwtProvider;

    @InjectMocks
    private RefreshTokenServiceImpl refreshTokenService;

    private User user;

    @BeforeEach
    void setUp()
    {
        ReflectionTestUtils.setField(refreshTokenService, "refreshTtlMs", 604800000L);
        user = User.builder().id(1L).email("admin@test.local").fullName("Admin").build();
    }

    @Test
    void createForUser_persistsHashNotRawToken()
    {
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        String raw = refreshTokenService.createForUser(user);

        assertNotNull(raw);
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(refreshTokenRepository).save(captor.capture());
        assertEquals(TokenHashUtil.hashToken(raw), captor.getValue().getTokenHash());
        assertNotEquals(raw, captor.getValue().getTokenHash());
    }

    @Test
    void rotate_validToken_revokesOldAndReturnsNewPair()
    {
        String raw = "test-refresh-token-value";
        RefreshToken active = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHashUtil.hashToken(raw))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .createdAt(LocalDateTime.now())
                .build();

        when(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(TokenHashUtil.hashToken(raw)))
                .thenReturn(Optional.of(active));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtProvider.generateToken(user.getEmail())).thenReturn("new-access-jwt");

        TokenPair pair = refreshTokenService.rotate(raw);

        assertEquals("new-access-jwt", pair.getAccessToken());
        assertNotNull(pair.getRefreshToken());
        assertNotEquals(raw, pair.getRefreshToken());
        assertNotNull(active.getRevokedAt());
        verify(refreshTokenRepository, times(2)).save(any(RefreshToken.class));
    }

    @Test
    void rotate_expiredToken_returns401()
    {
        String raw = "expired-token";
        RefreshToken expired = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHashUtil.hashToken(raw))
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        when(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(TokenHashUtil.hashToken(raw)))
                .thenReturn(Optional.of(expired));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        assertThrows(HttpUnAuthorized.class, () -> refreshTokenService.rotate(raw));
        assertNotNull(expired.getRevokedAt());
    }

    @Test
    void rotate_reusedRevokedToken_revokesAllActiveForUser()
    {
        String raw = "reused-revoked-token";
        RefreshToken revoked = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHashUtil.hashToken(raw))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .createdAt(LocalDateTime.now())
                .revokedAt(LocalDateTime.now().minusHours(1))
                .build();

        when(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(TokenHashUtil.hashToken(raw)))
                .thenReturn(Optional.empty());
        when(refreshTokenRepository.findByTokenHash(TokenHashUtil.hashToken(raw)))
                .thenReturn(Optional.of(revoked));

        assertThrows(HttpUnAuthorized.class, () -> refreshTokenService.rotate(raw));

        verify(refreshTokenRepository).revokeAllActiveForUser(eq(1L), any(LocalDateTime.class));
    }

    @Test
    void revokeByRawToken_blankToken_isNoOp()
    {
        refreshTokenService.revokeByRawToken(null);
        refreshTokenService.revokeByRawToken("  ");
        verifyNoInteractions(refreshTokenRepository);
    }

    @Test
    void revokeByRawToken_activeToken_setsRevokedAt()
    {
        String raw = "logout-token";
        RefreshToken active = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHashUtil.hashToken(raw))
                .expiresAt(LocalDateTime.now().plusDays(1))
                .createdAt(LocalDateTime.now())
                .build();

        when(refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(TokenHashUtil.hashToken(raw)))
                .thenReturn(Optional.of(active));
        when(refreshTokenRepository.save(any(RefreshToken.class))).thenAnswer(inv -> inv.getArgument(0));

        refreshTokenService.revokeByRawToken(raw);

        assertNotNull(active.getRevokedAt());
        verify(refreshTokenRepository).save(active);
    }
}
