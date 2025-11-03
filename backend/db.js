const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
  // PostgreSQL for production
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  db = {
    query: (text, params) => pool.query(text, params),
    end: () => pool.end()
  };
} else {
  // SQLite for local development
  const sqlite3 = require('sqlite3').verbose();
  
  const sqliteDb = new sqlite3.Database('./jobs.db', (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  db = {
    run: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    },
    get: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(sql, params, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    },
    all: (sql, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
  };
}

module.exports = { db, isProduction };