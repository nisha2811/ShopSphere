package com.shopsphere.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface UserRepository extends JpaRepository<User,UUID>
{
    Optional<User> findByEmailIgnoreCase(String email);

    long countByRole(String role);
}
