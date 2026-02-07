# Quick Start Guide

## Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] pip and npm available

## Step-by-Step Setup

### 1. Backend Setup (Terminal 1)
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# No database setup needed! SQLite database will be created automatically
# Database file: expense_tracker.db (created in backend directory)

# Start server
uvicorn main:app --reload
```

Backend will run on: http://localhost:8000
API Docs: http://localhost:8000/docs

### 2. Frontend Setup (Terminal 2)
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: http://localhost:5173

### 3. First Use
1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account
3. Fill in username, email, and password
4. Click "Register"
5. You'll be redirected to login page
6. Login with your credentials
7. Start adding expenses and income!

### 4. (Optional) Seed Sample Data
```bash
cd backend
python seed_data.py <your_username>
```

This will create 50 sample expenses and 20 sample income entries for testing.

## Troubleshooting

### Backend won't start
- Ensure all dependencies are installed
- Check if port 8000 is available
- Ensure you have write permissions in the backend directory (for SQLite database file)

### Frontend won't start
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check if port 5173 is available
- Ensure backend is running

### Database connection error
- Delete `expense_tracker.db` file and restart the server to recreate it
- Check file permissions in the backend directory
- Ensure SQLite is available (comes with Python by default)

### CORS errors
- Ensure backend CORS settings include frontend URL
- Check that both servers are running
- Verify API URL in `frontend/src/services/api.js`

## Default Test Account
After registration, you can use your own account. For testing with sample data:
1. Register a test account (e.g., username: "testuser")
2. Run: `python backend/seed_data.py testuser`
3. Login and view the dashboard with sample data

## Next Steps
- Add your real expenses and income
- Explore the dashboard charts
- Try filtering and searching
- Export your data

Happy tracking! 💰
