# Porsche Showroom - Product Backlog

## Sprint 1: Foundation & Authentication (P0)
- [x] Initial Spring Boot backend architecture & database schema via Flyway
- [x] Next.js frontend setup with initial Tailwind styling
- [x] Basic JWT Authentication (Login/Register/OTP)
- [ ] Implement Refresh Token flow (httpOnly cookies) - *In Progress*
- [x] User entity integration and role-based access control (RBAC)

## Sprint 2: Core Showroom & Admin Data (P0)
- [x] Build public models overview and detail pages
- [x] Admin Panel: Setup layout and Dashboard UI
- [x] Admin Panel: CRUD for Series, Models, and Body Types
- [x] Admin Panel: CRUD for Showrooms and Users

## Sprint 3: Vehicle Configurator (P0)
- [x] Database schema for configurator taxonomy (Groups, SubGroups, Options)
- [x] Admin Panel: Manage Configurator Options (Pricing, Conflicts, Defaults)
- [x] Public: Configurator UI implementation with real-time price calculation
- [x] Public: High-fidelity Gallery & 360-View integration
- [x] Public: Save Build to account functionality
- [x] Public: "Porsche Code" anonymous generation and retrieval

## Sprint 4: Customer Acquisition & Workflows (P1)
- [x] Test Drive Booking UI (Public & Configurator integration)
- [x] Request Details (Contact Dealer) UI with map/location search
- [x] Connect Test Drive and Request Details to Backend APIs
- [x] Implement HTML Email notifications using JavaMailSender
- [x] Admin Panel: Test Drive Management (Approve/Reject with Email triggers)

## Sprint 5: Refactoring & Quality (P1) — *Current Focus*
- [x] Refactor API Client for DRY (Don't Repeat Yourself) principle
- [x] Replace String Literals with strict TypeScript Enums
- [ ] Migrate frontend to `src/` directory architecture
- [ ] Overhaul Design System: Replace hardcoded colors with Tailwind tokens
- [ ] Refactor Admin Layout for better Next.js nested routing usage
- [ ] Complete i18n implementation (Translation mapping across all pages)
- [ ] Refactor Backend into strict `com.ioc.internship` layered architecture

## Sprint 6: Polish & Advanced Features (P2)
- [ ] Add Sentry for frontend and backend error tracking
- [ ] Complete Husky pre-commit hooks and ESlint boundaries
- [ ] Setup Docker Compose for entire stack (Frontend + Backend + MySQL + Redis)
- [ ] Advanced Configurator rule engine (Option dependencies/exclusions)
- [ ] Backend caching layer using Redis for catalog data
