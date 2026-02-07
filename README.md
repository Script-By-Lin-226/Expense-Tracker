# Expense Tracker - Full Stack Web Application

A comprehensive expense and income tracking application built with React (Vite) and FastAPI.

## Features

### Authentication
- User registration
- User login with JWT authentication
- Protected routes

### Expense Management
- Add, edit, and delete expenses
- View expenses list with filtering
- Expense fields: title, amount, category, date, description, payment_method

### Income Management
- Add, edit, and delete income
- View income list with filtering
- Income fields: title, amount, category, date, description

### Categories
- Default categories: Food, Transport, Rent, Shopping, Bills, Entertainment, Health, Other
- Support for custom categories

### Dashboard
- Total balance, income, and expense
- Monthly expense summary
- Recent transactions list

### Visualizations
1. **Pie Chart**: Expense by category
2. **Bar Chart**: Monthly expenses
3. **Line Chart**: Expense trend over time
4. **Income vs Expense Chart**: Comparative analysis

### Filtering & Search
- Filter by date range
- Filter by category
- Filter by month and year
- Search by title and category

### Export Features
- Export expenses to CSV
- Export income to CSV
- Export to Excel format

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy ORM
- SQLite (local database)
- JWT Authentication
- Python 3.8+

### Frontend
- React 18
- Vite
- Tailwind CSS
- Recharts for visualizations
- Axios for API calls
- React Router for navigation

## Project Structure

```
Expense Tracker/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── crud.py
│   ├── auth.py
│   ├── requirements.txt
│   └── routers/
│       ├── auth.py
│       ├── expense.py
│       ├── income.py
│       └── dashboard.py
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Dashboard.jsx
    │   │   ├── ExpenseForm.jsx
    │   │   ├── ExpenseList.jsx
    │   │   ├── IncomeForm.jsx
    │   │   ├── IncomeList.jsx
    │   │   └── Navbar.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- pip (Python package manager)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   ```

3. **Activate virtual environment:**
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Database setup:**
   - SQLite database will be created automatically as `expense_tracker.db` in the backend directory
   - No additional database setup required!
   - The tables will be created automatically when you start the server.

7. **Start the backend server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`
   API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`

## Usage

1. **Register a new account:**
   - Navigate to the registration page
   - Fill in username, email, and password
   - Click "Register"

2. **Login:**
   - Use your credentials to log in
   - You'll be redirected to the home page

3. **Add Expenses/Income:**
   - Use the form on the left side to add new entries
   - Fill in all required fields
   - Click "Add Expense" or "Add Income"

4. **View Dashboard:**
   - Click on "Dashboard" in the navigation bar
   - View your financial overview and charts

5. **Filter and Search:**
   - Use the filter options at the top of the home page
   - Filter by category, month, year, or date range
   - Search by title or category

6. **Export Data:**
   - Click "Export CSV" or "Export Excel" buttons
   - Your data will be downloaded

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Expenses
- `GET /api/expenses/` - Get all expenses (with filters)
- `POST /api/expenses/` - Create a new expense
- `GET /api/expenses/{id}` - Get expense by ID
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/stats` - Get expense statistics
- `GET /api/expenses/by-category` - Get expenses grouped by category
- `GET /api/expenses/monthly` - Get monthly expenses
- `GET /api/expenses/export/csv` - Export expenses to CSV

### Income
- `GET /api/income/` - Get all income (with filters)
- `POST /api/income/` - Create a new income entry
- `GET /api/income/{id}` - Get income by ID
- `PUT /api/income/{id}` - Update income
- `DELETE /api/income/{id}` - Delete income
- `GET /api/income/stats` - Get income statistics
- `GET /api/income/export/csv` - Export income to CSV

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/expense-trend` - Get expense trend data
- `GET /api/dashboard/income-vs-expense` - Get income vs expense comparison

## Database Models

### User
- id (Integer, Primary Key)
- username (String, Unique)
- email (String, Unique)
- password_hash (String)

### Expense
- id (Integer, Primary Key)
- title (String)
- amount (Float)
- category (String)
- date (Date)
- description (Text, Optional)
- payment_method (String, Optional)
- user_id (Integer, Foreign Key)

### Income
- id (Integer, Primary Key)
- title (String)
- amount (Float)
- category (String)
- date (Date)
- description (Text, Optional)
- user_id (Integer, Foreign Key)

## Default Categories

- Food
- Transport
- Rent
- Shopping
- Bills
- Entertainment
- Health
- Other

Note: You can also create custom categories by typing them in the category field.

## Environment Variables

For production, you should set the following environment variables:

- `DATABASE_URL`: SQLite database path (default: `sqlite:///./expense_tracker.db`)
- `SECRET_KEY`: JWT secret key (change in `backend/auth.py`)

## Troubleshooting

### Backend Issues
- Verify all dependencies are installed
- Check if port 8000 is available
- Ensure you have write permissions in the backend directory (for SQLite database file)
- If database issues occur, delete `expense_tracker.db` and restart the server to recreate it

### Frontend Issues
- Ensure backend is running on port 8000
- Clear browser cache
- Check browser console for errors
- Verify all npm packages are installed

## Development

### Running in Development Mode
- Backend: `uvicorn main:app --reload`
- Frontend: `npm run dev`

### Building for Production
- Frontend: `npm run build`
- Backend: Use a production ASGI server like Gunicorn with Uvicorn workers

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to submit issues and enhancement requests!
