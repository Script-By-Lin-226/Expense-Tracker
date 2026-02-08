import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import routes
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expense.js';
import incomeRoutes from './routes/income.js';
import dashboardRoutes from './routes/dashboard.js';

// Import database initialization
import { initDatabase } from './database/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://expense-tracker-liard-mu-63.vercel.app'
  ];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database (async)
initDatabase().catch(console.error);

// Routes
app.get(['/', '/api'], (req, res) => {
  res.json({ message: 'Expense Tracker API Is Running' });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url: req.url
  });
});

// Support both /api/PREFIX and /PREFIX to handle various Hosting/Proxy setups
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/expenses', '/expenses'], expenseRoutes);
app.use(['/api/income', '/income'], incomeRoutes);
app.use(['/api/dashboard', '/dashboard'], dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ detail: 'Internal server error', error: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    detail: 'Route not found',
    path: req.path,
    url: req.url,
    method: req.method
  });
});

if (process.argv[1] === __filename) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
