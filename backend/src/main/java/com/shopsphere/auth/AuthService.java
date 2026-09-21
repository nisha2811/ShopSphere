package com.shopsphere.auth;

import com.shopsphere.exception.ApiException;
import com.shopsphere.security.JwtService;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService
{
    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final TokenRepository tokens;
    private final EmailService email;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-url}")
    private String frontend;

    public AuthService(
            UserRepository users,
            PasswordEncoder encoder,
            JwtService jwt,
            TokenRepository tokens,
            EmailService email)
    {
        this.users = users;
        this.encoder = encoder;
        this.jwt = jwt;
        this.tokens = tokens;
        this.email = email;
    }

    public long refreshMs()
    {
        return jwt.refreshMs();
    }

    @Transactional
    public Map<String, Object> register(RegisterRequest request)
    {
        if (!request.password().equals(request.confirmPassword()))
        {
            throw new ApiException("Passwords do not match", HttpStatus.BAD_REQUEST);
        }

        String normalizedEmail = request.email().trim().toLowerCase();
        User user = users.findByEmailIgnoreCase(normalizedEmail).orElse(null);

        if (user != null && user.isEmailVerified())
        {
            throw new ApiException("Email is already registered", HttpStatus.CONFLICT);
        }

        if (user == null)
        {
            user = new User();
            user.setEmail(normalizedEmail);
            user.setRole("CUSTOMER");
            user.setActive(true);
        }

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPasswordHash(encoder.encode(request.password()));
        user.setPhone(normalize(request.phone()));
        user.setAddress(normalize(request.address()));
        user.setEmailVerified(false);
        user = users.save(user);

        tokens.deleteByUserIdAndType(user.getId(), "VERIFY");

        String rawToken = newRawToken();
        Token token = new Token(
                user,
                hashToken(rawToken),
                Instant.now().plus(Duration.ofHours(24)),
                "VERIFY"
        );
        tokens.save(token);

        String verificationUrl = frontend + "/verify-email#token=" + rawToken;
        boolean mailSent = email.sendVerification(user, verificationUrl);

        return Map.of(
                "message",
                mailSent
                        ? "Registration successful. Check your email to verify your account."
                        : "Registration successful. Please configure email delivery before verifying this account."
        );
    }

    public Map<String, Object> login(LoginRequest request)
    {
        User user = users.findByEmailIgnoreCase(request.email().trim())
                .orElseThrow(() -> new ApiException(
                        "Invalid email or password",
                        HttpStatus.UNAUTHORIZED));

        if (!encoder.matches(request.password(), user.getPasswordHash()))
        {
            throw new ApiException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        if (!user.isActive())
        {
            throw new ApiException("Your account is inactive", HttpStatus.FORBIDDEN);
        }

        if (!user.isEmailVerified())
        {
            throw new ApiException(
                    "Please verify your email before logging in",
                    HttpStatus.FORBIDDEN);
        }

        return auth(user);
    }

    private Map<String, Object> auth(User user)
    {
        return new LinkedHashMap<>(Map.of(
                "accessToken", jwt.access(user.getEmail(), user.getRole(), user.getTokenVersion()),
                "refreshToken", jwt.refresh(user.getEmail(), user.getRole(), user.getTokenVersion()),
                "user", Map.of(
                        "id", user.getId(),
                        "firstName", user.getFirstName(),
                        "lastName", user.getLastName(),
                        "email", user.getEmail(),
                        "role", user.getRole()
                )
        ));
    }

    public Map<String, Object> refresh(String rawRefreshToken)
    {
        if (rawRefreshToken == null || !jwt.validRefresh(rawRefreshToken))
        {
            throw new ApiException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
        }

        String email = jwt.email(rawRefreshToken);
        User user = users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ApiException(
                        "Invalid refresh token",
                        HttpStatus.UNAUTHORIZED));

        if (!user.isActive() || !user.isEmailVerified())
        {
            throw new ApiException("Account is not active", HttpStatus.FORBIDDEN);
        }

        if (user.getTokenVersion() != jwt.tokenVersion(rawRefreshToken))
        {
            throw new ApiException("Refresh session has expired", HttpStatus.UNAUTHORIZED);
        }

        return auth(user);
    }

    @Transactional
    public Map<String, Object> verify(String rawToken)
    {
        if (rawToken == null || rawToken.isBlank())
        {
            throw new ApiException("Verification token is required", HttpStatus.BAD_REQUEST);
        }

        Token token = tokens.findByTokenHashAndType(hashToken(rawToken), "VERIFY")
                .orElseThrow(() -> new ApiException(
                        "Invalid verification token",
                        HttpStatus.BAD_REQUEST));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now()))
        {
            throw new ApiException(
                    "Verification token is expired or already used",
                    HttpStatus.BAD_REQUEST);
        }

        token.setUsed(true);
        token.getUser().setEmailVerified(true);
        users.save(token.getUser());
        tokens.save(token);

        return Map.of("message", "Email verified successfully");
    }

    @Transactional
    public Map<String, Object> forgot(String emailAddress)
    {
        users.findByEmailIgnoreCase(emailAddress.trim()).ifPresent(user -> {
            tokens.deleteByUserIdAndType(user.getId(), "RESET");

            String rawToken = newRawToken();
            Token token = new Token(
                    user,
                    hashToken(rawToken),
                    Instant.now().plus(Duration.ofMinutes(30)),
                    "RESET"
            );
            tokens.save(token);

            String resetUrl = frontend + "/reset-password#token=" + rawToken;
            email.sendReset(user, resetUrl);
        });

        return Map.of(
                "message",
                "If the email exists, a password reset link has been sent.");
    }

    @Transactional
    public Map<String, Object> reset(ResetRequest request)
    {
        if (!request.password().equals(request.confirmPassword()))
        {
            throw new ApiException("Passwords do not match", HttpStatus.BAD_REQUEST);
        }

        Token token = tokens.findByTokenHashAndType(
                        hashToken(request.token()),
                        "RESET")
                .orElseThrow(() -> new ApiException(
                        "Invalid reset token",
                        HttpStatus.BAD_REQUEST));

        if (token.isUsed() || token.getExpiresAt().isBefore(Instant.now()))
        {
            throw new ApiException(
                    "Reset token is expired or already used",
                    HttpStatus.BAD_REQUEST);
        }

        User user = token.getUser();
        token.setUsed(true);
        user.setPasswordHash(encoder.encode(request.password()));
        user.setTokenVersion(user.getTokenVersion() + 1);

        users.save(user);
        tokens.save(token);

        return Map.of("message", "Password reset successfully");
    }

    @Transactional
    public void deactivateSessions(User user)
    {
        user.setTokenVersion(user.getTokenVersion() + 1);
        users.save(user);
    }

    private String newRawToken()
    {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String rawToken)
    {
        try
        {
            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(
                            MessageDigest.getInstance("SHA-256")
                                    .digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        }
        catch (Exception exception)
        {
            throw new IllegalStateException("Unable to hash authentication token", exception);
        }
    }

    private String normalize(String value)
    {
        return value == null ? null : value.trim();
    }
}
