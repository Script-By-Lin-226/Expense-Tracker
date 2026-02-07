"""
Script to seed the database with sample data for testing.
Run this after setting up the database and creating a user.
"""
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Expense, Income
from datetime import date, timedelta
import random

# Sample categories
categories = ['Food', 'Transport', 'Rent', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other']
payment_methods = ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'PayPal']

def seed_data(username: str):
    db: Session = SessionLocal()
    
    try:
        # Get user
        user = db.query(User).filter(User.username == username).first()
        if not user:
            print(f"User '{username}' not found. Please create the user first.")
            return
        
        print(f"Seeding data for user: {username}")
        
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.query(Expense).filter(Expense.user_id == user.id).delete()
        # db.query(Income).filter(Income.user_id == user.id).delete()
        # db.commit()
        
        # Generate sample expenses
        expenses = []
        for i in range(50):
            expense_date = date.today() - timedelta(days=random.randint(0, 90))
            expenses.append(Expense(
                title=f"Expense {i+1}",
                amount=round(random.uniform(10, 500), 2),
                category=random.choice(categories),
                date=expense_date,
                description=f"Sample expense description {i+1}",
                payment_method=random.choice(payment_methods),
                user_id=user.id
            ))
        
        db.add_all(expenses)
        
        # Generate sample income
        income = []
        for i in range(20):
            income_date = date.today() - timedelta(days=random.randint(0, 90))
            income.append(Income(
                title=f"Income {i+1}",
                amount=round(random.uniform(500, 5000), 2),
                category=random.choice(categories),
                date=income_date,
                description=f"Sample income description {i+1}",
                user_id=user.id
            ))
        
        db.add_all(income)
        db.commit()
        
        print(f"Successfully seeded {len(expenses)} expenses and {len(income)} income entries!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        seed_data(sys.argv[1])
    else:
        print("Usage: python seed_data.py <username>")
        print("Example: python seed_data.py admin")
