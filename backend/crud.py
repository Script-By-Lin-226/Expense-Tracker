from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import date, datetime
from typing import Optional, List
from models import User, Expense, Income
from schemas import UserCreate, ExpenseCreate, ExpenseUpdate, IncomeCreate, IncomeUpdate
from auth import get_password_hash, verify_password


# User CRUD
def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


# Expense CRUD
def create_expense(db: Session, expense: ExpenseCreate, user_id: int):
    db_expense = Expense(**expense.dict(), user_id=user_id)
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def get_expenses(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    search: Optional[str] = None
):
    query = db.query(Expense).filter(Expense.user_id == user_id)
    
    if category:
        query = query.filter(Expense.category == category)
    if start_date:
        query = query.filter(Expense.date >= start_date)
    if end_date:
        query = query.filter(Expense.date <= end_date)
    if month:
        query = query.filter(func.extract('month', Expense.date) == month)
    if year:
        query = query.filter(func.extract('year', Expense.date) == year)
    if search:
        query = query.filter(
            or_(
                Expense.title.ilike(f"%{search}%"),
                Expense.category.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(Expense.date.desc()).offset(skip).limit(limit).all()


def get_expense(db: Session, expense_id: int, user_id: int):
    return db.query(Expense).filter(
        and_(Expense.id == expense_id, Expense.user_id == user_id)
    ).first()


def update_expense(db: Session, expense_id: int, expense: ExpenseUpdate, user_id: int):
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return None
    update_data = expense.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int, user_id: int):
    db_expense = get_expense(db, expense_id, user_id)
    if not db_expense:
        return None
    db.delete(db_expense)
    db.commit()
    return db_expense


def get_expense_stats(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(func.sum(Expense.amount)).filter(Expense.user_id == user_id)
    if month:
        query = query.filter(func.extract('month', Expense.date) == month)
    if year:
        query = query.filter(func.extract('year', Expense.date) == year)
    return query.scalar() or 0.0


def get_expenses_by_category(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(
        Expense.category,
        func.sum(Expense.amount).label('total')
    ).filter(Expense.user_id == user_id)
    
    if month:
        query = query.filter(func.extract('month', Expense.date) == month)
    if year:
        query = query.filter(func.extract('year', Expense.date) == year)
    
    return query.group_by(Expense.category).all()


def get_monthly_expenses(db: Session, user_id: int, year: Optional[int] = None):
    query = db.query(
        func.extract('month', Expense.date).label('month'),
        func.sum(Expense.amount).label('total')
    ).filter(Expense.user_id == user_id)
    
    if year:
        query = query.filter(func.extract('year', Expense.date) == year)
    
    return query.group_by(func.extract('month', Expense.date)).all()


# Income CRUD
def create_income(db: Session, income: IncomeCreate, user_id: int):
    db_income = Income(**income.dict(), user_id=user_id)
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


def get_income_list(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    month: Optional[int] = None,
    year: Optional[int] = None,
    search: Optional[str] = None
):
    query = db.query(Income).filter(Income.user_id == user_id)
    
    if category:
        query = query.filter(Income.category == category)
    if start_date:
        query = query.filter(Income.date >= start_date)
    if end_date:
        query = query.filter(Income.date <= end_date)
    if month:
        query = query.filter(func.extract('month', Income.date) == month)
    if year:
        query = query.filter(func.extract('year', Income.date) == year)
    if search:
        query = query.filter(
            or_(
                Income.title.ilike(f"%{search}%"),
                Income.category.ilike(f"%{search}%")
            )
        )
    
    return query.order_by(Income.date.desc()).offset(skip).limit(limit).all()


def get_income(db: Session, income_id: int, user_id: int):
    return db.query(Income).filter(
        and_(Income.id == income_id, Income.user_id == user_id)
    ).first()


def update_income(db: Session, income_id: int, income: IncomeUpdate, user_id: int):
    db_income = get_income(db, income_id, user_id)
    if not db_income:
        return None
    update_data = income.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_income, field, value)
    db.commit()
    db.refresh(db_income)
    return db_income


def delete_income(db: Session, income_id: int, user_id: int):
    db_income = get_income(db, income_id, user_id)
    if not db_income:
        return None
    db.delete(db_income)
    db.commit()
    return db_income


def get_income_stats(db: Session, user_id: int, month: Optional[int] = None, year: Optional[int] = None):
    query = db.query(func.sum(Income.amount)).filter(Income.user_id == user_id)
    if month:
        query = query.filter(func.extract('month', Income.date) == month)
    if year:
        query = query.filter(func.extract('year', Income.date) == year)
    return query.scalar() or 0.0


def get_dashboard_stats(db: Session, user_id: int):
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    total_income = get_income_stats(db, user_id)
    total_expense = get_expense_stats(db, user_id)
    monthly_expense = get_expense_stats(db, user_id, month=current_month, year=current_year)
    total_balance = total_income - total_expense
    
    # Get recent transactions (last 10)
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user_id
    ).order_by(Expense.date.desc()).limit(5).all()
    
    recent_income = db.query(Income).filter(
        Income.user_id == user_id
    ).order_by(Income.date.desc()).limit(5).all()
    
    recent_transactions = []
    for exp in recent_expenses:
        recent_transactions.append({
            "id": exp.id,
            "title": exp.title,
            "amount": exp.amount,
            "type": "expense",
            "date": exp.date.isoformat(),
            "category": exp.category
        })
    for inc in recent_income:
        recent_transactions.append({
            "id": inc.id,
            "title": inc.title,
            "amount": inc.amount,
            "type": "income",
            "date": inc.date.isoformat(),
            "category": inc.category
        })
    
    recent_transactions.sort(key=lambda x: x["date"], reverse=True)
    recent_transactions = recent_transactions[:10]
    
    return {
        "total_balance": total_balance,
        "total_income": total_income,
        "total_expense": total_expense,
        "monthly_expense": monthly_expense,
        "recent_transactions": recent_transactions
    }
