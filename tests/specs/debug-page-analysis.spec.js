import { test, expect } from '@playwright/test';

test('Debugging - Analizar estructura real de la página', async ({ page }) => {
  test.setTimeout(60000);
  
  console.log('🔍 Analizando estructura real de la página...');
  
  // Navegar a la página
  await page.goto('https://tvsengineering.com/nl/afspraak');
  
  // Esperar carga completa
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Tomar screenshot inicial
  await page.screenshot({ path: 'screenshots/debug-initial-page.png', fullPage: true });
  
  // Analizar todos los elementos del formulario
  console.log('📋 Analizando elementos del formulario...');
  
  // Buscar selects
  const selects = await page.$$('select');
  console.log(`📋 Selects encontrados: ${selects.length}`);
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    const isVisible = await select.isVisible();
    const hasOptions = await select.$$('option').then(opts => opts.length);
    console.log(`  Select ${i}: Visible=${isVisible}, Options=${hasOptions}`);
  }
  
  // Buscar inputs
  const inputs = await page.$$('input');
  console.log(`📝 Inputs encontrados: ${inputs.length}`);
  for (let i = 0; i < Math.min(inputs.length, 10); i++) {
    const input = inputs[i];
    const type = await input.getAttribute('type') || 'text';
    const name = await input.getAttribute('name') || 'no-name';
    const placeholder = await input.getAttribute('placeholder') || 'no-placeholder';
    const isVisible = await input.isVisible();
    console.log(`  Input ${i}: Type=${type}, Name=${name}, Placeholder=${placeholder}, Visible=${isVisible}`);
  }
  
  // Buscar botones
  const buttons = await page.$$('button, input[type="submit"]');
  console.log(`🔘 Botones encontrados: ${buttons.length}`);
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const text = await button.textContent();
    const type = await button.getAttribute('type') || 'no-type';
    const isVisible = await button.isVisible();
    console.log(`  Botón ${i}: Text="${text}", Type=${type}, Visible=${isVisible}`);
  }
  
  // Buscar checkboxes
  const checkboxes = await page.$$('input[type="checkbox"]');
  console.log(`☑️ Checkboxes encontrados: ${checkboxes.length}`);
  for (let i = 0; i < checkboxes.length; i++) {
    const checkbox = checkboxes[i];
    const name = await checkbox.getAttribute('name') || 'no-name';
    const value = await checkbox.getAttribute('value') || 'no-value';
    const isVisible = await checkbox.isVisible();
    console.log(`  Checkbox ${i}: Name=${name}, Value=${value}, Visible=${isVisible}`);
  }
  
  // Buscar radio buttons
  const radios = await page.$$('input[type="radio"]');
  console.log(`🔘 Radio buttons encontrados: ${radios.length}`);
  for (let i = 0; i < Math.min(radios.length, 10); i++) {
    const radio = radios[i];
    const name = await radio.getAttribute('name') || 'no-name';
    const value = await radio.getAttribute('value') || 'no-value';
    const isVisible = await radio.isVisible();
    console.log(`  Radio ${i}: Name=${name}, Value=${value}, Visible=${isVisible}`);
  }
  
  // Analizar el título de la página
  const title = await page.title();
  console.log(`📄 Título de la página: "${title}"`);
  
  // Analizar URL actual
  const url = page.url();
  console.log(`🌐 URL actual: "${url}"`);
  
  // Buscar elementos específicos que podrían ser relevantes
  const possibleSelectors = [
    'select[name*="dienst"]',
    'select[name*="service"]',
    'input[name*="telefoon"]',
    'input[name*="phone"]',
    'input[name*="naam"]',
    'input[name*="name"]',
    'input[name*="kenteken"]',
    'input[name*="plate"]',
    'input[name*="kilometerstand"]',
    'input[name*="mileage"]'
  ];
  
  console.log('🔍 Buscando selectores específicos...');
  for (const selector of possibleSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        const isVisible = await element.isVisible();
        console.log(`  ✅ ${selector}: Encontrado, Visible=${isVisible}`);
      } else {
        console.log(`  ❌ ${selector}: No encontrado`);
      }
    } catch (e) {
      console.log(`  ❌ ${selector}: Error - ${e.message}`);
    }
  }
  
  // Esperar interacción manual
  console.log('⏱️ Página cargada. Esperando 10 segundos para inspección manual...');
  await page.waitForTimeout(10000);
  
  // Tomar screenshot final
  await page.screenshot({ path: 'screenshots/debug-final-page.png', fullPage: true });
  
  console.log('✅ Análisis completado. Revisa los screenshots en la carpeta screenshots/');
});