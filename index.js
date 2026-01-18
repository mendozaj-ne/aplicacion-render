// Importamos librerías
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const cors = require('cors');

// App
const app = express();
app.use(cors());

// Lectura del JSON en POST
app.use(express.json());

// DB: abre/crea ./base.sqlite3 y la tabla "todos"
const db = new sqlite3.Database(path.join(__dirname, 'base.sqlite3'), (err) => {
  if (err) {
    console.error('Error al abrir DB:', err.message);
  } else {
    console.log('Conectado a la base de datos SQLite.');
  }
});

// Crea tabla (id, todo, created_at)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      todo TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `, (err) => {
    if (err) {
      console.error('Error creando tabla:', err.message);
    } else {
      console.log('Tabla "todos" lista.');
    }
  });
});

// GET raíz  verifica que corre
app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({ status: 'ok' });
});

//Creamos un endpoint de login que recibe los datos como json y los guarda en la tabla
app.post('/agrega_todo', (req, res) => {
  const { todo } = req.body;

  if (!todo || typeof todo !== 'string' || !todo.trim()) {
    return res.status(400).json({ error: 'El campo "todo" es requerido (string no vacío).' });
  }

  const stmt = db.prepare('INSERT INTO todos (todo) VALUES (?)');
  stmt.run(todo.trim(), function (err) {
    if (err) {
      console.error('Error al insertar:', err);
      return res.status(500).json({ error: 'Error al guardar en la base de datos.' });
    }

    // Devuelve 201 + JSON con datos creados
    return res.status(201).json({
      id: this.lastID,
      todo: todo.trim(),
      created_at: new Date().toISOString()
    });
  });
  stmt.finalize();
});

//  Ver todos
app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos ORDER BY id DESC', (err, rows) => {
    if (err) {
      console.error('Error al leer:', err);
      return res.status(500).json({ error: 'Error al leer la base de datos.' });
    }
    res.json(rows);
  });
});

// Servidor (PORT para Codespaces, 0.0.0.0 para exponer)
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Aplicación corriendo en http://localhost:${PORT}`);
});

