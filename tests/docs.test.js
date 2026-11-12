const { app, request } = require('./helpers');

describe('Documentación de la API', () => {
  test('sirve Swagger UI', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });

  test('publica el contrato OpenAPI con las rutas principales', async () => {
    const res = await request(app).get('/api-docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.paths['/tickets/chance'].post).toBeDefined();
    expect(res.body.paths['/caja/cierre'].post).toBeDefined();
  });
});
