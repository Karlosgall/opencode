import { test, expect } from '@playwright/test';

test('Debugging Básico - Ver Contenido Real', async ({ page }) => {
  test.setTimeout(30000);
  
  console.log('🔍 Navegando a la página...');
  await page.goto('https://tvsengineering.com/nl/afspraak');
  
  // Esperar carga
  await page.waitForTimeout(5000);
  
  // Tomar screenshot del estado inicial
  await page.screenshot({ path: 'screenshots/debug-initial.png', fullPage: true });
  
  // Obtener el HTML completo para análisis
  const pageContent = await page.content();
  
  // Guardar el contenido en un archivo para revisión
  const fs = require('fs');
  fs.writeFileSync('debug-page-content.html', pageContent);
  
  console.log('📄 Contenido de página guardado en debug-page-content.html');
  
  // Buscar elementos clave en el contenido
  console.log('🔍 Buscando elementos clave...');
  
  const searches = [
    'diagnose',
    'diagnostiek', 
    'phone',
    'teléfono',
    'name',
    'nombre',
    'kenteken',
    'plate',
    'kilometerstand',
    'mileage',
    'attvs',
    'loanCar',
    'inoperable',
    'terms'
  ];
  
  for (const searchTerm of searches) {
    const regex = new RegExp(searchTerm, 'gi');
    const matches = pageContent.match(regex);
    if (matches) {
      console.log(`✅ "${searchTerm}": ${matches.length} ocurrencias`);
    } else {
      console.log(`❌ "${searchTerm}": No encontrado`);
    }
  }
  
  // Buscar selects
  const selectMatches = pageContent.match(/<select[^>]*>/gi);
  if (selectMatches) {
    console.log(`📋 Selects encontrados: ${selectMatches.length}`);
    console.log('Ejemplos:');
    for (let i = 0; i < Math.min(selectMatches.length, 3); i++) {
      console.log(`  ${selectMatches[i]}`);
    }
  }
  
  // Buscar inputs importantes
  const phoneInputMatch = pageContent.match(/<input[^>]*phone[^>]*>/gi);
  const nameInputMatch = pageContent.match(/<input[^>]*name[^>]*>/gi);
  const plateInputMatch = pageContent.match(/<input[^>]*plate[^>]*>/gi);
  const kentekenMatch = pageContent.match(/<input[^>]*kenteken[^>]*>/gi);
  
  console.log(`📝 Inputs específicos:`);
  console.log(`  Phone: ${phoneInputMatch ? phoneInputMatch.length : 0}`);
  console.log(`  Name: ${nameInputMatch ? nameInputMatch.length : 0}`);
  console.log(`  Plate: ${plateInputMatch ? plateInputMatch.length : 0}`);
  console.log(`  Kenteken: ${kentekenMatch ? kentekenMatch.length : 0}`);
  
  console.log('✅ Análisis básico completado');
});