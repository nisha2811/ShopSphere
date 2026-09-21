package com.shopsphere.product;

import com.shopsphere.category.CategoryRepository;
import com.shopsphere.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.UUID;

@Service
public class ProductService
{
    private final ProductRepository repo;
    private final CategoryRepository cats;

    public ProductService(ProductRepository repo, CategoryRepository cats)
    {
        this.repo = repo;
        this.cats = cats;
    }

    @Transactional(readOnly = true)
    public Product get(UUID id)
    {
        return repo.findById(id).orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));
    }

    @Transactional(readOnly = true)
    public ProductResponse getPublicResponse(UUID id)
    {
        Product product = repo.findById(id)
                .orElseThrow(() -> new ApiException("Product not found", HttpStatus.NOT_FOUND));

        if (!product.isActive())
        {
            throw new ApiException("Product not found", HttpStatus.NOT_FOUND);
        }

        return ProductResponse.from(product);
    }

    @Transactional
    public Product save(ProductRequest request, UUID id)
    {
        Product product =
                id == null ? new Product() : get(id);

        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        if (request.discountPrice() != null
                && request.discountPrice().compareTo(request.price()) >= 0)
        {
            throw new ApiException(
                    "Discount price must be lower than the regular price",
                    HttpStatus.BAD_REQUEST);
        }

        product.setPrice(request.price());
        product.setDiscountPrice(request.discountPrice());
        product.setBrand(request.brand().trim());
        product.setSku(request.sku().trim());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(validateImage(request.imageUrl()));
        product.setActive(request.active());
        product.setCategory(cats.findById(request.categoryId())
                        .orElseThrow(() -> new ApiException("Category not found", HttpStatus.BAD_REQUEST))
        );
        product.setUpdatedAt(Instant.now());

        return repo.save(product);
    }

    private String validateImage(String imageUrl)
    {
        if (imageUrl == null || imageUrl.isBlank())
        {
            return null;
        }

        String value = imageUrl.trim();

        boolean allowed = value.startsWith("/")
                || value.startsWith("data:image/png;base64,")
                || value.startsWith("data:image/jpeg;base64,")
                || value.startsWith("data:image/webp;base64,");

        if (!allowed)
        {
            throw new ApiException(
                    "Product image must be a local path or PNG, JPEG, or WEBP image.",
                    HttpStatus.BAD_REQUEST);
        }

        return value;
    }
}