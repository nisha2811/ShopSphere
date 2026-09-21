package com.shopsphere.wishlist;

import com.shopsphere.product.Product;
import java.math.BigDecimal;
import java.util.UUID;

public record WishlistProductResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal discountPrice,
        String brand,
        String sku,
        int stockQuantity,
        String imageUrl,
        boolean active,
        UUID categoryId,
        String categoryName,
        double averageRating,
        long reviewCount)
{
    public static WishlistProductResponse from(Product product, double averageRating, long reviewCount)
    {
        return new WishlistProductResponse(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getDiscountPrice(),
                product.getBrand(),
                product.getSku(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.isActive(),
                product.getCategory() == null
                        ? null
                        : product.getCategory().getId(),
                product.getCategory() == null
                        ? null
                        : product.getCategory().getName(),
                averageRating,
                reviewCount
        );
    }
}