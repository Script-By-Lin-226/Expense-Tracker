from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, expense, income, dashboard
import os

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Expense Tracker API", version="1.0.0")

# CORS middleware - support environment variable for production

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173, http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(expense.router, prefix="/api/expenses", tags=["expenses"])
app.include_router(income.router, prefix="/api/income", tags=["income"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/")
def root():
    return {"message": "Expense Tracker API"}
