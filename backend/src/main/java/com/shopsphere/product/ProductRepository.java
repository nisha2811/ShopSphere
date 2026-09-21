package com.shopsphere.product;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, UUID>
{
    @EntityGraph(attributePaths = "category")
    List<Product> findAllByActiveTrue();

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByCategory_IdAndActiveTrue(UUID categoryId);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByCategory_NameIgnoreCaseAndActiveTrue(String categoryName);

    @EntityGraph(attributePaths = "category")
    List<Product> findAllByCategory_NameIgnoreCase(String categoryName);

    @EntityGraph(attributePaths = "category")
    @Query("""
        SELECT p
        FROM Product p
        WHERE p.active = true

          AND (
                :q = ''
                OR p.name ILIKE CONCAT('%', :q, '%')
                OR p.description ILIKE CONCAT('%', :q, '%')
                OR p.brand ILIKE CONCAT('%', :q, '%')
                OR p.sku ILIKE CONCAT('%', :q, '%')
              )

          AND (
                :category IS NULL
                OR p.category.id = :category
              )

          AND (
                :brand = ''
                OR p.brand ILIKE CONCAT('%', :brand, '%')
              )

          AND (
                :min IS NULL
                OR p.price >= :min
              )

          AND (
                :max IS NULL
                OR p.price <= :max
              )
        """)
    Page<Product> search(
            @Param("q") String q,
            @Param("category") UUID category,
            @Param("brand") String brand,
            @Param("min") BigDecimal min,
            @Param("max") BigDecimal max,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "category")
    @Override
    Optional<Product> findById(UUID id);

    @EntityGraph(attributePaths = "category")
    @Override
    Page<Product> findAll(Pageable pageable);

    long countByActiveTrue();

    Optional<Product> findBySkuIgnoreCase(String sku);

    boolean existsBySkuIgnoreCase(String sku);

    long countByCategory_Id(UUID categoryId);

    long countByCategory_IdAndActiveTrue(UUID categoryId);
}