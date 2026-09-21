package com.shopsphere.user;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.Map;
import java.util.Objects;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController
{
    private final UserRepository repo;

    public UserController(UserRepository repo)
    {
        this.repo = repo;
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication)
    {
        User user = repo.findByEmailIgnoreCase(authentication.getName()).orElseThrow();

        return Map.of(
                "id", user.getId(),
                "firstName", user.getFirstName(),
                "lastName", user.getLastName(),
                "email", user.getEmail(),
                "phone", Objects.toString(user.getPhone(), ""),
                "address", Objects.toString(user.getAddress(), ""),
                "role", user.getRole()
        );
    }

    @PutMapping("/me")
    public Map<String, Object> update(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request)
    {
        User user = repo.findByEmailIgnoreCase(authentication.getName()).orElseThrow();

        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        user.setPhone(normalize(request.phone()));
        user.setAddress(normalize(request.address()));

        repo.save(user);
        return me(authentication);
    }

    private String normalize(String value)
    {
        return value == null ? null : value.trim();
    }
}

record ProfileRequest(
        @NotBlank @Size(max = 60) String firstName,
        @NotBlank @Size(max = 60) String lastName,
        @Pattern(regexp = "(?:\\d{10})?", message = "Phone must contain exactly 10 digits")
        String phone,
        @Size(max = 500) String address)
{
}
