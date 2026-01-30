const express = require('express');
const path = require('path');
const InventoryLogic = require('./logic');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Base de datos en memoria (simulada con persistencia)
let inventory = [];

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    itemsCount: inventory.length 
  });
});

// CREATE - Crear un nuevo insumo médico
app.post('/items', (req, res) => {
  try {
    const { name, stock, category, description } = req.body;

    // Validar datos
    const validation = InventoryLogic.validateItem({ name, stock, category });
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validation.errors
      });
    }

    // Crear nuevo item
    const newItem = {
      id: InventoryLogic.generateId(),
      name: name.trim(),
      stock: Number(stock),
      category: category.trim(),
      description: description || '',
      stockStatus: InventoryLogic.getStockStatus(Number(stock)),
      createdAt: new Date().toISOString()
    };

    inventory.push(newItem);

    res.status(201).json({
      success: true,
      message: 'Insumo creado exitosamente',
      data: newItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear el insumo',
      error: error.message
    });
  }
});

// READ - Obtener todos los insumos
app.get('/items', (req, res) => {
  try {
    res.json({
      success: true,
      count: inventory.length,
      data: inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los insumos',
      error: error.message
    });
  }
});

// READ - Obtener un insumo por ID
app.get('/items/:id', (req, res) => {
  try {
    const item = inventory.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el insumo',
      error: error.message
    });
  }
});

// UPDATE - Actualizar un insumo
app.put('/items/:id', (req, res) => {
  try {
    const { name, stock, category, description } = req.body;
    const itemIndex = inventory.findIndex(i => i.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    // Preparar datos actualizados
    const updatedData = {
      name: name !== undefined ? name : inventory[itemIndex].name,
      stock: stock !== undefined ? stock : inventory[itemIndex].stock,
      category: category !== undefined ? category : inventory[itemIndex].category
    };

    // Validar datos actualizados
    const validation = InventoryLogic.validateItem(updatedData);
    
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: 'Datos inválidos',
        errors: validation.errors
      });
    }

    // Actualizar item
    inventory[itemIndex] = {
      ...inventory[itemIndex],
      name: updatedData.name.trim(),
      stock: Number(updatedData.stock),
      category: updatedData.category.trim(),
      description: description !== undefined ? description : inventory[itemIndex].description,
      stockStatus: InventoryLogic.getStockStatus(Number(updatedData.stock)),
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Insumo actualizado exitosamente',
      data: inventory[itemIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el insumo',
      error: error.message
    });
  }
});

// DELETE - Eliminar un insumo
app.delete('/items/:id', (req, res) => {
  try {
    const itemIndex = inventory.findIndex(i => i.id === req.params.id);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Insumo no encontrado'
      });
    }

    const deletedItem = inventory.splice(itemIndex, 1)[0];

    res.json({
      success: true,
      message: 'Insumo eliminado exitosamente',
      data: deletedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el insumo',
      error: error.message
    });
  }
});

// Ruta para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

module.exports = app;