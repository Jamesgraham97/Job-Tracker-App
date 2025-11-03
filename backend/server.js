const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./jobs.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
    initDatabase();
  }
});

// Initialize database table
function initDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      position TEXT NOT NULL,
      status TEXT DEFAULT 'Applied',
      date_applied TEXT,
      job_url TEXT,
      location TEXT,
      salary_range TEXT,
      contact_name TEXT,
      contact_email TEXT,
      notes TEXT,
      follow_up_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Routes

// Get all applications
app.get('/api/applications', (req, res) => {
  db.all('SELECT * FROM applications ORDER BY date_applied DESC', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Get single application
app.get('/api/applications/:id', (req, res) => {
  db.get('SELECT * FROM applications WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

// Create application
app.post('/api/applications', (req, res) => {
  const {
    company,
    position,
    status,
    date_applied,
    job_url,
    location,
    salary_range,
    contact_name,
    contact_email,
    notes,
    follow_up_date
  } = req.body;

  db.run(
    `INSERT INTO applications (
      company, position, status, date_applied, job_url, location,
      salary_range, contact_name, contact_email, notes, follow_up_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [company, position, status, date_applied, job_url, location, salary_range, contact_name, contact_email, notes, follow_up_date],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, message: 'Application created successfully' });
    }
  );
});

// Update application
app.put('/api/applications/:id', (req, res) => {
  const {
    company,
    position,
    status,
    date_applied,
    job_url,
    location,
    salary_range,
    contact_name,
    contact_email,
    notes,
    follow_up_date
  } = req.body;

  db.run(
    `UPDATE applications SET
      company = ?, position = ?, status = ?, date_applied = ?, job_url = ?,
      location = ?, salary_range = ?, contact_name = ?, contact_email = ?,
      notes = ?, follow_up_date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?`,
    [company, position, status, date_applied, job_url, location, salary_range, contact_name, contact_email, notes, follow_up_date, req.params.id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Application updated successfully', changes: this.changes });
    }
  );
});

// Delete application
app.delete('/api/applications/:id', (req, res) => {
  db.run('DELETE FROM applications WHERE id = ?', [req.params.id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Application deleted successfully', changes: this.changes });
  });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});