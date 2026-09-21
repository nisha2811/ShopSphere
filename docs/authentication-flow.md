# Authentication flow

Registration creates an unverified CUSTOMER and a 24-hour verification token. Verification marks the account verified. Login checks email/password, active status and verification, then returns access and refresh JWTs. Forgot-password creates a 30-minute one-time reset token; reset replaces the BCrypt hash.
