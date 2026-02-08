import express from 'express';
import { query } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const currentYear = now.getFullYear();

    // Total income
    const { rows: totalIncomeRows } = await query(
      'SELECT SUM(amount) as total FROM income WHERE user_id = ?',
      [userId]
    );
    const totalIncome = totalIncomeRows[0]?.total || 0;

    // Total expense
    const { rows: totalExpenseRows } = await query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?',
      [userId]
    );
    const totalExpense = totalExpenseRows[0]?.total || 0;

    // Monthly expense
    const { rows: monthlyExpenseRows } = await query(
      'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?',
      [userId, currentMonth, String(currentYear)]
    );
    const monthlyExpense = monthlyExpenseRows[0]?.total || 0;

    // Recent transactions
    const { rows: recentExpenses } = await query(
      'SELECT id, title, amount, category, date FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 5',
      [userId]
    );

    const { rows: recentIncome } = await query(
      'SELECT id, title, amount, category, date FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 5',
      [userId]
    );

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
    const userId = req.user.id;

    let sql = 'SELECT strftime("%m", date) as month, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [userId];

    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    sql += ' GROUP BY month ORDER BY month';

    const { rows } = await query(sql, params);

    res.json(rows.map(r => ({ month: parseInt(r.month), amount: r.amount || 0 })));
  } catch (error) {
    console.error('Expense trend error:', error);
    res.status(500).json({ detail: 'Failed to get expense trend' });
  }
});

// Get income vs expense
router.get('/income-vs-expense', async (req, res) => {
  try {
    const { year } = req.query;
    const userId = req.user.id;
    const targetYear = year || new Date().getFullYear();

    const months = [];
    for (let month = 1; month <= 12; month++) {
      const monthStr = String(month).padStart(2, '0');

      const { rows: incomeRows } = await query(
        'SELECT SUM(amount) as total FROM income WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?',
        [userId, monthStr, String(targetYear)]
      );

      const { rows: expenseRows } = await query(
        'SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND strftime("%m", date) = ? AND strftime("%Y", date) = ?',
        [userId, monthStr, String(targetYear)]
      );

      months.push({
        month,
        income: incomeRows[0]?.total || 0,
        expense: expenseRows[0]?.total || 0
      });
    }

    res.json(months);
  } catch (error) {
    console.error('Income vs expense error:', error);
    res.status(500).json({ detail: 'Failed to get income vs expense' });
  }
});

export default router;
