/**
 * Configuración global para las pruebas de Playwright
 * Se ejecuta antes de todas las pruebas
 */
async function globalSetup(config) {
  console.log('🚀 Iniciando configuración global de Playwright...');
  
  // Configuración de variables de entorno para pruebas
  process.env.NODE_ENV = 'test';
  process.env.TEST_BASE_URL = 'https://tvsengineering.com/nl/afspraak';
  
  // Configuración de timeouts globales
  process.env.GLOBAL_TIMEOUT = '60000';
  process.env.ACTION_TIMEOUT = '10000';
  process.env.NAVIGATION_TIMEOUT = '30000';
  
  // Crear directorios necesarios si no existen
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    'screenshots',
    'test-results',
    'playwright-report',
    'test-results/videos',
    'test-results/traces'
  ];
  
  directories.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`📁 Creado directorio: ${dir}`);
    }
  });
  
  // Configuración de logging
  console.log('📊 Configuración de logging activada');
  console.log(`🌐 URL de prueba: ${process.env.TEST_BASE_URL}`);
  console.log(`⏰ Timeout global: ${process.env.GLOBAL_TIMEOUT}ms`);
  
  console.log('✅ Configuración global completada');
}

export default globalSetup;