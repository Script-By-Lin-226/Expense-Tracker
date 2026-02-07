from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional


# User schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


# Auth schemas
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# Expense schemas
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str] = None
    payment_method: Optional[str] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    description: Optional[str] = None
    payment_method: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str]
    payment_method: Optional[str]
    user_id: int

    class Config:
        from_attributes = True


# Income schemas
class IncomeCreate(BaseModel):
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str] = None


class IncomeUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    description: Optional[str] = None


class IncomeResponse(BaseModel):
    id: int
    title: str
    amount: float
    category: str
    date: date
    description: Optional[str]
    user_id: int

    class Config:
        from_attributes = True


# Dashboard schemas
class DashboardStats(BaseModel):
    total_balance: float
    total_income: float
    total_expense: float
    monthly_expense: float
    recent_transactions: list
