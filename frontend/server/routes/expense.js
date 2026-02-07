import express from 'express';
import { getDatabase, saveDatabase } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { generateCSV } from '../utils/csv.js';

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

// Get all expenses
router.get('/', async (req, res) => {
  try {
    const { category, month, year, start_date, end_date, search } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT * FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (month) {
      query += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }
    if (start_date) {
      query += ' AND date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      query += ' AND date <= ?';
      params.push(end_date);
    }
    if (search) {
      query += ' AND (title LIKE ? OR category LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY date DESC LIMIT 100';

    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = stmt.get();
    stmt.free();
    
    const expenses = rowsToObjects(rows);
    res.json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ detail: 'Failed to fetch expenses' });
  }
});

// Get expense by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?');
    stmt.bind([req.params.id, req.user.id]);
    const expense = stmt.getAsObject();
    stmt.free();
    
    if (!expense.id) {
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
    const db = await getDatabase();

    const stmt = db.prepare(
      'INSERT INTO expenses (title, amount, category, date, description, payment_method, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run([title, amount, category, date, description || null, payment_method || null, req.user.id]);
    stmt.free();
    
    await saveDatabase();

    // Get the inserted expense
    const getStmt = db.prepare('SELECT * FROM expenses WHERE id = (SELECT last_insert_rowid())');
    const expense = getStmt.getAsObject();
    getStmt.free();

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ detail: 'Failed to create expense' });
  }
});

// Update expense
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const checkStmt = db.prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?');
    checkStmt.bind([req.params.id, req.user.id]);
    const expense = checkStmt.getAsObject();
    checkStmt.free();
    
    if (!expense.id) {
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
      return res.json(expense);
    }

    params.push(req.params.id, req.user.id);
    const updateStmt = db.prepare(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
    updateStmt.run(params);
    updateStmt.free();
    
    await saveDatabase();

    const getStmt = db.prepare('SELECT * FROM expenses WHERE id = ?');
    getStmt.bind([req.params.id]);
    const updated = getStmt.getAsObject();
    getStmt.free();
    
    res.json(updated);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ detail: 'Failed to update expense' });
  }
});

// Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const stmt = db.prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?');
    stmt.run([req.params.id, req.user.id]);
    const changes = db.exec('SELECT changes()')[0];
    stmt.free();
    
    if (!changes || changes.values[0][0] === 0) {
      return res.status(404).json({ detail: 'Expense not found' });
    }
    
    await saveDatabase();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ detail: 'Failed to delete expense' });
  }
});

// Get expense stats
router.get('/stats', async (req, res) => {
  try {
    const { month, year } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT SUM(amount) as total FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (month) {
      query += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    const stmt = db.prepare(query);
    stmt.bind(params);
    const result = stmt.getAsObject();
    stmt.free();
    
    res.json({ total: result.total || 0 });
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get stats' });
  }
});

// Get expenses by category
router.get('/by-category', async (req, res) => {
  try {
    const { month, year } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT category, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

    if (month) {
      query += ' AND strftime("%m", date) = ?';
      params.push(String(month).padStart(2, '0'));
    }
    if (year) {
      query += ' AND strftime("%Y", date) = ?';
      params.push(String(year));
    }

    query += ' GROUP BY category';
    const stmt = db.prepare(query);
    stmt.bind(params);
    const rows = stmt.get();
    stmt.free();
    
    const results = rowsToObjects(rows);
    res.json(results.map(r => ({ category: r.category, amount: r.amount || 0 })));
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get category stats' });
  }
});

// Get monthly expenses
router.get('/monthly', async (req, res) => {
  try {
    const { year } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT strftime("%m", date) as month, SUM(amount) as amount FROM expenses WHERE user_id = ?';
    const params = [req.user.id];

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
    res.status(500).json({ detail: 'Failed to get monthly stats' });
  }
});

// Export CSV
router.get('/export/csv', async (req, res) => {
  try {
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC LIMIT 10000');
    stmt.bind([req.user.id]);
    const rows = stmt.get();
    stmt.free();
    
    const expenses = rowsToObjects(rows);
    const fields = ['id', 'title', 'amount', 'category', 'date', 'description', 'payment_method'];
    const csv = generateCSV(expenses, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to export CSV' });
  }
});

export default router;
