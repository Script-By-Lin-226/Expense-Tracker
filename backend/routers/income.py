from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import date
from database import get_db
from models import User
from schemas import IncomeCreate, IncomeUpdate, IncomeResponse
from crud import (
    create_income, get_income_list, get_income, update_income, delete_income,
    get_income_stats
)
from auth import get_current_user
import csv
from io import StringIO
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.post("/", response_model=IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income_endpoint(
    income: IncomeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return create_income(db=db, income=income, user_id=current_user.id)


@router.get("/", response_model=List[IncomeResponse])
def read_income_list(
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
    income_list = get_income_list(
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
    return income_list


@router.get("/stats")
def get_stats(
    month: Optional[int] = None,
    year: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = get_income_stats(db, current_user.id, month=month, year=year)
    return {"total": total}


@router.get("/{income_id}", response_model=IncomeResponse)
def read_income(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income = get_income(db=db, income_id=income_id, user_id=current_user.id)
    if income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return income


@router.put("/{income_id}", response_model=IncomeResponse)
def update_income_endpoint(
    income_id: int,
    income: IncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    updated_income = update_income(db=db, income_id=income_id, income=income, user_id=current_user.id)
    if updated_income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return updated_income


@router.delete("/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income_endpoint(
    income_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income = delete_income(db=db, income_id=income_id, user_id=current_user.id)
    if income is None:
        raise HTTPException(status_code=404, detail="Income not found")
    return None


@router.get("/export/csv")
def export_income_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    income_list = get_income_list(db=db, user_id=current_user.id, limit=10000)
    
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Title", "Amount", "Category", "Date", "Description"])
    
    for income in income_list:
        writer.writerow([
            income.id,
            income.title,
            income.amount,
            income.category,
            income.date.isoformat(),
            income.description or ""
        ])
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=income.csv"}
    )
