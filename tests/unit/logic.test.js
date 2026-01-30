/**
 * Pruebas Unitarias - Lógica de Negocio
 * Validan funciones aisladas sin dependencias externas
 */

const InventoryLogic = require('../../src/logic');

describe('InventoryLogic - Validaciones', () => {
  describe('validateItem', () => {
    test('debe aceptar un item válido', () => {
      const item = {
        name: 'Guantes de látex',
        stock: 100,
        category: 'Protección Personal'
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('debe rechazar un item sin nombre', () => {
      const item = {
        name: '',
        stock: 100,
        category: 'Protección Personal'
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El nombre es obligatorio y debe ser texto');
    });

    test('debe rechazar stock negativo (CRÍTICO)', () => {
      const item = {
        name: 'Guantes de látex',
        stock: -5,
        category: 'Protección Personal'
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('El stock debe ser un número no negativo');
    });

    test('debe rechazar stock no numérico', () => {
      const item = {
        name: 'Guantes de látex',
        stock: 'muchos',
        category: 'Protección Personal'
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('debe rechazar item sin categoría', () => {
      const item = {
        name: 'Guantes de látex',
        stock: 100,
        category: ''
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('La categoría es obligatoria');
    });

    test('debe aceptar stock de cero', () => {
      const item = {
        name: 'Guantes de látex',
        stock: 0,
        category: 'Protección Personal'
      };

      const result = InventoryLogic.validateItem(item);

      expect(result.valid).toBe(true);
    });
  });

  describe('getStockStatus', () => {
    test('debe retornar CRÍTICO cuando stock es 0', () => {
      expect(InventoryLogic.getStockStatus(0)).toBe('CRÍTICO');
    });

    test('debe retornar BAJO cuando stock es menor a 10', () => {
      expect(InventoryLogic.getStockStatus(5)).toBe('BAJO');
      expect(InventoryLogic.getStockStatus(9)).toBe('BAJO');
    });

    test('debe retornar NORMAL cuando stock es entre 10 y 49', () => {
      expect(InventoryLogic.getStockStatus(10)).toBe('NORMAL');
      expect(InventoryLogic.getStockStatus(30)).toBe('NORMAL');
      expect(InventoryLogic.getStockStatus(49)).toBe('NORMAL');
    });

    test('debe retornar ALTO cuando stock es 50 o más', () => {
      expect(InventoryLogic.getStockStatus(50)).toBe('ALTO');
      expect(InventoryLogic.getStockStatus(100)).toBe('ALTO');
      expect(InventoryLogic.getStockStatus(1000)).toBe('ALTO');
    });
  });

  describe('updateStock', () => {
    test('debe actualizar stock correctamente con cambio positivo', () => {
      const result = InventoryLogic.updateStock(100, 50);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(150);
      expect(result.message).toBe('Stock actualizado correctamente');
    });

    test('debe actualizar stock correctamente con cambio negativo', () => {
      const result = InventoryLogic.updateStock(100, -30);

      expect(result.success).toBe(true);
      expect(result.newStock).toBe(70);
    });

    test('debe rechazar actualización que resulte en stock negativo', () => {
      const result = InventoryLogic.updateStock(50, -60);

      expect(result.success).toBe(false);
      expect(result.newStock).toBe(50);
      expect(result.message).toBe('El stock no puede ser negativo');
    });

    test('debe rechazar valores no numéricos', () => {
      const result = InventoryLogic.updateStock('100', 50);

      expect(result.success).toBe(false);
      expect(result.message).toContain('numéricos');
    });
  });

  describe('generateId', () => {
    test('debe generar un ID único', () => {
      const id1 = InventoryLogic.generateId();
      const id2 = InventoryLogic.generateId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    test('debe generar ID con formato correcto', () => {
      const id = InventoryLogic.generateId();

      expect(id).toMatch(/^ITEM-\d+-[a-z0-9]+$/);
    });

    test('debe generar IDs únicos en múltiples llamadas', () => {
      const ids = new Set();
      
      for (let i = 0; i < 100; i++) {
        ids.add(InventoryLogic.generateId());
      }

      expect(ids.size).toBe(100);
    });
  });
});