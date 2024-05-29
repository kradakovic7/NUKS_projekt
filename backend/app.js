const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Pool } = require('pg');
const app = express();
const port = 5000;

app.use(cors());
app.use(fileUpload());
app.use(express.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
});

app.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const file = req.files.file;
  const query = 'INSERT INTO files(name, data) VALUES($1, $2) RETURNING *';
  const values = [file.name, file.data];

  try {
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/files', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM files');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
