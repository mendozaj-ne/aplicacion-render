const request = require('supertest');
const { app, db } = require('./index'); //

describe('API Endpoints', () => {

    // Cerramos la conexión a la BD al terminar todos los tests para que Jest no se quede colgado
    afterAll((done) => {
        db.close((err) => {
            if (err) console.error(err.message);
            done();
        });
    });

    // 1. Test para GET /
    describe('GET /', () => {
        it('Debería retornar status 200 y el objeto { status: "ok" }', async () => {
            const res = await request(app).get('/');

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ status: 'ok' });
        });
    });

    // 2. Test para POST /login
    describe('POST /login', () => {
        it('Debería retornar status 200 al hacer login', async () => {
            const res = await request(app)
                .post('/login')
                .send({ username: 'test', password: '123' }); // Enviamos datos dummy

            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({ status: 'ok' });
        });
    });

    // 3. Tests para POST /insert
    describe('POST /insert', () => {

        it('Debería crear una tarea correctamente (Status 201)', async () => {
            const nuevaTarea = { todo: 'Aprender Jest' };

            const res = await request(app)
                .post('/insert')
                .send(nuevaTarea);

            expect(res.statusCode).toEqual(201);
            // Verificamos que responda con éxito
            expect(res.body).toHaveProperty('message', 'Insert was successful');
        });

        it('Debería fallar si no se envía el campo "todo" (Status 400)', async () => {
            const tareaInvalida = {}; // Objeto vacío

            const res = await request(app)
                .post('/insert')
                .send(tareaInvalida);

            expect(res.statusCode).toEqual(400);
        });
    });
});