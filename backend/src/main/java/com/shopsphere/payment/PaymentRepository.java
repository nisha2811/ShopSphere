package com.shopsphere.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface PaymentRepository extends JpaRepository<Payment, UUID>
{
    Optional<Payment> findByOrderId(UUID id);
}
