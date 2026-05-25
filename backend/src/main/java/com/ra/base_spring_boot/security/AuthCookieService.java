package com.ra.base_spring_boot.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class AuthCookieService
{
    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    @Value("${jwt.expired.access}")
    private Long accessTtlMs;

    @Value("${jwt.expired.refresh}")
    private Long refreshTtlMs;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    @Value("${app.cookie.path:/}")
    private String cookiePath;

    public void setAccessTokenCookie(HttpServletResponse response, String token)
    {
        addCookie(response, ACCESS_TOKEN_COOKIE, token, (int) (accessTtlMs / 1000));
    }

    public void setRefreshTokenCookie(HttpServletResponse response, String token)
    {
        addCookie(response, REFRESH_TOKEN_COOKIE, token, (int) (refreshTtlMs / 1000));
    }

    public void clearAuthCookies(HttpServletResponse response)
    {
        addCookie(response, ACCESS_TOKEN_COOKIE, "", 0);
        addCookie(response, REFRESH_TOKEN_COOKIE, "", 0);
    }

    public String getRefreshTokenFromRequest(HttpServletRequest request)
    {
        return getCookieValue(request, REFRESH_TOKEN_COOKIE);
    }

    public String getAccessTokenFromRequest(HttpServletRequest request)
    {
        return getCookieValue(request, ACCESS_TOKEN_COOKIE);
    }

    private String getCookieValue(HttpServletRequest request, String name)
    {
        Cookie[] cookies = request.getCookies();
        if (cookies == null)
        {
            return null;
        }
        for (Cookie cookie : cookies)
        {
            if (name.equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isBlank())
            {
                return cookie.getValue();
            }
        }
        return null;
    }

    private void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds)
    {
        Cookie cookie = new Cookie(name, value);
        cookie.setHttpOnly(true);
        cookie.setSecure(cookieSecure);
        cookie.setPath(cookiePath);
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setAttribute("SameSite", sameSite);
        response.addCookie(cookie);
    }
}
