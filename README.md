# Next.js E-Commerce UX

## Project Overview

This project implements a Next.js e-commerce interface that fetches product data from the DummyJSON API and manages cart state through a PHP backend API. The solution demonstrates frontend architecture with TypeScript interfaces, custom hooks for business logic, and integration between external product data and internal cart operations.

## Setup & Installation

### Frontend

**Requirements:**
- Node.js 18+
- npm

**Installation Steps:**

1. Navigate to the frontend directory:
```bash
cd frontend-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` to set:
```env
BACKEND_BASE_URL=http://localhost:8080/api
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Additional Commands:**
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

### Backend

**Requirements:**
- PHP 8.1+
- Composer

**Installation Steps:**

1. Navigate to the backend directory:
```bash
cd backend-php
```

2. Install dependencies:
```bash
composer install
```

3. Start the PHP development server:
```bash
php spark serve
```

The API will be available at `http://localhost:8080`

**API Endpoints:**

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | Retrieve cart with items and financial breakdown |
| POST | `/api/cart/add` | Add item to cart |
| PUT | `/api/cart/update/{id}` | Update cart line item quantity |
| DELETE | `/api/cart/remove/{id}` | Remove item from cart |

The backend uses CodeIgniter 4 with session-based cart storage and CORS configuration for local development.

## Architectural Decisions

### Next.js Data Fetching Method

The application uses the **Next.js App Router** with a hybrid data fetching approach:

- **Server Components** handle initial page loads for product listings and detail pages, providing server-side rendering for SEO and performance
- **Client Components** (`.client.tsx` files) manage interactive features that require client-side state
- **API Routes** (`/app/api/`) serve as a Backend-for-Frontend (BFF) layer that:
  - Fetches products from DummyJSON with ISR caching (60-second revalidation)
  - Proxies cart operations to the PHP backend
  - Forwards session cookies between the browser and PHP server for cart persistence

This approach combines the performance benefits of server-side rendering with the interactivity needed for cart operations.

### Client-Side Cart State Management

Cart state is managed using **Zustand** with custom hooks:

**Store Structure** (`src/lib/store/cart.ts`):
- Holds cart items, subtotal, currency, and UI states (loading, errors, drawer open/closed)
- Implements state versioning to handle race conditions from concurrent operations
- Maintains per-item loading states for granular UI feedback

**Custom Hook** (`src/hooks/useCart.ts`):
- Encapsulates all cart business logic (add, update, remove operations)
- Implements optimistic updates: UI changes immediately, then synchronizes with the API
- Includes automatic rollback if API calls fail
- Debounces quantity updates (500ms) to prevent excessive API requests
- Handles stock validation and error states

**Product Data** (`src/hooks/useProducts.ts`):
- Uses React Query for caching product data with stale-while-revalidate strategy
- Separate hooks for listing (`useProducts`), detail (`useProduct`), and related products (`useRelatedProducts`)

All cart mutations update the UI immediately for responsive user experience, then synchronize with the backend. Failed API calls automatically restore the previous state.

### Separation Between Product Data and Cart Logic

The architecture maintains strict separation between external product data (DummyJSON) and internal cart operations (PHP API):

**Product Data Layer:**
- Client: `src/lib/clients/dummyjson.ts` - HTTP requests to DummyJSON API
- Service: `src/lib/services/products.ts` - Product domain logic and transformations
- API Routes: `/app/api/products/` - Server-side fetching with caching
- Hooks: `useProducts`, `useProduct`, `useRelatedProducts` - React Query integration
- Caching: 1-minute stale time, 5-minute garbage collection

**Cart Operations Layer:**
- Client: `src/lib/clients/backend.ts` - HTTP requests to PHP backend
- Service: `src/lib/services/cart.ts` - Cart domain logic (price conversions, mappings)
- API Routes: `/app/api/cart/` - BFF proxy with cookie forwarding
- Hook: `useCart` - Zustand integration with optimistic updates
- Caching: None (always fresh from PHP session)

**Integration:**
Product data and cart interact only through defined TypeScript interfaces:
- Products from DummyJSON are transformed to `AddToCartRequest` type before sending to cart API
- Cart API returns `Cart` and `CartLineItem` types independent of product structure
- Type definitions in `src/lib/types/products.ts` and `src/lib/types/cart.ts` enforce contracts
- Service layers handle data transformation between APIs

This separation ensures changes to either data source don't cascade through the application, and each can be tested independently.
