# ShopSphere

A full-stack e-commerce application: React SPA on a Spring Boot / PostgreSQL backend, with JWT authentication, an admin panel, and a modular-monolith backend architecture.

## Tech stack

**Backend:** Java, Spring Boot 3.5, Spring Security, Spring Data JPA, PostgreSQL, Flyway (schema migrations), JWT (jjwt), BCrypt, Spring Mail, springdoc-openapi
**Frontend:** React 19, Redux Toolkit, React Router 7, Axios, Vite, Sonner (toasts)

## Features

- Email/password auth with email verification, access + refresh JWTs (refresh token in an httpOnly cookie, access token kept in memory — not localStorage), and forgot/reset password flows
- Role-based access control (CUSTOMER / ADMIN) enforced on the backend
- Product catalog with categories, product details, reviews
- Cart, wishlist, checkout with transactional order placement (server-side price/stock re-validation, inventory decrement, order snapshot pricing so historical totals never change)
- Order cancellation with stock restoration and simulated refund, before shipping
- Admin dashboard: manage products, orders, customers
- Audit logging of key actions (e.g. order placed)

See [`docs/`](docs/) for architecture, database, auth-flow, order-flow and security notes.

## Getting started

### Prerequisites
- Java 21+, Maven
- Node.js 18+
- PostgreSQL running locally

### Backend
```bash
cd backend
cp .env.example .env   # fill in DB credentials, JWT secret, SMTP creds
# create the database named in .env (DB_NAME)
mvn spring-boot:run
```
Flyway will run the migrations in `src/main/resources/db/migration` automatically on startup.

### Frontend
```bash
cd frontend
cp .env.example .env   # defaults work with the Vite dev proxy
npm install
npm run dev
```

The frontend dev server proxies `/api` to the backend (see `vite.config.js`). The app runs at `http://localhost:5173`, the API at `http://localhost:8088`.

### Demo accounts (when `SEED_DATA_ENABLED=true`)
- Admin: `admin@shopsphere.local` / `Admin@123`
- Customer: `customer@shopsphere.local` / `Password@123`

## Project structure
```
backend/   Spring Boot API (modular monolith — auth, product, cart, order, payment, review, wishlist, admin, audit)
frontend/  React SPA (pages, components, Redux store, Axios client with auto refresh)
docs/      Architecture, database, auth-flow, order-flow and security notes
```

## Notes

- `JWT_SECRET`, DB credentials and SMTP credentials must be set per environment — see `backend/.env.example`. Never commit a real `.env`.
- Passwords are BCrypt-hashed (strength 12) and never serialized in API responses.
- OpenAPI/Swagger UI is available at `/swagger-ui.html` when `OPENAPI_ENABLED=true`.