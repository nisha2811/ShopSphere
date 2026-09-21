package com.shopsphere.cart;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface CartItemRepository extends JpaRepository<CartItem, UUID>
{
    Optional<CartItem> findByCartIdAndProductId(UUID cart, UUID product);

    List<CartItem> findByCartId(UUID cart);
}
