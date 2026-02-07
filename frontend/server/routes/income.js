import express from 'express';
import { getDatabase } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';
import { parse } from 'json2csv';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all income
router.get('/', (req, res) => {
  try {
    const { category, month, year, start_date, end_date, search } = req.query;
    const db = getDatabase();
    
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

    const income = db.prepare(query).all(...params);
    res.json(income);
  } catch (error) {
    console.error('Get income error:', error);
    res.status(500).json({ detail: 'Failed to fetch income' });
  }
});

// Get income by ID
router.get('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const income = db.prepare('SELECT * FROM income WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    
    if (!income) {
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array()[0].msg });
    }

    const { title, amount, category, date, description } = req.body;
    const db = getDatabase();

    const result = db.prepare(
      'INSERT INTO income (title, amount, category, date, description, user_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, amount, category, date, description || null, req.user.id);

    const income = db.prepare('SELECT * FROM income WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(income);
  } catch (error) {
    console.error('Create income error:', error);
    res.status(500).json({ detail: 'Failed to create income' });
  }
});

// Update income
router.put('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const income = db.prepare('SELECT * FROM income WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    
    if (!income) {
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
    db.prepare(`UPDATE income SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);

    const updated = db.prepare('SELECT * FROM income WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Update income error:', error);
    res.status(500).json({ detail: 'Failed to update income' });
  }
});

// Delete income
router.delete('/:id', (req, res) => {
  try {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM income WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ detail: 'Income not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ detail: 'Failed to delete income' });
  }
});

// Get income stats
router.get('/stats', (req, res) => {
  try {
    const { month, year } = req.query;
    const db = getDatabase();
    
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

    const result = db.prepare(query).get(...params);
    res.json({ total: result.total || 0 });
  } catch (error) {
    res.status(500).json({ detail: 'Failed to get stats' });
  }
});

// Export CSV
router.get('/export/csv', (req, res) => {
  try {
    const db = getDatabase();
    const income = db.prepare('SELECT * FROM income WHERE user_id = ? ORDER BY date DESC LIMIT 10000')
      .all(req.user.id);

    const fields = ['id', 'title', 'amount', 'category', 'date', 'description'];
    const csv = parse(income, { fields });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=income.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ detail: 'Failed to export CSV' });
  }
});

export default router;
