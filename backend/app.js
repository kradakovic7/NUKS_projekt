const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

app.post('/todos', async (req, res) => {
    const { task } = req.body;
    const query = 'INSERT INTO todos(task) VALUES($1) RETURNING *';
    const values = [task];

    try {
        const result = await pool.query(query, values);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/todos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM todos');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.delete('/todos/:id', async (req, res) => {
    const id = req.params.id;
    const query = 'DELETE FROM todos WHERE id = $1 RETURNING *';
    const values = [id];

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).send('Todo item not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.put('/todos/:id', async (req, res) => {
    const id = req.params.id;
    const { task, completed } = req.body;
    const query = 'UPDATE todos SET task = $1, completed = $2 WHERE id = $3 RETURNING *';
    const values = [task, completed, id];

    try {
        const result = await pool.query(query, values);
        if (result.rowCount === 0) {
            return res.status(404).send('Todo item not found');
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
