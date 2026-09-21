package com.shopsphere.audit;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AuditLogRepository extends JpaRepository<AuditLog,UUID>
{
    List<AuditLog> findTop100ByOrderByCreatedAtDesc();
}
