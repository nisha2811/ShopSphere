package com.shopsphere.product;

import com.shopsphere.category.Category;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record ProductResponse(
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
        Instant createdAt,
        Instant updatedAt
)
{
    public static ProductResponse from(Product product)
    {
        Category category = product.getCategory();
        return new ProductResponse(
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
                category != null ? category.getId() : null,
                category != null ? category.getName() : null,
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}