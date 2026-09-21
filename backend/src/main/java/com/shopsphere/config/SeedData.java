package com.shopsphere.config;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.shopsphere.category.Category;
import com.shopsphere.category.CategoryRepository;
import com.shopsphere.product.Product;
import com.shopsphere.product.ProductRepository;
import com.shopsphere.user.User;
import com.shopsphere.user.UserRepository;

@Configuration
public class SeedData
{
    @Value("${app.seed.enabled:false}")
    private boolean enabled;

    @Value("${app.seed.demo-users:false}")
    private boolean demoUsersEnabled;

    @Value("${app.seed.admin-email:admin@shopsphere.local}")
    private String adminEmail;

    @Value("${app.seed.admin-password:}")
    private String adminPassword;

    @Value("${app.seed.customer-email:customer@shopsphere.local}")
    private String customerEmail;

    @Value("${app.seed.customer-password:}")
    private String customerPassword;
    private static final String[] ELECTRONICS_CATEGORIES = {
            "Mobiles",
            "Tablets",
            "Laptops & Computers",
            "Audio & Headphones",
            "Smartwatches & Wearables",
            "Cameras & Accessories",
            "Gaming",
            "Mobile Accessories",
            "Computer Accessories",
            "Smart Home"
    };

    @Bean
    CommandLineRunner seed(UserRepository users, CategoryRepository categories, ProductRepository products, PasswordEncoder encoder)
    {
        return args -> {
            if (!enabled)
            {
                return;
            }

            if (demoUsersEnabled)
            {
                if (adminPassword == null || adminPassword.isBlank()
                        || customerPassword == null || customerPassword.isBlank())
                {
                    throw new IllegalStateException(
                            "Demo-user seeding is enabled but demo passwords are not configured.");
                }

                ensureDemoUser(users, encoder,
                        adminEmail, "Shop", "Admin",
                        adminPassword, "ADMIN");

                ensureDemoUser(users, encoder,
                        customerEmail, "Demo", "Customer",
                        customerPassword, "CUSTOMER");
            }

            Map<String, Category> categoryMap = new LinkedHashMap<>();
            categoryMap.put("Mobiles", ensureCategory(categories, "Mobiles",
                    "Smartphones and mobile phones"));
            categoryMap.put("Tablets", ensureCategory(categories, "Tablets",
                    "Tablets and large-screen smart devices"));
            categoryMap.put("Laptops & Computers", ensureCategory(categories, "Laptops & Computers",
                    "Laptops, desktops and computer systems"));
            categoryMap.put("Audio & Headphones", ensureCategory(categories, "Audio & Headphones",
                    "Headphones, earbuds and speakers"));
            categoryMap.put("Smartwatches & Wearables", ensureCategory(categories, "Smartwatches & Wearables",
                    "Smartwatches, fitness bands and wearable devices"));
            categoryMap.put("Cameras & Accessories", ensureCategory(categories, "Cameras & Accessories",
                    "Cameras, lenses and camera accessories"));
            categoryMap.put("Gaming", ensureCategory(categories, "Gaming",
                    "Gaming consoles, controllers and gaming accessories"));
            categoryMap.put("Mobile Accessories", ensureCategory(categories, "Mobile Accessories",
                    "Chargers, cables, cases and power banks"));
            categoryMap.put("Computer Accessories", ensureCategory(categories, "Computer Accessories",
                    "Keyboards, mice, webcams, hubs and other accessories"));
            categoryMap.put("Smart Home", ensureCategory(categories, "Smart Home",
                    "Smart lights, plugs, security and connected home devices"));

            migrateLegacyProducts(products, categories, categoryMap);

            deactivateCategoriesOutsideCatalog(categories);

            ensureProduct(products, "Aural One Wireless Headphones",
                    "Adaptive wireless over-ear headphones with rich sound and all-day comfort.",
                    "14999", null, "AURAL-001", "Aural", 24,
                    categoryMap.get("Audio & Headphones"), "/products-headphones.svg");

            ensureProduct(products, "Orbit Mechanical Keyboard",
                    "Compact mechanical keyboard with hot-swap switches and RGB backlighting.",
                    "8999", null, "ORBIT-001", "Keystack", 18,
                    categoryMap.get("Computer Accessories"), "/products-keyboard.svg");

            ensureProduct(products, "ShopSphere Smart TV",
                    "Modern smart TV with a vivid display and built-in streaming apps.",
                    "42999", null, "TV-001", "VisionPro", 12,
                    categoryMap.get("Smart Home"), "/tv.jpeg");
        };
    }

    private void migrateLegacyProducts(ProductRepository products, CategoryRepository categories, Map<String, Category> targetCategories)
    {
        Map<String, String> mapping = Map.of(
                "Home", "Smart Home",
                "Lifestyle", "Smartwatches & Wearables",
                "Workspace", "Computer Accessories",
                "Audio", "Audio & Headphones",
                "Camera", "Cameras & Accessories",
                "TV & Home Entertainment", "Smart Home"
        );

        mapping.forEach((oldName, newName) ->
                categories.findByNameIgnoreCase(oldName).ifPresent(oldCategory ->
                        products.findAllByCategory_NameIgnoreCase(oldName).forEach(product -> {
                            product.setCategory(targetCategories.get(newName));
                            products.save(product);
                        }))
        );
    }

    private void deactivateCategoriesOutsideCatalog(CategoryRepository categories)
    {
        for (Category category : categories.findAll())
        {
            boolean keep = false;
            for (String allowed : ELECTRONICS_CATEGORIES)
            {
                if (allowed.equalsIgnoreCase(category.getName()))
                {
                    keep = true;
                    break;
                }
            }
            category.setActive(keep);
            categories.save(category);
        }
    }

    private User ensureDemoUser(
            UserRepository users,
            PasswordEncoder encoder,
            String email,
            String firstName,
            String lastName,
            String password,
            String role)
    {
        User user = users.findByEmailIgnoreCase(email).orElseGet(User::new);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPasswordHash(encoder.encode(password));
        user.setRole(role);
        user.setEmailVerified(true);
        user.setActive(true);
        return users.save(user);
    }

    private Category ensureCategory(CategoryRepository categories, String name, String description)
    {
        Category category = categories.findByNameIgnoreCase(name).orElseGet(Category::new);
        category.setName(name);
        category.setDescription(description);
        category.setActive(true);
        return categories.save(category);
    }

    private void ensureProduct(
            ProductRepository products,
            String name,
            String description,
            String price,
            String discountPrice,
            String sku,
            String brand,
            int stock,
            Category category,
            String imageUrl)
    {
        Product product = products.findBySkuIgnoreCase(sku).orElseGet(Product::new);
        product.setName(name);
        product.setDescription(description);
        product.setPrice(new BigDecimal(price));
        product.setDiscountPrice(discountPrice == null ? null : new BigDecimal(discountPrice));
        product.setSku(sku);
        product.setBrand(brand);
        product.setStockQuantity(stock);
        product.setCategory(category);
        product.setImageUrl(imageUrl);
        product.setActive(true);
        products.save(product);
    }
}
