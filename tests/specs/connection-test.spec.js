import { test, expect } from '@playwright/test';

test('Prueba de Conexión Simple - Verificar Sitio', async ({ page }) => {
  console.log('🔍 Verificando conexión básica al sitio...');
  
  // Configurar timeouts más largos
  page.setDefaultTimeout(60000);
  
  try {
    // Intentar navegar con diferentes estrategias
    console.log('🌐 Intentando navegación básica...');
    await page.goto('https://tvsengineering.com/nl/afspraak/', {
      timeout: 60000,
      waitUntil: 'domcontentloaded' // menos estricto que networkidle
    });
    
    console.log('✅ Navegación inicial exitosa');
    
    // Esperar un tiempo razonable
    await page.waitForTimeout(10000);
    
    // Tomar screenshot del estado actual
    await page.screenshot({ path: 'screenshots/simple-connection.png', fullPage: true });
    
    // Verificar contenido básico
    const title = await page.title();
    console.log(`📄 Título: "${title}"`);
    
    const url = page.url();
    console.log(`🌐 URL final: "${url}"`);
    
    // Contar elementos básicos
    const inputs = await page.$$('input');
    const selects = await page.$$('select');
    const forms = await page.$$('form');
    
    console.log(`📊 Elementos encontrados:`);
    console.log(`  - Inputs: ${inputs.length}`);
    console.log(`  - Selects: ${selects.length}`);
    console.log(`  - Forms: ${forms.length}`);
    
    // Si hay elementos, la conexión funciona
    expect(inputs.length + selects.length + forms.length).toBeGreaterThan(0);
    
    console.log('✅ Conexión básica verificada exitosamente');
    
  } catch (error) {
    console.error('💥 Error en conexión básica:', error.message);
    
    // Tomar screenshot del error
    try {
      await page.screenshot({ path: 'screenshots/connection-error.png', fullPage: true });
    } catch (screenshotError) {
      console.log('❌ No se pudo tomar screenshot');
    }
    
    // Reportar el error claramente
    throw new Error(`Error de conexión: ${error.message}`);
  }
});