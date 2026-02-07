import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/db.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';
const ACCESS_TOKEN_EXPIRE_MINUTES = 30;

// Register
router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('email').isEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array()[0].msg });
    }

    const { username, email, password } = req.body;
    const db = getDatabase();

    // Check if username exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existingUser) {
      return res.status(400).json({ 
        detail: existingUser.username === username ? 'Username already registered' : 'Email already registered' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .run(username, email, passwordHash);

    res.status(201).json({
      id: result.lastInsertRowid,
      username,
      email
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ detail: 'Registration failed' });
  }
});

// Login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ detail: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const db = getDatabase();

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (!user) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ detail: 'Incorrect username or password' });
    }

    // Generate token
    const token = jwt.sign(
      { sub: user.username },
      SECRET_KEY,
      { expiresIn: `${ACCESS_TOKEN_EXPIRE_MINUTES}m` }
    );

    res.json({
      access_token: token,
      token_type: 'bearer'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ detail: 'Login failed' });
  }
});

export default router;
