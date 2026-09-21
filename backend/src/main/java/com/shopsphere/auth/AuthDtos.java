package com.shopsphere.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

record RegisterRequest(
        @NotBlank @Size(max = 60) String firstName,
        @NotBlank @Size(max = 60) String lastName,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$",
                message = "Password must contain upper, lower, number and special character")
        String password,
        @NotBlank String confirmPassword,
        @Pattern(regexp = "(?:\\d{10})?", message = "Phone must contain exactly 10 digits")
        String phone,
        @Size(max = 500) String address)
{
}

record LoginRequest(
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(max = 100) String password)
{
}

record ForgotRequest(
        @NotBlank @Email @Size(max = 255) String email)
{
}

record ResetRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).+$",
                message = "Password must contain upper, lower, number and special character")
        String password,
        @NotBlank String confirmPassword)
{
}
