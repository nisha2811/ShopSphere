package com.shopsphere.cart;

import jakarta.validation.constraints.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import jakarta.validation.Valid;

record CartItemRequest(@NotNull UUID productId, @Min(1) int quantity)
{

}

@RestController
@RequestMapping("/api/cart")
public class CartController
{
    final CartService s;

    public CartController(CartService s)
    {
        this.s = s;
    }

    @GetMapping
    Object get(Authentication a)
    {
        return s.view(a.getName());
    }

    @PostMapping("/items")
    Object add(Authentication a, @Valid @RequestBody CartItemRequest r)
    {
        return s.add(a.getName(), r.productId(), r.quantity());
    }

    @PatchMapping("/items/{id}")
    Object update(Authentication a, @PathVariable UUID id, @RequestParam @Min(1) int quantity)
    {
        return s.update(a.getName(), id, quantity);
    }

    @DeleteMapping("/items/{id}")
    Object remove(Authentication a, @PathVariable UUID id)
    {
        return s.remove(a.getName(), id);
    }

    @DeleteMapping
    Object clear(Authentication a)
    {
        return s.clear(a.getName());
    }
}
