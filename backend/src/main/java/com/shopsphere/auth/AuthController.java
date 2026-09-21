package com.shopsphere.auth;

import com.shopsphere.common.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController
{
    private static final String REFRESH_COOKIE = "shopsphere_refresh";

    private final AuthService service;

    @Value("${app.cookie.secure:false}")
    private boolean secureCookie;

    @Value("${app.cookie.same-site:Strict}")
    private String sameSite;

    public AuthController(AuthService service)
    {
        this.service = service;
    }

    @PostMapping("/register")
    public ApiResponse<?> register(@Valid @RequestBody RegisterRequest request)
    {
        return ApiResponse.ok(service.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request)
    {
        return authenticatedResponse(service.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<?>> refresh(HttpServletRequest request)
    {
        String refreshToken = extractCookie(request, REFRESH_COOKIE);

        if (refreshToken == null)
        {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, null, "Refresh session not found"));
        }

        return authenticatedResponse(service.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout()
    {
        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/auth")
                .maxAge(0)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .body(ApiResponse.ok(Map.of("message", "Signed out successfully")));
    }

    @PostMapping("/verify-email")
    public ApiResponse<?> verify(@Valid @RequestBody TokenRequest request)
    {
        return ApiResponse.ok(service.verify(request.token()));
    }

    @PostMapping("/forgot-password")
    public ApiResponse<?> forgot(@Valid @RequestBody ForgotRequest request)
    {
        return ApiResponse.ok(service.forgot(request.email()));
    }

    @PostMapping("/reset-password")
    public ApiResponse<?> reset(@Valid @RequestBody ResetRequest request)
    {
        return ApiResponse.ok(service.reset(request));
    }

    private ResponseEntity<ApiResponse<?>> authenticatedResponse(Map<String, Object> authentication)
    {
        String refreshToken = (String) authentication.remove("refreshToken");

        ResponseCookie cookie = ResponseCookie.from(REFRESH_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(secureCookie)
                .sameSite(sameSite)
                .path("/api/auth")
                .maxAge(service.refreshMs() / 1000)
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .body(ApiResponse.ok(authentication));
    }

    private String extractCookie(HttpServletRequest request, String name)
    {
        if (request.getCookies() == null)
        {
            return null;
        }

        for (var cookie : request.getCookies())
        {
            if (name.equals(cookie.getName()))
            {
                return cookie.getValue();
            }
        }

        return null;
    }

    record TokenRequest(@jakarta.validation.constraints.NotBlank String token)
    {
    }
}
