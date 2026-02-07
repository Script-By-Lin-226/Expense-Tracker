# Expense Tracker - Full Stack Web Application

A comprehensive expense and income tracking application built with React (Vite) and Node.js/Express.

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
- Node.js/Express
- Better-SQLite3 (SQLite database)
- JWT Authentication
- bcryptjs for password hashing
- Express Validator

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
└── frontend/
    ├── server/
    │   ├── index.js
    │   ├── database/
    │   │   └── db.js
    │   ├── middleware/
    │   │   └── auth.js
    │   └── routes/
    │       ├── auth.js
    │       ├── expense.js
    │       ├── income.js
    │       └── dashboard.js
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
    ├── data/
    │   └── expense_tracker.db (auto-created)
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server (runs both frontend and backend):**
   ```bash
   npm run dev
   ```
   
   This will start:
   - Backend API at `http://localhost:8000`
   - Frontend at `http://localhost:5173`

4. **Database setup:**
   - SQLite database will be created automatically in `frontend/data/expense_tracker.db`
   - Tables are created automatically on first server start
   - No additional setup required!

### Alternative: Run separately

If you want to run frontend and backend separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

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

Create a `.env` file in the `frontend` directory:

```bash
# Server Configuration
PORT=8000
SECRET_KEY=your-secret-key-change-this-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-frontend-domain.com

# Frontend API URL (optional, defaults to http://localhost:8000/api)
VITE_API_URL=http://localhost:8000/api
```

### Environment Variables Explained

- `PORT`: Backend server port (default: 8000)
- `SECRET_KEY`: JWT secret key for authentication (change in production!)
- `CORS_ORIGINS`: Comma-separated list of allowed frontend origins
- `VITE_API_URL`: Frontend API URL (for production deployments)

## Troubleshooting

### Server Issues
- Verify all dependencies are installed: `npm install`
- Check if port 8000 is available
- Ensure you have write permissions in the `frontend/data` directory (for SQLite database)
- If database issues occur, delete `frontend/data/expense_tracker.db` and restart the server

### Frontend Issues
- Ensure backend server is running on port 8000
- Clear browser cache
- Check browser console for errors
- Verify all npm packages are installed: `npm install`

### Common Errors
- **Port already in use**: Change `PORT` in `.env` file
- **Database locked**: Close any other connections to the database
- **Module not found**: Run `npm install` again

## Development

### Running in Development Mode
- Both servers: `npm run dev` (runs frontend and backend together)
- Backend only: `npm run server`
- Frontend only: `npm run client`

### Building for Production

#### Deploy to Vercel/Netlify (Recommended)

**Full Stack Deployment:**
1. Push your code to GitHub
2. Connect repository to Vercel or Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend API URL
   - Or deploy backend separately and use that URL

**Backend Deployment (Separate):**
- Deploy backend to Railway, Render, or similar
- Update `VITE_API_URL` in frontend environment variables

#### Frontend Deployment

1. **Set up environment variables:**
   ```bash
   cd frontend
   # Copy the example env file
   cp env.example .env
   # Edit .env and set your production API URL
   # VITE_API_URL=https://your-api-domain.com/api
   ```

2. **Build the frontend:**
   ```bash
   npm run build
   ```
   This creates a `dist` folder with production-ready files.

3. **Deploy the `dist` folder:**
   - You can deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.)
   - Or serve with a web server like Nginx or Apache

#### Backend Deployment

1. **Set up environment variables:**
   - Set `DATABASE_URL` if using a different database
   - Set `SECRET_KEY` for JWT tokens (change from default)

2. **Use a production ASGI server:**
   ```bash
   # Install Gunicorn
   pip install gunicorn
   
   # Run with Uvicorn workers
   gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **Or use Uvicorn directly:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

#### Environment Variables

**All in `.env` file in frontend directory:**
- `PORT`: Backend server port (default: `8000`)
- `SECRET_KEY`: JWT secret key (change in production!)
- `CORS_ORIGINS`: Comma-separated allowed origins
- `VITE_API_URL`: Frontend API URL (default: `http://localhost:8000/api`)

## License

This project is open source and available for personal and commercial use.

## Contributing

Feel free to submit issues and enhancement requests!
