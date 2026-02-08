import initSqlJs from 'sql.js';
import bcrypt from 'bcryptjs';

let SQL = null;
let db = null;

async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

export async function getDatabase() {
  if (!db) {
    const SQLInstance = await initSQL();
    db = new SQLInstance.Database(); // In-memory
    await initTables(db);
  }
  return db;
}

async function initTables(database) {
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

  // Seed User
  const hashedPassword = await bcrypt.hash('linlin', 10);
  console.log('Seeding database with default user...');
  try {
    database.run(
      'INSERT OR IGNORE INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      ['linlinaung', 'linlinaung@gmail.com', hashedPassword]
    );
  } catch (e) {
    console.log('User already exists or error seeding:', e);
  }

  console.log('In-memory Database initialized successfully');
}

export async function initDatabase() {
  await getDatabase();
}

// Wrapper to mimic pg's query interface but for SQLite
export async function query(text, params = []) {
  const database = await getDatabase();

  // Normalize params: Postgres uses $1, $2. SQLite uses ?.
  // We will assume the ROUTES are converted back to ? syntax.
  // But if we want to be robust, we could replace $n with ? here.
  // Let's rely on routes correct syntax for better control.

  try {
    const stmt = database.prepare(text);
    stmt.bind(params);

    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }

    // Check if it was an INSERT/UPDATE/DELETE to return rowCount?
    // sql.js doesn't give rowCount easily for UPDATE/DELETE.
    // For INSERT, valid rows might be returned if RETURNING is used.

    stmt.free();
    return { rows, rowCount: rows.length }; // Approximation
  } catch (error) {
    console.error('SQL Error:', error, 'Query:', text);
    throw error;
  }
}
