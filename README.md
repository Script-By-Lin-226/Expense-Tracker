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
- SQLite (In-Memory Mode) - using `sql.js`
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
    ├── api/            # Vercel Serverless Function Entry Point
    │   └── index.js
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
    │   └── ...
    ├── package.json
    ├── vite.config.js
    ├── vercel.json
    └── tailwind.config.js
```

## Setup Instructions

### Prerequisites
- Node.js 18 or higher
- npm

### Setup

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
   
   This will start:
   - Backend API at `http://localhost:8000`
   - Frontend at `http://localhost:5173`

   **Note:** The app uses an in-memory database. 
   **Default Login:**
   - Email: `linlinaung@gmail.com`
   - Password: `linlin`
   
   *Data will reset when the server restarts.*

## Deployment

### Deploy to Vercel

This project is configured for Vercel deployment with an in-memory database (Demo Mode).

1. **Push your code to GitHub.**

2. **Import project in Vercel:**
   - Select the `frontend` directory as the Root Directory.
   - Framework Preset: Vite

3. **Configure Environment Variables:**
   - `SECRET_KEY`: (Optional) A random string for JWT.
   - `VITE_API_URL`: `/api`
   - **No Database URL needed.**

4. **Deploy!**

The app will run with a temporary database that resets periodically (whenever the serverless function cold starts).


### User
- id (Serial, Primary Key)
- username (Text, Unique)
- email (Text, Unique)
- password_hash (Text)

### Expense
- id (Serial, Primary Key)
- title (Text)
- amount (Decimal)
- category (Text)
- date (Date)
- description (Text)
- payment_method (Text)
- user_id (Integer, Foreign Key)

### Income
- id (Serial, Primary Key)
- title (Text)
- amount (Decimal)
- category (Text)
- date (Date)
- description (Text)
- user_id (Serial, Foreign Key)

## License

This project is open source and available for personal and commercial use.
