package com.shopsphere.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface OrderItemRepository extends JpaRepository<OrderItem, UUID>
{
    List<OrderItem> findByOrderId(UUID id);
}
