package com.shopsphere.audit;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController
{
    final AuditLogRepository r;

    public AuditController(AuditLogRepository r)
    {
        this.r = r;
    }

    @GetMapping
    List<AuditLog> all()
    {
        return r.findTop100ByOrderByCreatedAtDesc();
    }
}
