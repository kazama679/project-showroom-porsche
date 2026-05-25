# JWT Authentication Flow

This document details the authentication and authorization mechanism between the Next.js frontend and the Spring Boot backend.

## Overview
The system relies on a **state-less JWT architecture** with tokens issued by the backend and stored securely in the client's browser using `httpOnly` cookies. This prevents XSS attacks from extracting the tokens.

## Token Types
1. **Access Token:** Short-lived (e.g., 15 minutes). Proves identity to protected API endpoints.
2. **Refresh Token:** Long-lived (e.g., 7 days). Used to silently obtain a new Access Token when the old one expires. Stored as a hashed value in the database.

## Flow Diagrams

### 1. Login Flow (Initial Authentication)
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend (Auth)
    participant Database

    User->>Frontend: Enter Email & Password
    Frontend->>Backend (Auth): POST /api/v1/auth/login {email, password}
    Backend (Auth)->>Database: Verify Credentials
    Database-->>Backend (Auth): Valid User
    Backend (Auth)->>Backend (Auth): Generate Access Token (15m)
    Backend (Auth)->>Backend (Auth): Generate Refresh Token (7d)
    Backend (Auth)->>Database: Save Hashed Refresh Token
    Backend (Auth)-->>Frontend: Set-Cookie: accessToken (httpOnly) & refreshToken (httpOnly)
    Backend (Auth)-->>Frontend: JSON: User Data + Roles
    Frontend->>Frontend: Save User Data + Roles to sessionStorage
    Frontend-->>User: Redirect to Dashboard/Home
```

### 2. Authenticated Request Flow
```mermaid
sequenceDiagram
    participant Frontend
    participant Backend (Middleware)
    participant Backend (API)

    Frontend->>Backend (Middleware): GET /api/v1/admin/users (with generic Request)
    Note right of Frontend: Browser automatically attaches httpOnly cookies
    Backend (Middleware)->>Backend (Middleware): JwtTokenFilter intercepts request
    Backend (Middleware)->>Backend (Middleware): Extract 'accessToken' from cookie
    Backend (Middleware)->>Backend (Middleware): Validate Token Signature & Expiration
    
    alt Token Valid
        Backend (Middleware)->>Backend (Middleware): Set SecurityContext
        Backend (Middleware)->>Backend (API): Proceed to Endpoint
        Backend (API)-->>Frontend: 200 OK + Data
    else Token Expired/Invalid
        Backend (Middleware)-->>Frontend: 401 Unauthorized
    end
```

### 3. Silent Refresh Flow
```mermaid
sequenceDiagram
    participant Frontend (Axios/Fetch)
    participant Backend (Auth)
    participant Database

    Frontend (Axios/Fetch)->>Frontend (Axios/Fetch): Receives 401 Unauthorized
    Frontend (Axios/Fetch)->>Backend (Auth): POST /api/v1/auth/refresh
    Note right of Frontend (Axios/Fetch): Browser sends both cookies automatically
    Backend (Auth)->>Backend (Auth): Extract 'refreshToken' cookie
    Backend (Auth)->>Database: Look up Refresh Token Hash
    
    alt Refresh Token Valid & Not Expired
        Database-->>Backend (Auth): Token OK
        Backend (Auth)->>Backend (Auth): Generate new Access Token
        Backend (Auth)-->>Frontend (Axios/Fetch): Set-Cookie: new accessToken (httpOnly)
        Frontend (Axios/Fetch)->>Frontend (Axios/Fetch): Retry original failed request
    else Refresh Token Invalid
        Database-->>Backend (Auth): Token Invalid
        Backend (Auth)-->>Frontend (Axios/Fetch): 403 Forbidden
        Frontend (Axios/Fetch)->>Frontend (Axios/Fetch): Clear sessionStorage & Redirect to Login
    end
```

### 4. Logout Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend (Auth)
    participant Database

    User->>Frontend: Click Logout
    Frontend->>Backend (Auth): POST /api/v1/auth/logout
    Backend (Auth)->>Database: Delete Refresh Token for User
    Backend (Auth)-->>Frontend: Set-Cookie: accessToken="" (Max-Age=0) & refreshToken="" (Max-Age=0)
    Frontend->>Frontend: Clear sessionStorage
    Frontend-->>User: Redirect to Login/Home
```
