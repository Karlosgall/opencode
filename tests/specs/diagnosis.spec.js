import { test, expect } from '@playwright/test';

test.only('Diagnóstico de Conexión - Test Mínimo', async ({ page }) => {
  console.log('🌐 Intentando conectar a la página...');
  
  try {
    // Configurar timeouts más largos
    page.setDefaultTimeout(30000);
    
    // Navegar con timeout extendido
    console.log('🔗 Navegando a https://tvsengineering.com/nl/afspraak...');
    const response = await page.goto('https://tvsengineering.com/nl/afspraak', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log(`📊 Status de respuesta: ${response.status()}`);
    console.log(`📄 URL final: ${page.url()}`);
    
    // Esperar un poco más
    await page.waitForTimeout(5000);
    
    // Tomar screenshot
    await page.screenshot({ 
      path: 'screenshots/diagnosis-connection.png', 
      fullPage: true 
    });
    
    // Obtener título
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    // Verificar si hay contenido mínimo
    const bodyText = await page.locator('body').textContent();
    console.log(`📝 Longitud del body: ${bodyText.length} caracteres`);
    
    if (bodyText.length > 100) {
      console.log(`📋 Primeros 200 caracteres: "${bodyText.substring(0, 200)}..."`);
    } else {
      console.log('⚠️ El body parece estar vacío o muy corto');
    }
    
    // Buscar forms
    const forms = await page.$$('form');
    console.log(`📋 Forms encontrados: ${forms.length}`);
    
    // Buscar inputs
    const inputs = await page.$$('input');
    console.log(`📝 Inputs encontrados: ${inputs.length}`);
    
    // Buscar selects
    const selects = await page.$$('select');
    console.log(`📋 Selects encontrados: ${selects.length}`);
    
    console.log('✅ Diagnóstico de conexión completado');
    
  } catch (error) {
    console.error('💥 Error en diagnóstico:', error.message);
    
    // Tomar screenshot del error si es posible
    try {
      await page.screenshot({ 
        path: 'screenshots/diagnosis-error.png', 
        fullPage: true 
      });
    } catch (screenshotError) {
      console.log('❌ No se pudo tomar screenshot del error');
    }
    
    throw error;
  }
});