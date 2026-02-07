import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/db.js';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-this-in-production';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const db = await getDatabase();
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    stmt.bind([decoded.sub]);
    const user = stmt.getAsObject();
    stmt.free();
    
    if (!user.username) {
      return res.status(401).json({ detail: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Invalid or expired token' });
  }
}
