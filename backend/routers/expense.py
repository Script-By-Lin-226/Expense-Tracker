from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from database import get_db
from models import User
from schemas import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from crud import (
    create_expense, get_expenses, get_expense, update_expense, delete_expense,
    get_expense_stats, get_expenses_by_category, get_monthly_expenses
)
from auth import get_current_user
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense_endpoint(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_expense(db=db, expense=expense, user_id=current_user.id)


@router.get("/", response_model=List[ExpenseResponse])
def read_expenses(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = get_expenses(
        db=db,
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        category=category,
        start_date=start_date,
        end_date=end_date,
        month=month,
        year=year,
        search=search
    )
    return expenses


@router.get("/stats")
def get_stats(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = get_expense_stats(db, current_user.id, month=month, year=year)
    return {"total": total}


@router.get("/by-category")
def get_by_category(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = get_expenses_by_category(db, current_user.id, month=month, year=year)
    return [{"category": cat, "amount": float(amount)} for cat, amount in results]


@router.get("/monthly")
def get_monthly(
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = get_monthly_expenses(db, current_user.id, year=year)
    return [{"month": int(month), "amount": float(amount)} for month, amount in results]


@router.get("/{expense_id}", response_model=ExpenseResponse)
def read_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = get_expense(db=db, expense_id=expense_id, user_id=current_user.id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense_endpoint(
    expense_id: int,
    expense: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_expense = update_expense(db=db, expense_id=expense_id, expense=expense, user_id=current_user.id)
    if updated_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated_expense


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_endpoint(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = delete_expense(db=db, expense_id=expense_id, user_id=current_user.id)
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return None


@router.get("/export/csv")
def export_expenses_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = get_expenses(db=db, user_id=current_user.id, limit=10000)
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Amount", "Category", "Date", "Description", "Payment Method"])
    
    for expense in expenses:
        writer.writerow([
            expense.id,
            expense.title,
            expense.amount,
            expense.category,
            expense.date.isoformat(),
            expense.description or "",
            expense.payment_method or ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"}
    )
