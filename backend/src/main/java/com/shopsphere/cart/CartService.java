package com.shopsphere.cart;

import com.shopsphere.user.*;
import com.shopsphere.product.*;
import com.shopsphere.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.util.*;

@Service
public class CartService
{
    final CartRepository carts;
    final CartItemRepository items;
    final UserRepository users;
    final ProductRepository products;

    public CartService(CartRepository c, CartItemRepository i, UserRepository u, ProductRepository p)
    {
        carts = c;
        items = i;
        users = u;
        products = p;
    }

    private Cart cart(String email)
    {
        User u = users.findByEmailIgnoreCase(email).orElseThrow();
        return carts.findByUserId(u.getId()).orElseGet(() -> {
            Cart c = new Cart();
            c.setUser(u);
            return carts.save(c);
        });
    }

    @Transactional
    public Map<String, Object> add(String e, UUID pid, int qty)
    {
        if (qty < 1)
            throw new ApiException("Quantity must be positive", HttpStatus.BAD_REQUEST);

        Cart c = cart(e);
        Product p = products.findById(pid).orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (!p.isActive())
            throw new ApiException("Product is unavailable", HttpStatus.BAD_REQUEST);

        CartItem x = items.findByCartIdAndProductId(c.getId(), pid).orElseGet(() -> {
            CartItem n = new CartItem();
            n.setCart(c);
            n.setProduct(p);
            n.setQuantity(0);
            return n;
        });

        if (x.getQuantity() + qty > p.getStockQuantity())
            throw new ApiException("Insufficient stock", HttpStatus.CONFLICT);

        x.setQuantity(x.getQuantity() + qty);
        items.save(x);

        return view(e);
    }

    @Transactional
    public Map<String, Object> update(String e, UUID id, int qty)
    {
        Cart c = cart(e);
        CartItem x = items.findById(id).orElseThrow(() -> new ApiException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!x.getCart().getId().equals(c.getId()))
            throw new ApiException("Forbidden", HttpStatus.FORBIDDEN);

        if (qty < 1 || qty > x.getProduct().getStockQuantity())
            throw new ApiException("Invalid quantity or insufficient stock", HttpStatus.BAD_REQUEST);

        x.setQuantity(qty);
        items.save(x);

        return view(e);
    }

    @Transactional
    public Map<String, Object> remove(String e, UUID id)
    {
        Cart c = cart(e);
        CartItem x = items.findById(id).orElseThrow();

        if (!x.getCart().getId().equals(c.getId()))
            throw new ApiException("Forbidden", HttpStatus.FORBIDDEN);

        items.delete(x);
        return view(e);
    }

    @Transactional
    public Map<String, Object> clear(String e)
    {
        Cart c = cart(e);
        items.deleteAll(items.findByCartId(c.getId()));
        return view(e);
    }

    public Map<String, Object> view(String e)
    {
        Cart c = cart(e);
        var list = items.findByCartId(c.getId());

        BigDecimal subtotal = list.stream()
                .map(x -> price(x.getProduct()).multiply(BigDecimal.valueOf(x.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "items", list.stream().map(x -> Map.of(
                        "id", x.getId(),
                        "productId", x.getProduct().getId(),
                        "name", x.getProduct().getName(),
                        "imageUrl", Objects.toString(x.getProduct().getImageUrl(), ""),
                        "unitPrice", price(x.getProduct()),
                        "quantity", x.getQuantity()
                )).toList(),
                "subtotal", subtotal,
                "total", subtotal
        );
    }

    private BigDecimal price(Product p)
    {
        return p.getDiscountPrice() != null && p.getDiscountPrice().compareTo(p.getPrice()) < 0
                ? p.getDiscountPrice()
                : p.getPrice();
    }
}
