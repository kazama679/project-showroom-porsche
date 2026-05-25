package com.ra.base_spring_boot.service;

import com.ra.base_spring_boot.entity.User;

public interface IRefreshTokenService
{
    /**
     * Creates a new refresh token for the user (multi-device: does not revoke others).
     *
     * @return raw refresh token value for the httpOnly cookie (never persisted)
     */
    String createForUser(User user);

    /**
     * Validates refresh token, rotates it, and returns new raw refresh + access JWT.
     */
    TokenPair rotate(String rawRefreshToken);

    /**
     * Revokes the refresh token matching the raw cookie value, if present.
     */
    void revokeByRawToken(String rawRefreshToken);
}
