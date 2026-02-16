import { test, expect } from '@playwright/test';

test('Debugging Profundo - Analizar Selects y Opciones', async ({ page }) => {
  test.setTimeout(60000);
  
  console.log('🔍 Analizando selects y opciones en detalle...');
  
  // Navegar a la página
  await page.goto('https://tvsengineering.com/nl/afspraak');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);
  
  // Analizar todos los selects en detalle
  const selects = await page.$$('select');
  console.log(`📋 Total de selects encontrados: ${selects.length}`);
  
  for (let i = 0; i < selects.length; i++) {
    const select = selects[i];
    const isVisible = await select.isVisible();
    const hasOptions = await select.$$('option');
    const optionCount = hasOptions.length;
    
    console.log(`\n📋 Select ${i}:`);
    console.log(`  Visible: ${isVisible}`);
    console.log(`  Opciones: ${optionCount}`);
    
    if (isVisible && optionCount > 0) {
      // Obtener todas las opciones
      const options = await select.$$('option');
      console.log(`  Opciones encontradas:`);
      
      for (let j = 0; j < Math.min(options.length, 10); j++) {
        const option = options[j];
        const text = await option.textContent();
        const value = await option.getAttribute('value');
        const index = await option.getAttribute('index');
        
        console.log(`    [${j}] Text: "${text}", Value: "${value}", Index: ${index}`);
      }
      
      // Intentar seleccionar la segunda opción para ver si es "diagnose"
      if (optionCount > 1) {
        console.log(`  🧪 Intentando seleccionar opción 1...`);
        try {
          await select.selectOption({ index: 1 });
          const selectedValue = await select.inputValue();
          const selectedText = await select.locator('option:checked').textContent();
          console.log(`  ✅ Selección exitosa: Value="${selectedValue}", Text="${selectedText}"`);
          
          // Si es "diagnose" o similar, lo guardamos
          if (selectedText.toLowerCase().includes('diagnos') || 
              selectedText.toLowerCase().includes('diagnostic') ||
              selectedValue.toLowerCase().includes('diagnos')) {
            console.log(`  🎯 ¡Este es el selector de tipo de servicio!`);
          }
        } catch (e) {
          console.log(`  ❌ Error al seleccionar: ${e.message}`);
        }
      }
    }
  }
  
  // Analizar los inputs principales también
  console.log(`\n📝 Analizando inputs principales...`);
  
  const importantInputs = [
    { selector: 'input[placeholder*="1234567"]', name: 'Teléfono' },
    { selector: 'input[placeholder*="klant"]', name: 'Nombre' },
    { selector: 'input[placeholder*="Kenteken"]', name: 'Placa' },
    { selector: 'input[placeholder*="Kilometerstand"]', name: 'Kilometraje' },
    { selector: 'input[placeholder*="typ"]', name: 'VIN' }
  ];
  
  for (const input of importantInputs) {
    try {
      const element = await page.$(input.selector);
      if (element) {
        const isVisible = await element.isVisible();
        const name = await element.getAttribute('name');
        console.log(`  ✅ ${input.name}: Encontrado, Name="${name}", Visible=${isVisible}`);
      } else {
        console.log(`  ❌ ${input.name}: No encontrado`);
      }
    } catch (e) {
      console.log(`  ❌ ${input.name}: Error - ${e.message}`);
    }
  }
  
  // Analizar los radio buttons principales
  console.log(`\n🔘 Analizando radio buttons principales...`);
  
  const importantRadios = [
    { selector: 'input[name="attvs[]"]', name: 'Está en TVS' },
    { selector: 'input[name="loanCar[]"]', name: 'Auto de alquiler' },
    { selector: 'input[name="inoperableCar[]"]', name: 'Carro operable' }
  ];
  
  for (const radioGroup of importantRadios) {
    try {
      const radios = await page.$$(radioGroup.selector);
      console.log(`  ${radioGroup.name}: ${radios.length} radio buttons encontrados`);
      
      for (let i = 0; i < radios.length; i++) {
        const radio = radios[i];
        const isVisible = await radio.isVisible();
        const value = await radio.getAttribute('value');
        console.log(`    [${i}] Value="${value}", Visible=${isVisible}`);
      }
    } catch (e) {
      console.log(`  ❌ ${radioGroup.name}: Error - ${e.message}`);
    }
  }
  
  // Analizar checkboxes
  console.log(`\n☑️ Analizando checkboxes...`);
  
  const termsCheckbox = await page.$('input[name="terms[]"]');
  if (termsCheckbox) {
    const isVisible = await termsCheckbox.isVisible();
    console.log(`  ✅ Términos: Visible=${isVisible}`);
  } else {
    console.log(`  ❌ Términos: No encontrado`);
  }
  
  // Tomar screenshot final
  await page.screenshot({ path: 'screenshots/debug-selects-detailed.png', fullPage: true });
  
  console.log('\n✅ Análisis detallado completado');
});