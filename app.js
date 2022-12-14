require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const port = 8000
const { Client } = require('pg');

app.use(bodyParser.json())
app.use(cors())

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect();

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/todos', async (req, res) => {
  const result = await client.query('INSERT INTO todos (name, completed) VALUES ($1, $2) RETURNING *', [req.body.name, req.body.completed])
  res.send(result.rows)
})

app.get('/todos', async (req, res) => {
  if (req.query.completed) {
    const result = await client.query('SELECT * FROM todos WHERE completed = $1', [req.query.completed])
    res.send(result.rows)
  } else {
    const result = await client.query('SELECT * FROM todos')
    res.send(result.rows)
  }
})

app.get('/todos/:id', async (req, res) => {
  const result = await client.query('SELECT * FROM todos WHERE id = $1', [req.params.id])
  if (!result) {
    res.status(404).send("todo not found")
    return
  }
  res.send(result.rows)
})

app.put('/todos/:id', async (req, res) => {
  const result = await client.query('SELECT * FROM todos WHERE id = $1', [req.params.id])
  if (!result) {
    res.status(404).send("todo not found")
    return
  }
  const result2 = await client.query('UPDATE todos SET name = $1, completed = $2 WHERE id = $3 RETURNING *', [req.body.name, req.body.completed, req.params.id])
  res.send(result2.rows)
})

app.delete('/todos/:id', async (req, res) => {
  await client.query('DELETE FROM todos WHERE id = $1', [req.params.id])
  res.sendStatus(200)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})