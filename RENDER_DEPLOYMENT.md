# Render Deployment Guide for Backend

This guide will help you deploy the Expense Tracker backend to Render.

## Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository
- A Render account (free tier available)

## Step-by-Step Deployment

### Option 1: Using render.yaml (Recommended)

1. **Create render.yaml file** (already created in project root)
   - This file contains all the configuration needed

2. **Push to GitHub**
   ```bash
   git add render.yaml
   git commit -m "Add Render configuration"
   git push
   ```

3. **Deploy on Render**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to deploy

### Option 2: Manual Setup

#### 1. Create a Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository

#### 2. Configure the Service

**Basic Settings:**
- **Name**: `expense-tracker-api` (or your preferred name)
- **Region**: Choose closest to you (e.g., Oregon)
- **Branch**: `main` (or your default branch)
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 3. Set Environment Variables

Click "Advanced" and add these environment variables:

**Required:**
- `DATABASE_URL`: Will be set automatically if you create a database (see below)
- `CORS_ORIGINS`: Your frontend URL (e.g., `https://your-frontend.onrender.com`)
- `SECRET_KEY`: Generate a secure random string (you can use: `openssl rand -hex 32`)

**Optional:**
- `PYTHON_VERSION`: `3.11` (or your preferred version)

#### 4. Create PostgreSQL Database (Recommended for Production)

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `expense-tracker-db`
   - **Database**: `expense_tracker`
   - **User**: `expense_tracker_user`
   - **Plan**: Free (for testing) or paid (for production)
3. After creation, copy the **Internal Database URL**
4. Go back to your Web Service settings
5. Add environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the Internal Database URL

**Note**: Render automatically provides `DATABASE_URL` if you link the database to your service.

#### 5. Link Database to Service

1. In your Web Service settings
2. Go to "Connections" tab
3. Click "Link Database"
4. Select your PostgreSQL database
5. Render will automatically set `DATABASE_URL`

### 6. Update Database Configuration

If using PostgreSQL, update `backend/requirements.txt` to include:

```txt
psycopg2-binary==2.9.9
```

Then update `backend/database.py` to handle PostgreSQL connection strings properly (already configured).

### 7. Deploy

1. Click "Create Web Service"
2. Render will:
   - Clone your repository
   - Install dependencies
   - Start your application
3. Your API will be available at: `https://your-service-name.onrender.com`

## Environment Variables Summary

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | Auto-set by Render if database is linked |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) | `https://myapp.onrender.com` |
| `SECRET_KEY` | JWT secret key | Generate with `openssl rand -hex 32` |
| `PORT` | Server port | Auto-set by Render (don't override) |

## Post-Deployment

### 1. Test Your API

Visit: `https://your-service-name.onrender.com/docs`

You should see the FastAPI documentation.

### 2. Update Frontend

Update your frontend `.env` file:
```bash
VITE_API_URL=https://your-service-name.onrender.com/api
```

### 3. Update CORS Origins

Make sure `CORS_ORIGINS` includes your frontend URL:
```
CORS_ORIGINS=https://your-frontend.onrender.com
```

## Troubleshooting

### Service Won't Start

1. **Check Logs**: Go to your service → "Logs" tab
2. **Common Issues**:
   - Missing dependencies: Check `requirements.txt`
   - Port issues: Make sure you're using `$PORT` in start command
   - Database connection: Verify `DATABASE_URL` is set correctly

### Database Connection Errors

1. **Check DATABASE_URL**: Ensure it's set correctly
2. **Verify Database Status**: Make sure database is running
3. **Check Connection String**: Should start with `postgresql://`
4. **Internal vs External URL**: Use Internal Database URL for services on Render

### CORS Errors

1. **Verify CORS_ORIGINS**: Must include your exact frontend URL
2. **Check Format**: No trailing slashes, include `https://`
3. **Multiple Origins**: Separate with commas, no spaces

### Service Keeps Restarting

1. **Check Health Check**: Ensure `/` endpoint returns 200
2. **Review Logs**: Look for errors in the logs
3. **Memory Issues**: Free tier has memory limits

## Free Tier Limitations

- Services spin down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- 512MB RAM limit
- Consider upgrading for production use

## Upgrading to Paid Tier

For production, consider:
- **Starter Plan**: $7/month - Always on, more resources
- **Standard Plan**: $25/month - Better performance

## Security Checklist

- [ ] Change `SECRET_KEY` to a secure random value
- [ ] Set `CORS_ORIGINS` to only your frontend domain
- [ ] Use PostgreSQL instead of SQLite for production
- [ ] Enable HTTPS (automatic on Render)
- [ ] Review and restrict API endpoints if needed
- [ ] Set up monitoring and alerts

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Render Status Page](https://status.render.com)

## Quick Reference

**Service URL Format**: `https://your-service-name.onrender.com`
**API Base URL**: `https://your-service-name.onrender.com/api`
**API Docs**: `https://your-service-name.onrender.com/docs`
