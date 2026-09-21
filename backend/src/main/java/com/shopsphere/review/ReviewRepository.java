package com.shopsphere.review;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface ReviewRepository extends JpaRepository<Review, UUID>
{
    List<Review> findByProductIdOrderByCreatedAtDesc(UUID id);

    boolean existsByUserIdAndProductId(UUID u, UUID p);
}
