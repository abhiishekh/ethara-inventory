from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.models import Product, Customer, Order, OrderItem  # noqa: ensure models registered
from app.routers.products import router as products_router
from app.routers.customers import router as customers_router
from app.routers.orders import router as orders_router

# Create all tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inventory & Order Management API",
    description="Production-ready inventory management system for Ethara.ai assessment",
    version="1.0.0",
)

# CORS
origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(products_router)
app.include_router(customers_router)
app.include_router(orders_router)


@app.get("/", tags=["Root"])
def root():
    return {"message": "Inventory & Order Management API is running 🚀"}


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "healthy"}
