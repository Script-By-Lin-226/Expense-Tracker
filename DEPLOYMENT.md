# Deployment Guide

This guide covers deploying the Expense Tracker application to production.

## Frontend Deployment

### 1. Environment Configuration

Create a `.env` file in the `frontend` directory:

```bash
cd frontend
cp env.example .env
```

Edit `.env` and set your production API URL:
```bash
VITE_API_URL=https://your-api-domain.com/api
```

### 2. Build the Frontend

```bash
npm run build
```

This creates a `dist` folder with production-ready static files.

### 3. Deploy Options

#### Option A: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the frontend directory
3. Set environment variable `VITE_API_URL` in Vercel dashboard

#### Option B: Netlify
1. Connect your repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variable `VITE_API_URL` in Netlify settings

#### Option C: Static Hosting (Nginx/Apache)
1. Copy the `dist` folder contents to your web server
2. Configure your web server to serve the static files
3. Set up proper routing for React Router (all routes should serve `index.html`)

#### Option D: GitHub Pages
1. Install gh-pages: `npm install --save-dev gh-pages`
2. Add to `package.json`:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```
3. Run `npm run deploy`

## Backend Deployment

### 1. Environment Configuration

Set environment variables:

```bash
# Database (if using PostgreSQL)
export DATABASE_URL="postgresql://user:password@host:5432/dbname"

# CORS Origins (comma-separated)
export CORS_ORIGINS="https://your-frontend-domain.com,https://www.your-frontend-domain.com"

# JWT Secret (change this!)
export SECRET_KEY="your-super-secret-key-change-this"
```

Or create a `.env` file in the backend directory (requires python-dotenv package).

### 2. Update CORS Settings

The backend automatically reads `CORS_ORIGINS` from environment variables. Make sure to include your frontend domain.

### 3. Deploy Options

#### Option A: Using Gunicorn + Uvicorn

```bash
# Install Gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Option B: Using Uvicorn Directly

```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### Option C: Docker

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t expense-tracker-api .
docker run -p 8000:8000 -e CORS_ORIGINS="https://your-frontend.com" expense-tracker-api
```

#### Option D: Cloud Platforms

**Heroku:**
1. Create `Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
2. Set environment variables in Heroku dashboard
3. Deploy: `git push heroku main`

**Railway/Render/Fly.io:**
1. Connect your repository
2. Set environment variables in platform dashboard
3. Platform will auto-detect and deploy

## Important Notes

### Security Checklist

- [ ] Change `SECRET_KEY` in production
- [ ] Set proper `CORS_ORIGINS` to only allow your frontend domain
- [ ] Use HTTPS for both frontend and backend
- [ ] Use environment variables for sensitive data
- [ ] Consider using PostgreSQL for production instead of SQLite
- [ ] Set up proper database backups
- [ ] Enable rate limiting (consider using slowapi)
- [ ] Set up logging and monitoring

### Database Considerations

For production, consider migrating from SQLite to PostgreSQL:

1. Update `DATABASE_URL` in `backend/database.py` or use environment variable
2. Install PostgreSQL driver: `pip install psycopg2-binary`
3. Update `requirements.txt` to include `psycopg2-binary`
4. Run migrations to create tables

### Environment Variables Summary

**Frontend (.env):**
- `VITE_API_URL`: Backend API URL

**Backend:**
- `DATABASE_URL`: Database connection string
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `SECRET_KEY`: JWT secret key

## Troubleshooting

### Frontend can't connect to backend
- Check `VITE_API_URL` is set correctly
- Verify CORS settings include your frontend domain
- Check backend is accessible from frontend domain

### CORS errors in production
- Ensure `CORS_ORIGINS` includes your exact frontend URL (with https://)
- Check for trailing slashes in URLs
- Verify backend is accepting requests from frontend domain

### Database errors
- Ensure database file has proper permissions (SQLite)
- Check database connection string (PostgreSQL)
- Verify database exists and is accessible
