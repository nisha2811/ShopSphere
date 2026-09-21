package com.shopsphere.wishlist;

import com.shopsphere.exception.ApiException;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController
{
    private final WishlistRepository repository;
    private final UserRepository users;
    private final ProductRepository products;

    public WishlistController(WishlistRepository repository, UserRepository users, ProductRepository products)
    {
        this.repository = repository;
        this.users = users;
        this.products = products;
    }

    @GetMapping
    public List<WishlistItem> all(Authentication authentication)
    {
        User user = user(authentication);
        return repository.findByUserId(user.getId());
    }

    @PostMapping("/{productId}")
    public WishlistItem add(Authentication authentication, @PathVariable UUID productId)
    {
        User user = user(authentication);

        if (repository.findByUserIdAndProductId(user.getId(), productId).isPresent())
        {
            throw new ApiException("Product already in wishlist", HttpStatus.CONFLICT);
        }

        WishlistItem item = new WishlistItem();
        item.setUser(user);
        item.setProduct(
                products.findById(productId)
                        .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND))
        );

        return repository.save(item);
    }

    @DeleteMapping("/{productId}")
    public void remove(Authentication authentication, @PathVariable UUID productId)
    {
        repository.findByUserIdAndProductId(user(authentication).getId(), productId)
                .ifPresent(repository::delete);
    }

    private User user(Authentication authentication)
    {
        return users.findByEmailIgnoreCase(authentication.getName())
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
    }
}