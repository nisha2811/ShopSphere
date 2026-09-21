package com.shopsphere.product;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
public class ProductController
{
    private final ProductRepository repo;
    private final ProductService service;

    public ProductController(ProductRepository repo, ProductService service)
    {
        this.repo = repo;
        this.service = service;
    }

    @GetMapping
    public Page<ProductResponse> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) UUID category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal min,
            @RequestParam(required = false) BigDecimal max,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort)
    {
        String[] parts = sort.split(",", 2);
        String property = parts[0].trim();
        Sort.Direction direction = Sort.Direction.DESC;

        if (parts.length > 1)
        {
            try
            {
                direction = Sort.Direction.fromString(parts[1].trim());
            }
            catch (IllegalArgumentException ignored)
            {
                direction = Sort.Direction.DESC;
            }
        }
        if (!property.equals("createdAt") && !property.equals("name") && !property.equals("price") && !property.equals("brand"))
        {
            property = "createdAt";
        }

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 50);

        String searchText = normalizeText(q);
        String brandText = normalizeText(brand);

        return repo.search(
                        searchText,
                        category,
                        brandText,
                        min,
                        max,
                        PageRequest.of(
                                safePage,
                                safeSize,
                                Sort.by(direction, property)
                        )
                )
                .map(ProductResponse::from);
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable UUID id)
    {
        return service.getPublicResponse(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse create(@Valid @RequestBody ProductRequest request)
    {
        return ProductResponse.from(service.save(request, null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponse update(@PathVariable UUID id, @Valid @RequestBody ProductRequest request)
    {
        return ProductResponse.from(service.save(request, id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable UUID id)
    {
        Product product = service.get(id);
        product.setActive(false);
        repo.save(product);
    }

    private String normalizeText(String value)
    {
        if (value == null)
        {
            return "";
        }
        return value.trim();
    }
}