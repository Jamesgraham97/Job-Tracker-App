const express = require('express');
const cors = require('cors');
const { db } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: false
}));
app.use(express.json());

// Initialize PostgreSQL database
async function initDatabase() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('PostgreSQL database initialized');
}
initDatabase();

// Routes
app.get('/api/applications', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM applications ORDER BY date_applied DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/applications/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM applications WHERE id = $1', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/applications', async (req, res) => {
  const {
    company, position, status, date_applied, job_url, location,
    salary_range, contact_name, contact_email, notes, follow_up_date
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO applications (
        company, position, status, date_applied, job_url, location,
        salary_range, contact_name, contact_email, notes, follow_up_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id`,
      [company, position, status, date_applied, job_url, location, salary_range, contact_name, contact_email, notes, follow_up_date]
    );
    res.json({ id: result.rows[0].id, message: 'Application created successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// etc… (keep the PUT and DELETE routes, just remove isProduction checks)

app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running!', status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
