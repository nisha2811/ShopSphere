# Architecture

React SPA -> REST API -> Spring Security/JWT -> modular Spring Boot services -> PostgreSQL.

Business modules own their controllers/services/repositories. Cross-cutting concerns live in security, config, common and exception packages. Flyway owns schema evolution.

The project intentionally uses a modular monolith: it provides interview depth in transactions, concurrency, validation and authorization without operational overhead from microservices.
