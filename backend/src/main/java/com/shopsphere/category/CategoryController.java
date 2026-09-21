package com.shopsphere.category;

import com.shopsphere.exception.ApiException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController
{
    private final CategoryRepository repository;

    public CategoryController(CategoryRepository repository)
    {
        this.repository = repository;
    }

    @GetMapping
    public List<Category> all()
    {
        return repository.findAll().stream()
                .filter(Category::isActive)
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Category create(@Valid @RequestBody CategoryRequest request)
    {
        if (repository.existsByNameIgnoreCase(request.name().trim()))
        {
            throw new ApiException("Category already exists", HttpStatus.CONFLICT);
        }
        Category category = new Category();
        category.setName(request.name().trim());
        category.setDescription(request.description());
        category.setActive(true);
        return repository.save(category);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Category update(@PathVariable UUID id, @Valid @RequestBody CategoryRequest request)
    {
        Category category = repository.findById(id).orElseThrow();
        category.setName(request.name().trim());
        category.setDescription(request.description());
        category.setActive(request.active());
        return repository.save(category);
    }
}

record CategoryRequest(@NotBlank @Size(max = 255) String name, @Size(max = 500) String description, boolean active)
{

}
