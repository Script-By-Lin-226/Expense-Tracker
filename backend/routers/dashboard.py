from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import User
from schemas import DashboardStats
from crud import get_dashboard_stats, get_expenses_by_category, get_income_stats, get_expense_stats
from auth import get_current_user
from datetime import datetime

router = APIRouter()


@router.get("/stats", response_model=DashboardStats)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = get_dashboard_stats(db, current_user.id)
    return stats


@router.get("/expense-trend")
def get_expense_trend(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from crud import get_monthly_expenses
    if not year:
        year = datetime.now().year
    results = get_monthly_expenses(db, current_user.id, year=year)
    return [{"month": int(month), "amount": float(amount)} for month, amount in results]


@router.get("/income-vs-expense")
def get_income_vs_expense(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not year:
        year = datetime.now().year
    
    months = []
    for month in range(1, 13):
        income = get_income_stats(db, current_user.id, month=month, year=year)
        expense = get_expense_stats(db, current_user.id, month=month, year=year)
        months.append({
            "month": month,
            "income": float(income),
            "expense": float(expense)
        })
    
    return months
