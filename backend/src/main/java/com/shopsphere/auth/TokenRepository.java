package com.shopsphere.auth;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TokenRepository extends JpaRepository<Token, UUID>
{
    Optional<Token> findByTokenHashAndType(String tokenHash, String type);

    void deleteByUserIdAndType(UUID userId, String type);
}
