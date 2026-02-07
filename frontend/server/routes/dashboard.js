import express from 'express';
import { getDatabase } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', (req, res) => {
  try {
    const db = getDatabase();
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();

    // Total income
    const totalIncomeResult = db.prepare('SELECT SUM(amount) as total FROM income WHERE user_id = ?')
      .get(userId);
    const totalIncome = totalIncomeResult.total || 0;

    // Total expense
    const totalExpenseResult = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE user_id = ?')
      .get(userId);
    const totalExpense = totalExpenseResult.total || 0;

    // Monthly expense
    const monthlyExpenseResult = db.prepare(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
    ).get(userId, currentMonth, String(currentYear));
    const monthlyExpense = monthlyExpenseResult.total || 0;

    // Recent transactions
    const recentExpenses = db.prepare(
      'SELECT id, title, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 5'
    ).all(userId);

    const recentIncome = db.prepare(
      'SELECT id, title, amount, category, date FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 5'
    ).all(userId);

    const recentTransactions = [
      ...recentExpenses.map(exp => ({
        id: exp.id,
        title: exp.title,
        amount: exp.amount,
        type: 'expense',
        date: exp.date,
        category: exp.category
      })),
      ...recentIncome.map(inc => ({
        id: inc.id,
        title: inc.title,
        amount: inc.amount,
        type: 'income',
        date: inc.date,
        category: inc.category
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

    res.json({
      total_balance: totalIncome - totalExpense,
      total_income: totalIncome,
      total_expense: totalExpense,
      monthly_expense: monthlyExpense,
      recent_transactions: recentTransactions
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ detail: 'Failed to get dashboard stats' });
  }
});

// Get expense trend
router.get('/expense-trend', (req, res) => {
  try {
    const { year } = req.query;
    const db = getDatabase();
    const userId = req.user.id;
    
    let query = 'SELECT strftime("%m", date) as month, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    query += ' GROUP BY month ORDER BY month';
    const results = db.prepare(query).all(...params);
    
    res.json(results.map(r => ({ month: parseInt(r.month), amount: r.amount || 0 })));
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get expense trend' });
  }
});

// Get income vs expense
router.get('/income-vs-expense', (req, res) => {
  try {
    const { year } = req.query;
    const db = getDatabase();
    const userId = req.user.id;
    const targetYear = year || new Date().getFullYear();

    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, '0');
      
      const incomeResult = db.prepare(
        'SELECT SUM(amount) as total FROM income WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
      ).get(userId, monthStr, String(targetYear));
      
      const expenseResult = db.prepare(
        'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
      ).get(userId, monthStr, String(targetYear));

      months.push({
        month,
        income: incomeResult.total || 0,
        expense: expenseResult.total || 0
      });
    }

    res.json(months);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get income vs expense' });
  }
});

export default router;
