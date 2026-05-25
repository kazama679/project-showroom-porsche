package com.ra.base_spring_boot.service.impl;

import com.ra.base_spring_boot.common.exception.HttpUnAuthorized;
import com.ra.base_spring_boot.entity.RefreshToken;
import com.ra.base_spring_boot.entity.User;
import com.ra.base_spring_boot.repository.IRefreshTokenRepository;
import com.ra.base_spring_boot.security.jwt.JwtProvider;
import com.ra.base_spring_boot.service.IRefreshTokenService;
import com.ra.base_spring_boot.service.TokenPair;
import com.ra.base_spring_boot.common.utils.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements IRefreshTokenService
{
    private final IRefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;

    @Value("${jwt.expired.refresh}")
    private Long refreshTtlMs;

    @Override
    @Transactional
    public String createForUser(User user)
    {
        String raw = TokenHashUtil.generateRawToken();
        RefreshToken entity = RefreshToken.builder()
                .user(user)
                .tokenHash(TokenHashUtil.hashToken(raw))
                .expiresAt(LocalDateTime.now().plusSeconds(refreshTtlMs / 1000))
                .createdAt(LocalDateTime.now())
                .build();
        refreshTokenRepository.save(entity);
        return raw;
    }

    @Override
    @Transactional
    public TokenPair rotate(String rawRefreshToken)
    {
        if (rawRefreshToken == null || rawRefreshToken.isBlank())
        {
            throw new HttpUnAuthorized("Refresh token is required");
        }

        String hash = TokenHashUtil.hashToken(rawRefreshToken);
        RefreshToken active = refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash).orElse(null);

        if (active == null)
        {
            refreshTokenRepository.findByTokenHash(hash).ifPresent(revoked ->
            {
                if (revoked.getRevokedAt() != null && revoked.getUser() != null)
                {
                    refreshTokenRepository.revokeAllActiveForUser(
                            revoked.getUser().getId(),
                            LocalDateTime.now()
                    );
                }
            });
            throw new HttpUnAuthorized("Invalid or expired refresh token");
        }

        if (active.getExpiresAt().isBefore(LocalDateTime.now()))
        {
            active.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(active);
            throw new HttpUnAuthorized("Invalid or expired refresh token");
        }

        User user = active.getUser();
        active.setRevokedAt(LocalDateTime.now());
        refreshTokenRepository.save(active);

        String newRaw = createForUser(user);
        String accessToken = jwtProvider.generateToken(user.getEmail());

        return new TokenPair(accessToken, newRaw);
    }

    @Override
    @Transactional
    public void revokeByRawToken(String rawRefreshToken)
    {
        if (rawRefreshToken == null || rawRefreshToken.isBlank())
        {
            return;
        }

        String hash = TokenHashUtil.hashToken(rawRefreshToken);
        refreshTokenRepository.findByTokenHashAndRevokedAtIsNull(hash).ifPresent(token ->
        {
            token.setRevokedAt(LocalDateTime.now());
            refreshTokenRepository.save(token);
        });
    }
}
