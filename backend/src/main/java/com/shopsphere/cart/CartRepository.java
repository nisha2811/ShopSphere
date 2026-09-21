package com.shopsphere.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CartRepository extends JpaRepository<Cart,UUID>
{
    Optional<Cart> findByUserId(UUID id);
}
