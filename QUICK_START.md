# Quick Start Guide

## Prerequisites Check
- [ ] Node.js 16+ installed
- [ ] npm available

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

This will start both:
- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:5173

### 3. First Use
1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account
3. Fill in username, email, and password
4. Click "Register"
5. You'll be redirected to login page
6. Login with your credentials
7. Start adding expenses and income!

### 4. Database
- SQLite database is automatically created in `frontend/data/expense_tracker.db`
- Tables are created automatically on first server start
- No additional setup needed!

## Alternative: Run Separately

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Troubleshooting

### Server won't start
- Ensure all dependencies are installed: `npm install`
- Check if port 8000 is available
- Ensure you have write permissions in the `frontend/data` directory

### Frontend won't start
- Run `npm install` again
- Delete `node_modules` and reinstall
- Check if port 5173 is available
- Ensure backend server is running

### Database connection error
- Delete `frontend/data/expense_tracker.db` file and restart the server
- Check file permissions in the `frontend/data` directory
- Ensure the `data` directory exists

### CORS errors
- Check `.env` file has correct `CORS_ORIGINS` setting
- Ensure both servers are running
- Verify API URL in `frontend/src/services/api.js`

## Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
PORT=8000
SECRET_KEY=your-secret-key-change-this-in-production
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
VITE_API_URL=http://localhost:8000/api
```

## Next Steps
- Add your real expenses and income
- Explore the dashboard charts
- Try filtering and searching
- Export your data

Happy tracking! 💰
