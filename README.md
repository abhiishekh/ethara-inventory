# 📦 Inventory & Order Management System

A production-ready, fully containerized Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**.

---

## 🔗 Live Links

| Service | URL |
|---|---|
| 🌐 Frontend | https://ethara-inventory-frontend.onrender.com |
| ⚙️ Backend API | https://ethara-inventory.onrender.com/ |
| 📖 API Docs | https://ethara-inventory.onrender.com/docs |
| 🐳 Docker Hub Frontend | https://hub.docker.com/r/abhiishek08/ethara-frontend |
| 🐳 Docker Hub Backend | https://hub.docker.com/r/abhiishek08/ethara-backend |

---

## ✨ Features

- **Product Management** — Full CRUD with unique SKU enforcement, price/stock validation
- **Customer Management** — Add/view/delete customers with unique email enforcement
- **Order Management** — Create orders with multi-item support, automatic stock deduction, and total calculation
- **Dashboard** — Live stats for products, customers, orders, and low-stock alerts
- **Business Rules** — Insufficient stock returns a 400 with a clear message; order cancellation restores stock
- **Containerized** — All 3 services run with a single `docker compose up`

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| Frontend | React 18 + Vite + React Router |
| Database | PostgreSQL 15 |
| Containerization | Docker + Docker Compose |
| Deployment | Render (backend) + Render (frontend) |

---

## 🚀 Local Development

### Prerequisites
- Docker & Docker Compose installed
- Git

### 1. Clone the repo
```bash
git clone https://github.com/abhiishekh/ethara-inventory.git
cd ethara-inventory
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD
```

### 3. Run with Docker Compose
```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |

---

## 🐳 Docker Hub

Pull and run the backend image directly:
```bash
docker pull abhiishek/ethara-inventory-backend:latest
docker pull abhiishek/ethara-inventory-frontend:latest
```

---

## 📡 API Reference

### Products

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/products` | Create a product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/customers` | Create a customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create an order (reduces stock) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order details |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

### Utility

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `GET` | `/docs` | Swagger UI |

---

## 🗄️ Project Structure

```
ethara-inventory/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + CORS + router registration
│   │   ├── config.py        # Pydantic settings (reads from .env)
│   │   ├── database.py      # SQLAlchemy engine + session
│   │   ├── models/          # SQLAlchemy ORM models
│   │   ├── schemas/         # Pydantic v2 request/response schemas
│   │   └── routers/         # Route handlers (products, customers, orders)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/index.js     # Axios API client
│   │   ├── components/      # Reusable components (Sidebar)
│   │   └── pages/           # Dashboard, Products, Customers, Orders
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── .gitignore
```

---

## ⚙️ Deployment Guide

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on [render.com](https://render.com)
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` → Render PostgreSQL connection string
   - `ALLOWED_ORIGINS` → Your Vercel frontend URL

### Frontend → Render Static Site

1. Import GitHub repo on [render.com](https://render.com)
2. Set root directory: `frontend`
3. Add environment variable:
   - `VITE_API_URL` → Your Render backend URL
4. Deploy

### Docker Hub (Backend Image)

```bash
docker push abhiishek08/ethara-inventory-backend:latest
docker build -t abhiishek08/ethara-inventory-backend:latest
```

---

## 🧠 Business Logic

- **Unique SKU**: Enforced at DB level; returns `409 Conflict` if duplicate
- **Unique Email**: Enforced at DB level; returns `409 Conflict` if duplicate
- **Stock Validation**: `POST /orders` checks all items before any changes; returns `400` with product name + available/requested quantities
- **Atomic Stock Reduction**: Uses `with_for_update()` row locking + `db.flush()` to prevent race conditions
- **Auto Total Calculation**: Backend computes `sum(unit_price × quantity)` — never trusted from client
- **Order Cancellation**: `DELETE /orders/{id}` restores stock for all items

---

## 👨‍💻 Author

**Abhishek Maurya** — Full-Stack & GenAI Engineer  
[GitHub](https://github.com/abhiishekh) · [LinkedIn](https://linkedin.com/in/abhiishek08)
