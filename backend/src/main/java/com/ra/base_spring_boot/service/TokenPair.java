package com.ra.base_spring_boot.service;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class TokenPair
{
    private final String accessToken;
    private final String refreshToken;
}
