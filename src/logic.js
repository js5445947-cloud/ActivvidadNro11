/**
 * Lógica de negocio para Gestión de Inventarios Médicos
 * Siguiendo principios de Pressman: Alta cohesión y modularidad
 */

class InventoryLogic {
  /**
   * Valida que un insumo médico sea válido
   * @param {Object} item - Objeto con datos del insumo
   * @returns {Object} - {valid: boolean, errors: Array}
   */
  static validateItem(item) {
    const errors = [];

    // Validar nombre
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      errors.push('El nombre es obligatorio y debe ser texto');
    }

    // Validar stock (no puede ser negativo)
    if (item.stock === undefined || item.stock === null) {
      errors.push('El stock es obligatorio');
    } else if (typeof item.stock !== 'number' || item.stock < 0) {
      errors.push('El stock debe ser un número no negativo');
    }

    // Validar categoría
    if (!item.category || typeof item.category !== 'string') {
      errors.push('La categoría es obligatoria');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Calcula el estado del stock
   * @param {number} stock - Cantidad en stock
   * @returns {string} - Estado: 'CRÍTICO', 'BAJO', 'NORMAL', 'ALTO'
   */
  static getStockStatus(stock) {
    if (stock === 0) return 'CRÍTICO';
    if (stock < 10) return 'BAJO';
    if (stock < 50) return 'NORMAL';
    return 'ALTO';
  }

  /**
   * Procesa una actualización de stock
   * @param {number} currentStock - Stock actual
   * @param {number} change - Cambio a aplicar (positivo o negativo)
   * @returns {Object} - {success: boolean, newStock: number, message: string}
   */
  static updateStock(currentStock, change) {
    if (typeof currentStock !== 'number' || typeof change !== 'number') {
      return {
        success: false,
        newStock: currentStock,
        message: 'Los valores deben ser numéricos'
      };
    }

    const newStock = currentStock + change;

    if (newStock < 0) {
      return {
        success: false,
        newStock: currentStock,
        message: 'El stock no puede ser negativo'
      };
    }

    return {
      success: true,
      newStock,
      message: 'Stock actualizado correctamente'
    };
  }

  /**
   * Genera un ID único para un nuevo item
   * @returns {string} - ID único basado en timestamp
   */
  static generateId() {
    return `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

module.exports = InventoryLogic;