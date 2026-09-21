package com.shopsphere.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService
{
    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.access-expiration-ms}")
    private long accessExpiration;

    @Value("${app.jwt.refresh-expiration-ms}")
    private long refreshExpiration;

    private SecretKey key()
    {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String access(String email, String role, int tokenVersion)
    {
        return create(email, role, tokenVersion, accessExpiration, "ACCESS");
    }

    public String refresh(String email, String role, int tokenVersion)
    {
        return create(email, role, tokenVersion, refreshExpiration, "REFRESH");
    }

    private String create(
            String email,
            String role,
            int tokenVersion,
            long ttl,
            String type)
    {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .claim("type", type)
                .claim("ver", tokenVersion)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + ttl))
                .signWith(key())
                .compact();
    }

    public Claims parse(String token)
    {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validAccess(String token)
    {
        return validType(token, "ACCESS");
    }

    public boolean validRefresh(String token)
    {
        return validType(token, "REFRESH");
    }

    private boolean validType(String token, String expectedType)
    {
        try
        {
            return expectedType.equals(parse(token).get("type", String.class));
        }
        catch (Exception ignored)
        {
            return false;
        }
    }

    public String email(String token)
    {
        return parse(token).getSubject();
    }

    public String role(String token)
    {
        return parse(token).get("role", String.class);
    }

    public int tokenVersion(String token)
    {
        Integer version = parse(token).get("ver", Integer.class);
        return version == null ? -1 : version;
    }

    public long refreshMs()
    {
        return refreshExpiration;
    }
}
