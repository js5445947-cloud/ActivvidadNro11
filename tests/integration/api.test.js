/**
 * Pruebas de Integración - API REST
 * Validan la comunicación entre endpoints y la lógica
 */

const request = require('supertest');
const app = require('../../src/app');

describe('API de Inventario Médico - Integración', () => {
  
  describe('GET /health', () => {
    test('debe retornar estado OK del servidor', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('itemsCount');
    });
  });

  describe('POST /items - Crear Insumo', () => {
    test('debe crear un nuevo insumo médico correctamente', async () => {
      const newItem = {
        name: 'Jeringa 10ml',
        stock: 200,
        category: 'Material de Curación',
        description: 'Jeringa desechable estéril'
      };

      const response = await request(app)
        .post('/items')
        .send(newItem)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Jeringa 10ml');
      expect(response.body.data.stock).toBe(200);
      expect(response.body.data.stockStatus).toBe('ALTO');
    });

    test('debe rechazar insumo con stock negativo', async () => {
      const invalidItem = {
        name: 'Guantes',
        stock: -10,
        category: 'Protección Personal'
      };

      const response = await request(app)
        .post('/items')
        .send(invalidItem)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    test('debe rechazar insumo sin nombre', async () => {
      const invalidItem = {
        name: '',
        stock: 100,
        category: 'Protección Personal'
      };

      const response = await request(app)
        .post('/items')
        .send(invalidItem)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('debe crear insumo con stock en CRÍTICO (0 unidades)', async () => {
      const criticalItem = {
        name: 'Termómetro',
        stock: 0,
        category: 'Equipo Médico'
      };

      const response = await request(app)
        .post('/items')
        .send(criticalItem)
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(201);
      expect(response.body.data.stockStatus).toBe('CRÍTICO');
    });
  });

  describe('GET /items - Listar Insumos', () => {
    test('debe retornar lista de insumos', async () => {
      const response = await request(app).get('/items');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /items/:id - Obtener un Insumo', () => {
    test('debe obtener un insumo específico por ID', async () => {
      // Primero crear un insumo
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Mascarilla N95',
          stock: 50,
          category: 'Protección Personal'
        });

      const itemId = createResponse.body.data.id;

      // Luego obtenerlo
      const response = await request(app).get(`/items/${itemId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(itemId);
      expect(response.body.data.name).toBe('Mascarilla N95');
    });

    test('debe retornar 404 para ID inexistente', async () => {
      const response = await request(app).get('/items/ID-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /items/:id - Actualizar Insumo', () => {
    test('debe actualizar stock de un insumo', async () => {
      // Crear insumo
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Alcohol 70%',
          stock: 30,
          category: 'Material de Curación'
        });

      const itemId = createResponse.body.data.id;

      // Actualizar
      const updateResponse = await request(app)
        .put(`/items/${itemId}`)
        .send({ stock: 100 });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.success).toBe(true);
      expect(updateResponse.body.data.stock).toBe(100);
      expect(updateResponse.body.data.stockStatus).toBe('ALTO');
    });

    test('debe actualizar nombre y categoría', async () => {
      // Crear insumo
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Vendas',
          stock: 20,
          category: 'Material de Curación'
        });

      const itemId = createResponse.body.data.id;

      // Actualizar
      const updateResponse = await request(app)
        .put(`/items/${itemId}`)
        .send({
          name: 'Vendas Elásticas',
          category: 'Material de Curación',
          stock: 20
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.name).toBe('Vendas Elásticas');
    });

    test('debe rechazar actualización con stock negativo', async () => {
      // Crear insumo
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Gasas',
          stock: 50,
          category: 'Material de Curación'
        });

      const itemId = createResponse.body.data.id;

      // Intentar actualizar con stock negativo
      const updateResponse = await request(app)
        .put(`/items/${itemId}`)
        .send({ stock: -10 });

      expect(updateResponse.status).toBe(400);
      expect(updateResponse.body.success).toBe(false);
    });

    test('debe retornar 404 al actualizar ID inexistente', async () => {
      const response = await request(app)
        .put('/items/ID-INEXISTENTE')
        .send({ stock: 100 });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /items/:id - Eliminar Insumo', () => {
    test('debe eliminar un insumo correctamente', async () => {
      // Crear insumo
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Cubre bocas',
          stock: 100,
          category: 'Protección Personal'
        });

      const itemId = createResponse.body.data.id;

      // Eliminar
      const deleteResponse = await request(app).delete(`/items/${itemId}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.success).toBe(true);
      expect(deleteResponse.body.data.id).toBe(itemId);

      // Verificar que ya no existe
      const getResponse = await request(app).get(`/items/${itemId}`);
      expect(getResponse.status).toBe(404);
    });

    test('debe retornar 404 al eliminar ID inexistente', async () => {
      const response = await request(app).delete('/items/ID-INEXISTENTE');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Flujo Completo CRUD', () => {
    test('debe ejecutar ciclo completo: Crear, Leer, Actualizar, Eliminar', async () => {
      // 1. CREATE
      const createResponse = await request(app)
        .post('/items')
        .send({
          name: 'Test Completo',
          stock: 25,
          category: 'Prueba'
        });

      expect(createResponse.status).toBe(201);
      const itemId = createResponse.body.data.id;

      // 2. READ
      const readResponse = await request(app).get(`/items/${itemId}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.data.name).toBe('Test Completo');

      // 3. UPDATE
      const updateResponse = await request(app)
        .put(`/items/${itemId}`)
        .send({ stock: 75 });
      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.data.stock).toBe(75);

      // 4. DELETE
      const deleteResponse = await request(app).delete(`/items/${itemId}`);
      expect(deleteResponse.status).toBe(200);

      // 5. VERIFY DELETION
      const verifyResponse = await request(app).get(`/items/${itemId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});