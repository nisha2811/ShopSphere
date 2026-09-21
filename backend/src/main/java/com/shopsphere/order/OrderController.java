package com.shopsphere.order;

import java.util.List;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.shopsphere.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/orders")
public class OrderController
{
    final OrderService s;
    final UserRepository users;

    public OrderController(OrderService s, UserRepository u)
    {
        this.s = s;
        users = u;
    }

    record CheckoutRequest(@NotBlank @Size(max = 1000) String shippingAddress,
            @NotBlank @Pattern(regexp = "COD|CARD|UPI") String paymentMethod)
    {

    }

    @PostMapping
    Order place(Authentication a, @Valid @RequestBody CheckoutRequest r)
    {
        return s.place(a.getName(), r.shippingAddress(), r.paymentMethod());
    }

    @GetMapping
    List<Order> mine(Authentication a)
    {
        return s.mine(a.getName());
    }

    @GetMapping("/{id}")
    Order get(Authentication a, @PathVariable UUID id)
    {
        return s.get(a.getName(), id);
    }

    @PostMapping("/{id}/cancel")
    Order cancel(Authentication a, @PathVariable UUID id)
    {
        return s.cancel(a.getName(), id);
    }

    @PatchMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    Order status(Authentication a, @PathVariable UUID id, @RequestParam OrderStatus status)
    {
        return s.status(id, status, users.findByEmailIgnoreCase(a.getName()).orElseThrow());
    }
}
