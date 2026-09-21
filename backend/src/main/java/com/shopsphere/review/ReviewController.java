package com.shopsphere.review;

import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.shopsphere.exception.ApiException;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController
{
    final ReviewRepository reviews;
    final UserRepository users;
    final ProductRepository products;

    public ReviewController(ReviewRepository r, UserRepository u, ProductRepository p)
    {
        reviews = r;
        users = u;
        products = p;
    }

    @GetMapping
    List<Review> list(@PathVariable UUID productId)
    {
        return reviews.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    Review add(Authentication a, @PathVariable UUID productId, @Valid @RequestBody ReviewRequest x)
    {
        User u = users.findByEmailIgnoreCase(a.getName()).orElseThrow();
        if (reviews.existsByUserIdAndProductId(u.getId(), productId))
        {
            throw new ApiException("You already reviewed this product", HttpStatus.CONFLICT);
        }
        Review r = new Review();
        r.setUser(u);
        r.setProduct(products.findById(productId).orElseThrow());
        r.setRating(x.rating());
        r.setComment(x.comment());
        return reviews.save(r);
    }
    record ReviewRequest(@Min(1) @Max(5) int rating, @Size(max = 1000) String comment) {}
}
