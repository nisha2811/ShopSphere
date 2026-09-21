package com.shopsphere.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record ProductRequest(
        @NotBlank @Size(max = 160) String name,
        @NotBlank @Size(max = 4000) String description,
        @NotNull @Positive BigDecimal price,
        @PositiveOrZero BigDecimal discountPrice,
        @NotBlank @Size(max = 255) String brand,
        @NotBlank @Size(max = 255) String sku,
        @PositiveOrZero int stockQuantity,
        @Size(max = 7_000_000) String imageUrl,
        @NotNull UUID categoryId,
        boolean active)
{
}
