# Real Estate Management Platform

A full-stack real estate platform with role-based dashboards for Admins, Agents, Owners, and Buyers.

---

## Tech Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 18, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend  | Java 17, Spring Boot 3, Spring Security (JWT)          |
| Database | MySQL 8                                                |

---

## Project Structure

```
final-project/
├── backend/          # Spring Boot REST API
├── frontend/         # React + Vite SPA
└── database/
    ├── schema.sql    # Full DB schema + stored procedures + triggers
    └── project_temp.sql  # Sample seed data
```

---

## Prerequisites

- Java 17+
- Node.js 18+
- MySQL 8+
- Maven 3.8+

---

## Database Setup

1. Start MySQL and open a client:

   ```bash
   mysql -u root -p
   ```
2. Run the schema file:

   ```sql
   source /path/to/database/schema.sql;
   ```

   This creates the `project_temp` database, all tables, stored procedures, triggers, and a default admin account.

---

## Backend Setup

1. Copy the example config and fill in your database credentials:

   ```bash
   cp backend/src/main/resources/application.properties.example \
      backend/src/main/resources/application.properties
   ```
2. Edit `application.properties`:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/project_temp
   spring.datasource.username=YOUR_DB_USER
   spring.datasource.password=YOUR_DB_PASSWORD
   app.jwt.secret=YOUR_JWT_SECRET
   ```
3. Build and run:

   ```bash
   cd backend
   mvn spring-boot:run
   ```

   The API starts at `http://localhost:8080`.

---

## Frontend Setup

1. Install dependencies:

   ```bash
   cd frontend
   npm install
   ```
2. (Optional) Configure environment:
   For local development and Wi-Fi across multiple devices, **no `.env` configuration is needed** — the app automatically detects the host IP at runtime. Set this only for production domains:

   ```env
   VITE_API_BASE_URL=https://api.yourdomain.com
   ```
3. Start the dev server:

   ```bash
   npm run dev
   ```

   The app is available at `http://localhost:5173`.

---

## User Roles & Access

| Role            | Registration  | Login | Key Capabilities                                        |
| --------------- | ------------- | ----- | ------------------------------------------------------- |
| **Admin** | Seeded only   | ✅    | Manage users, approve/reject properties, SQL console    |
| **Owner** | Self-register | ✅    | List properties, assign agents, view sold/rented        |
| **Agent** | Admin-created | ✅    | Manage requests, accept/reject buyers, end rentals      |
| **Buyer** | Self-register | ✅    | Browse properties, send requests, view purchased/rented |

### Buyer Categories

- **buy** – can only request `sale` type properties
- **rent** – can only request `rent` type properties

---

## Database Schema Overview

| Table                 | Purpose                                    |
| --------------------- | ------------------------------------------ |
| `owner`             | Property owners                            |
| `agent`             | Real estate agents                         |
| `buyer`             | Buyers/renters (`category`: buy or rent) |
| `admin`             | Platform administrators                    |
| `property_details`  | Core property info (address, city, size…) |
| `property_for_sale` | Sale listings linked to a property         |
| `property_for_rent` | Rental listings linked to a property       |
| `buyer_requests`    | Buyer → Agent requests (buy or rent)      |

**Key stored procedures:** `add_property`, `buy_property`, `rent_property`, `end_rent`, `rate_agent`

---

## API Overview

All endpoints require a `Bearer <JWT>` token except `/api/auth/*`.

| Prefix            | Accessible By |
| ----------------- | ------------- |
| `/api/auth/**`  | Public        |
| `/api/admin/**` | Admin         |
| `/api/owner/**` | Owner         |
| `/api/agent/**` | Agent         |
| `/api/buyer/**` | Buyer         |

---

## Build for Production

```bash
# Frontend
cd frontend && npm run build   # outputs to frontend/dist/

# Backend
cd backend && mvn package      # outputs to backend/target/*.jar
java -jar backend/target/*.jar
```

---

## Known Constraints

- Agent accounts can only be created by an Admin (no self-registration).
- A buyer's category (`buy` / `rent`) is set at registration and cannot be changed via the UI.
- The SQL Console in the Admin dashboard blocks `DROP`, `TRUNCATE`, `ALTER`, `CREATE`, and `RENAME` statements.
