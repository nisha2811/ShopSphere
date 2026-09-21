package com.shopsphere.order;

import org.springframework.data.jpa.repository.*;
import java.util.*;

public interface OrderRepository extends JpaRepository<Order,UUID>
{
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID id);

    long countByStatus(OrderStatus s);
}
