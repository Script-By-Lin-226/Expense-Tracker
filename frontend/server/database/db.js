import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/expense_tracker.db');
const dbDir = join(__dirname, '../../data');

// Ensure data directory exists
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

let SQL = null;
let db = null;

async function initSQL() {
  if (!SQL) {
    // For Node.js, sql.js will use the bundled wasm file
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getDatabase() {
  if (!db) {
    const SQLInstance = await initSQL();
    
    if (existsSync(dbPath)) {
      const buffer = readFileSync(dbPath);
      db = new SQLInstance.Database(buffer);
    } else {
      db = new SQLInstance.Database();
    }
  }
  return db;
}

export async function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
  }
}

export async function initDatabase() {
  const database = await getDatabase();
  
  // Create users table
  database.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);

  // Create expenses table
  database.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      payment_method TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create income table
  database.run(`
    CREATE TABLE IF NOT EXISTS income (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  database.run(`
    CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
    CREATE INDEX IF NOT EXISTS idx_income_date ON income(date);
  `);

  await saveDatabase();
  console.log('Database initialized successfully');
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
