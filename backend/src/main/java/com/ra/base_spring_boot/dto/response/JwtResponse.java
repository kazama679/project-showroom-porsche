package com.ra.base_spring_boot.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.ra.base_spring_boot.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Builder
public class JwtResponse
{
    @JsonIgnore
    private String accessToken;

    @JsonIgnore
    private final String type = "Bearer";
    @JsonIgnoreProperties({"roles","password"})
    private User user;
    private Set<String> roles;
}

