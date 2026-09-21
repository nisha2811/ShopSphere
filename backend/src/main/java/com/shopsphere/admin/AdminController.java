package com.shopsphere.admin;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.shopsphere.order.Order;
import com.shopsphere.order.OrderRepository;
import com.shopsphere.order.OrderStatus;
import com.shopsphere.auth.AuthService;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController
{
    private final UserRepository users;
    private final ProductRepository products;
    private final OrderRepository orders;
    private final AuthService authService;

    public AdminController(
            UserRepository users,
            ProductRepository products,
            OrderRepository orders,
            AuthService authService)
    {
        this.users = users;
        this.products = products;
        this.orders = orders;
        this.authService = authService;
    }

    @GetMapping("/dashboard")
    Map<String, Object> dashboard()
    {
        return Map.of(
                "users", users.countByRole("CUSTOMER"),
                "products", products.countByActiveTrue(),
                "orders", orders.count(),
                "pendingOrders", orders.countByStatus(OrderStatus.PLACED) + orders.countByStatus(OrderStatus.CONFIRMED) + orders.countByStatus(OrderStatus.PROCESSING),
                "deliveredOrders", orders.countByStatus(OrderStatus.DELIVERED),
                "cancelledOrders", orders.countByStatus(OrderStatus.CANCELLED));
    }

    @GetMapping("/users")
    List<User> allUsers()
    {
        return users.findAll();
    }

    @PatchMapping("/users/{id}/active")
    User active(@PathVariable UUID id, @RequestParam boolean value)
    {
        User user = users.findById(id).orElseThrow();
        user.setActive(value);

        if (!value)
        {
            authService.deactivateSessions(user);
        }

        return users.save(user);
    }

    @DeleteMapping("/users/{id}")
    void deleteUser(@PathVariable UUID id)
    {
        User user = users.findById(id).orElseThrow();
        user.setActive(false);
        users.save(user);
    }

    @GetMapping("/orders")
    List<Order> allOrders()
    {
        return orders.findAll();
    }
}
