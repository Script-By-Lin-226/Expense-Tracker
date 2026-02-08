import express from 'express';
import { query } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { generateCSV } from '../utils/csv.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { category, month, year, start_date, end_date, search } = req.query;

    let sql = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (month) {
      sql += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }
    if (start_date) {
      sql += ' AND date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND date <= ?';
      params.push(end_date);
    }
    if (search) {
      sql += ' AND (title LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    sql += ' ORDER BY date DESC LIMIT 100';

    const { rows } = await query(sql, params);

    res.json(rows);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ detail: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    const expense = rows[0];

    if (!expense) {
      return res.status(404).json({ detail: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to fetch expense' });
  }
});

// Create expense
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
  body('date').notEmpty().withMessage('Date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array()[0].msg });
    }

    const { title, amount, category, date, description, payment_method } = req.body;

    await query(
      'INSERT INTO expenses (title, amount, category, date, description, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, amount, category, date, description || null, payment_method || null, req.user.id]
    );

    // Get the latest expense for this user
    const { rows } = await query('SELECT * FROM expenses WHERE user_id = ? ORDER BY id DESC LIMIT 1', [req.user.id]);

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ detail: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const { rows: checkRows } = await query('SELECT id FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (checkRows.length === 0) {
      return res.status(404).json({ detail: 'Expense not found' });
    }

    const { title, amount, category, date, description, payment_method } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (date !== undefined) { updates.push('date = ?'); params.push(date); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }
    if (payment_method !== undefined) { updates.push('payment_method = ?'); params.push(payment_method); }

    if (updates.length === 0) {
      const { rows } = await query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);
      return res.json(rows[0]);
    }

    params.push(req.params.id, req.user.id);
    await query(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`, params);

    const { rows: updatedRows } = await query('SELECT * FROM expenses WHERE id = ?', [req.params.id]);

    res.json(updatedRows[0]);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ detail: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await query('DELETE FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    // In SQLite DELETE without RETURNING doesn't give deleted count easily via this wrapper unless wrapper handles it.
    // But since we are mocking, let's assume if no error, it's done.
    // Or check existence first.

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ detail: 'Failed to delete expense' });
  }
});

// Get expense stats
router.get('/stats', async (req, res) => {
  try {
    const { month, year } = req.query;

    let sql = 'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (month) {
      sql += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    const { rows } = await query(sql, params);

    res.json({ total: rows[0]?.total || 0 });
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get stats' });
  }
});

// Get expenses by category
router.get('/by-category', async (req, res) => {
  try {
    const { month, year } = req.query;

    let sql = 'SELECT category, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (month) {
      sql += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    sql += ' GROUP BY category';
    const { rows } = await query(sql, params);

    res.json(rows.map(r => ({ category: r.category, amount: r.amount || 0 })));
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get category stats' });
  }
});

// Get monthly expenses
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;

    let sql = 'SELECT strftime("%m", date) as month, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (year) {
      sql += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    sql += ' GROUP BY month ORDER BY month';
    const { rows } = await query(sql, params);

    res.json(rows.map(r => ({ month: parseInt(r.month), amount: r.amount || 0 })));
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get monthly stats' });
  }
});

// Export CSV
router.get('/export/csv', async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 10000', [req.user.id]);

    const fields = ['id', 'title', 'amount', 'category', 'date', 'description', 'payment_method'];
    const csv = generateCSV(rows, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to export CSV' });
  }
});

export default router;
