package com.shopsphere.security;

import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtFilter extends OncePerRequestFilter
{
    private final JwtService jwt;
    private final UserRepository users;

    public JwtFilter(JwtService jwt, UserRepository users)
    {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain chain) throws ServletException, IOException
    {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer "))
        {
            String token = header.substring(7).trim();

            if (jwt.validAccess(token))
            {
                try
                {
                    String email = jwt.email(token);

                    users.findByEmailIgnoreCase(email).ifPresent(user -> {
                        if (user.isActive()
                                && user.isEmailVerified()
                                && user.getTokenVersion() == jwt.tokenVersion(token))
                        {
                            SecurityContextHolder.getContext().setAuthentication(
                                    new UsernamePasswordAuthenticationToken(
                                            user.getEmail(),
                                            null,
                                            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                                    )
                            );
                        }
                    });
                }
                catch (Exception ignored)
                {
                    // Invalid authentication is handled by Spring Security.
                }
            }
        }

        chain.doFilter(request, response);
    }
}
