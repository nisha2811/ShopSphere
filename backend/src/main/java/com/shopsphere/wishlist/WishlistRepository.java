package com.shopsphere.wishlist;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WishlistRepository extends JpaRepository<WishlistItem, UUID>
{
    @EntityGraph(attributePaths = {
            "product",
            "product.category"
    })
    List<WishlistItem> findByUserId(UUID id);

    Optional<WishlistItem> findByUserIdAndProductId(UUID userId, UUID productId);
}