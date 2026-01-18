const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

//Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express()

//Creamos un parser de tipo application/json
//Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json()

// Abre la base de datos (Nota: Para tests reales, se suele usar ':memory:' o una DB de test)
const db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    // console.log('Conectado a la base de datos SQLite.'); // Comentado para limpiar salida de tests

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`);
});

// --- ENDPOINTS ---

app.post('/insert', jsonParser, function (req, res) {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).send({ error: 'Falta información necesaria' });
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, CURRENT_TIMESTAMP)');

    stmt.run(todo, function(err) {
        if (err) {
            return res.status(500).send(err);
        }
        // Usamos sendStatus o json para terminar correctamente
        res.status(201).json({ id: this.lastID, message: 'Insert was successful' });
    });
    stmt.finalize();
});

app.get('/', function (req, res) {
    res.status(200).json({ 'status': 'ok' });
});

app.post('/login', jsonParser, function (req, res) {
    res.status(200).json({ 'status': 'ok' });
});

// --- INICIO DEL SERVIDOR ---

// Solo escuchamos el puerto si este archivo es el principal (no es un test)
if (require.main === module) {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Aplicación corriendo en http://localhost:${port}`);
    });
}

// Exportamos app y db para usarlos en los tests
module.exports = { app: app, db };