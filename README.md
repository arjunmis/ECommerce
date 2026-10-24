# ShopNest — Full Stack E-commerce (Node.js + Python FastAPI + React)

An e-commerce web application with a **Node.js / Express** REST API, a **Python FastAPI** service for search,
recommendations and sales reports, a **React** storefront and admin dashboard, and **MongoDB** as the database.

```
React (Vite)  ──►  Node.js / Express API  ──►  MongoDB
     │              auth, products, orders        ▲
     └──────────►  Python FastAPI service  ───────┘
                    search, recommendations, sales reports
```

## Features

**Node.js / Express API** (`backend-node/`)
- JWT authentication (register, login, current user) with bcrypt password hashing
- Role-based access: admin-only product management and order status updates
- Product CRUD with pagination and category filter
- Order placement with server-side price calculation and atomic stock decrement
  (stock is restored if any item in the order fails)
- Central error handling (invalid ids, validation errors, duplicates)

**Python FastAPI service** (`service-python/`)
- `GET /search` — text search with category, price range, in-stock filters and sorting
- `GET /products/{id}/recommendations` — similar products from the same category, closest in price
- `GET /reports/sales` — revenue, order count, average order value, sales by category and top products,
  built with MongoDB aggregation pipelines
- Pydantic response models and auto-generated API docs at `/docs`

**React frontend** (`frontend-react/`)
- Product listing, search (calls the Python service), product page with recommendations
- Cart with React Context + `useReducer`, saved in localStorage
- Login / register, checkout with shipping address, order history
- Admin dashboard: sales report, add products, update order status

## Tech stack

Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt · Python, FastAPI, Pydantic, PyMongo, Uvicorn ·
React 18, React Router, Vite

## Run locally

Requirements: Node.js 18+, Python 3.10+, MongoDB running on `localhost:27017`.

```bash
# 1. Node.js API  → http://localhost:5000
cd backend-node
cp .env.example .env        # set JWT_SECRET
npm install
npm run seed                # 8 sample products + admin and user accounts
npm run dev

# 2. Python service  → http://localhost:8000  (docs at /docs)
cd service-python
cp .env.example .env
python -m venv .venv
.venv\Scripts\activate      # Windows  (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. React app  → http://localhost:5173
cd frontend-react
cp .env.example .env
npm install
npm run dev
```

Demo accounts (after seeding): `admin@shopnest.dev / admin123` and `user@shopnest.dev / user123`.

## API overview

| Service | Method | Endpoint | Access |
|---|---|---|---|
| Node | POST | `/api/auth/register`, `/api/auth/login` | Public |
| Node | GET | `/api/auth/me` | User |
| Node | GET | `/api/products`, `/api/products/:id` | Public |
| Node | POST / PUT / DELETE | `/api/products/:id` | Admin |
| Node | POST | `/api/orders` | User |
| Node | GET | `/api/orders/mine` | User |
| Node | GET | `/api/orders` | Admin |
| Node | PATCH | `/api/orders/:id/status` | Admin |
| Python | GET | `/search` | Public |
| Python | GET | `/products/{id}/recommendations` | Public |
| Python | GET | `/reports/sales` | Public (demo) |

## Possible next steps

- Protect `/reports/sales` by verifying the same JWT in the Python service
- Payment gateway integration (Razorpay / Stripe)
- Product images upload
- Docker Compose file to start all three services together
