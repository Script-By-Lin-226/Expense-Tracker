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

// Get all income
router.get('/', async (req, res) => {
  try {
    const { category, month, year, start_date, end_date, search } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT * FROM income WHERE user_id = ?';
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
    
    const income = rowsToObjects(rows);
    res.json(income);
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ detail: 'Failed to fetch income' });
  }
});

// Get income by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM income WHERE id = ? AND user_id = ?');
    stmt.bind([req.params.id, req.user.id]);
    const income = stmt.getAsObject();
    stmt.free();
    
    if (income.id === undefined) {
      return res.status(404).json({ detail: 'Income not found' });
    }
    res.json(income);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to fetch income' });
  }
});

// Create income
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

    const { title, amount, category, date, description } = req.body;
    const db = await getDatabase();

    const stmt = db.prepare(
      'INSERT INTO income (title, amount, category, date, description, user_id) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run([title, amount, category, date, description || null, req.user.id]);
    stmt.free();
    
    await saveDatabase();

    // Get the inserted income - sql.js doesn't support last_insert_rowid() directly
    // Use a query to get the most recent income for this user
    const getStmt = db.prepare('SELECT * FROM income WHERE user_id = ? ORDER BY id DESC LIMIT 1');
    getStmt.bind([req.user.id]);
    const income = getStmt.getAsObject();
    getStmt.free();

    res.status(201).json(income);
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ detail: 'Failed to create income' });
  }
});

// Update income
router.put('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const checkStmt = db.prepare('SELECT * FROM income WHERE id = ? AND user_id = ?');
    checkStmt.bind([req.params.id, req.user.id]);
    const income = checkStmt.getAsObject();
    checkStmt.free();
    
    if (income.id === undefined) {
      return res.status(404).json({ detail: 'Income not found' });
    }

    const { title, amount, category, date, description } = req.body;
    const updates = [];
    const params = [];

    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (amount !== undefined) { updates.push('amount = ?'); params.push(amount); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (date !== undefined) { updates.push('date = ?'); params.push(date); }
    if (description !== undefined) { updates.push('description = ?'); params.push(description); }

    if (updates.length === 0) {
      return res.json(income);
    }

    params.push(req.params.id, req.user.id);
    const updateStmt = db.prepare(`UPDATE income SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`);
    updateStmt.run(params);
    updateStmt.free();
    
    await saveDatabase();

    const getStmt = db.prepare('SELECT * FROM income WHERE id = ?');
    getStmt.bind([req.params.id]);
    const updated = getStmt.getAsObject();
    getStmt.free();
    
    res.json(updated);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ detail: 'Failed to update income' });
  }
});

// Delete income
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    
    // First check if income exists
    const checkStmt = db.prepare('SELECT id FROM income WHERE id = ? AND user_id = ?');
    checkStmt.bind([req.params.id, req.user.id]);
    const exists = checkStmt.getAsObject();
    checkStmt.free();
    
    if (exists.id === undefined) {
      return res.status(404).json({ detail: 'Income not found' });
    }
    
    // Delete the income
    const stmt = db.prepare('DELETE FROM income WHERE id = ? AND user_id = ?');
    stmt.run([req.params.id, req.user.id]);
    stmt.free();
    
    await saveDatabase();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ detail: 'Failed to delete income' });
  }
});

// Get income stats
router.get('/stats', async (req, res) => {
  try {
    const { month, year } = req.query;
    const db = await getDatabase();
    
    let query = 'SELECT SUM(amount) as total FROM income WHERE user_id = ?';
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

// Export CSV
router.get('/export/csv', async (req, res) => {
  try {
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 10000');
    stmt.bind([req.user.id]);
    const rows = stmt.get();
    stmt.free();
    
    const income = rowsToObjects(rows);
    const fields = ['id', 'title', 'amount', 'category', 'date', 'description'];
    const csv = generateCSV(income, fields);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=income.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to export CSV' });
  }
});

export default router;
