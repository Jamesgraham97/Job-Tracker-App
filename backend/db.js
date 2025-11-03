const { Pool } = require('pg');

// Always use PostgreSQL — no SQLite fallback
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const db = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end()
};

module.exports = { db };
