import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/db.js';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(decoded.sub);
    
    if (!user) {
      return res.status(401).json({ detail: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}
