# The Spice Haven

Restaurant web application with a React/Vite frontend and a Spring Boot/MySQL backend.

## Structure
- `frontend/` — Vite + React customer portal and admin UI.
- `backend/restont/` — Java Spring Boot + MySQL API.
- Frontend is suitable for Netlify SPA deployment.
- All menu, order, reservation, customer, and administrator records are persisted through the API.
- Database and authentication secrets are supplied as environment variables.

## Development

1. Create the MySQL database: `CREATE DATABASE spicehaven CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
2. Copy `backend/restont/.env.example` to `backend/restont/.env` and set the backend variables there, or configure them in your shell, IDE launch configuration, or deployment environment. The backend searches for `.env` in the repository root, `backend/`, `backend/restont/`, and `restont/`, so startup working directory does not affect local configuration; the file is ignored by Git. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to your Razorpay test credentials for local testing, and configure the same variables in your deployment environment. Legacy deployments using `RAZORPAY_API_KEY` and `RAZORPAY_API_SECRET` are also supported. Never put the secret in frontend configuration or commit it. `SPICEHAVEN_JWT_SECRET` is optional: when omitted, the backend generates a secure signing key for this process, so tokens will be invalidated after a restart and cannot be shared across backend instances. Configure a stable secret for production or multi-instance deployments. Set both `SPICEHAVEN_ADMIN_EMAIL` and `SPICEHAVEN_ADMIN_PASSWORD` to create or reset the configured administrator account; the password is hashed and synchronized at startup, and is not stored in source.
3. Start the backend from `backend/restont/` with `mvn spring-boot:run`. Flyway applies versioned schema migrations on startup; Hibernate validates the schema.
4. Copy `frontend/.env.example` to `frontend/.env.local`, set `VITE_API_BASE_URL` if the backend is not at `http://localhost:8080/api`, then run `npm install` and `npm run dev` in `frontend/`.

The local frontend origin `http://localhost:5173` is always allowed for development. Add deployed frontend origins with `SPICEHAVEN_CORS_ALLOWED_ORIGINS`; comma-separated origins are supported and do not replace the local origin.

Admins can add and edit dishes at `/admin/menu`, including uploading PNG, JPEG, or WebP images up to 5 MB. Image bytes are stored in MySQL and mirrored to `backend/restont/uploads/dishes` when the backend is started from `backend/restont/`; set `SPICEHAVEN_MENU_IMAGE_DIRECTORY` to choose another mirror directory. Dish images are served by the backend to the customer menu, with no external image URL required. Flyway migration V5 removes the legacy image URL column.

No sample menu rows or customer accounts are inserted. Sign in using the bootstrapped admin account, then add dishes from `/admin/menu`. Customer registration is available from the cart before checkout. UPI payments use Razorpay; an order is marked paid only after the backend verifies the gateway signature and captured payment.

Do not commit `.env` files, database credentials, administrator passwords, or JWT secrets.
