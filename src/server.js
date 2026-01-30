const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🏥 Servidor de Inventario Médico ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Health check disponible en http://localhost:${PORT}/health`);
  console.log(`🔧 API CRUD en http://localhost:${PORT}/items`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
  });
});

module.exports = server;