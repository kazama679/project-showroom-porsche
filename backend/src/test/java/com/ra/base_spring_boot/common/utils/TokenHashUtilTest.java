package com.ra.base_spring_boot.common.utils;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class TokenHashUtilTest
{
    @Test
    void hashToken_isDeterministicSha256Hex()
    {
        String raw = "sample-refresh-token";
        String hash1 = TokenHashUtil.hashToken(raw);
        String hash2 = TokenHashUtil.hashToken(raw);

        assertEquals(hash1, hash2);
        assertEquals(64, hash1.length());
        assertTrue(hash1.matches("[0-9a-f]{64}"));
    }

    @Test
    void generateRawToken_producesUniqueValues()
    {
        String a = TokenHashUtil.generateRawToken();
        String b = TokenHashUtil.generateRawToken();

        assertNotEquals(a, b);
        assertFalse(a.isBlank());
    }
}
