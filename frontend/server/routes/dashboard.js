import express from 'express';
import { getDatabase } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Helper function to convert sql.js result to array of objects
function rowsToObjects(rows) {
  if (!rows || rows.length === 0) return [];
  const result = [];
  for (let i = 0; i < rows.length; i++) {
    const row = {};
    for (let j = 0; j < rows.columns.length; j++) {
      row[rows.columns[j]] = rows.values[i][j];
    }
    result.push(row);
  }
  return result;
}

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();

    // Total income
    const incomeStmt = db.prepare('SELECT SUM(amount) as total FROM income WHERE user_id = ?');
    incomeStmt.bind([userId]);
    const totalIncomeResult = incomeStmt.getAsObject();
    incomeStmt.free();
    const totalIncome = totalIncomeResult.total || 0;

    // Total expense
    const expenseStmt = db.prepare('SELECT SUM(amount) as total FROM expenses WHERE user_id = ?');
    expenseStmt.bind([userId]);
    const totalExpenseResult = expenseStmt.getAsObject();
    expenseStmt.free();
    const totalExpense = totalExpenseResult.total || 0;

    // Monthly expense
    const monthlyStmt = db.prepare(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
    );
    monthlyStmt.bind([userId, currentMonth, String(currentYear)]);
    const monthlyExpenseResult = monthlyStmt.getAsObject();
    monthlyStmt.free();
    const monthlyExpense = monthlyExpenseResult.total || 0;

    // Recent transactions
    const recentExpStmt = db.prepare(
      'SELECT id, title, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 5'
    );
    recentExpStmt.bind([userId]);
    const recentExpRows = recentExpStmt.get();
    recentExpStmt.free();

    const recentIncStmt = db.prepare(
      'SELECT id, title, amount, category, date FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 5'
    );
    recentIncStmt.bind([userId]);
    const recentIncRows = recentIncStmt.get();
    recentIncStmt.free();

    const recentExpenses = rowsToObjects(recentExpRows);
    const recentIncome = rowsToObjects(recentIncRows);

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
router.get('/expense-trend', async (req, res) => {
  try {
    const { year } = req.query;
    const db = await getDatabase();
    const userId = req.user.id;
    
    let query = 'SELECT strftime("%m", date) as month, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    query += ' GROUP BY month ORDER BY month';
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = stmt.get();
    stmt.free();
    
    const results = rowsToObjects(rows);
    res.json(results.map(r => ({ month: parseInt(r.month), amount: r.amount || 0 })));
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get expense trend' });
  }
});

// Get income vs expense
router.get('/income-vs-expense', async (req, res) => {
  try {
    const { year } = req.query;
    const db = await getDatabase();
    const userId = req.user.id;
    const targetYear = year || new Date().getFullYear();

    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, '0');
      
      const incomeStmt = db.prepare(
        'SELECT SUM(amount) as total FROM income WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
      );
      incomeStmt.bind([userId, monthStr, String(targetYear)]);
      const incomeResult = incomeStmt.getAsObject();
      incomeStmt.free();
      
      const expenseStmt = db.prepare(
        'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?'
      );
      expenseStmt.bind([userId, monthStr, String(targetYear)]);
      const expenseResult = expenseStmt.getAsObject();
      expenseStmt.free();

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
