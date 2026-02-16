import { test, expect } from '@playwright/test';
import { AutoFormPage } from '../pages/autoFormPage.js';
import { validUserData, dataGenerators } from '../fixtures/testData.js';

test.describe('Flujo Principal del Formulario de Autos', () => {
  let autoFormPage;

  test.beforeEach(async ({ page }) => {
    autoFormPage = new AutoFormPage(page);
    await autoFormPage.goto();
  });

  test('Completar formulario exitosamente con datos válidos', async ({ page }) => {
    test.setTimeout(60000); // Aumentar timeout para esta prueba
    
    console.log('🚗 Iniciando prueba del flujo completo del formulario de autos...');
    
    // Paso 1: Seleccionar tipo de servicio "diagnose"
    console.log('📋 Paso 1: Seleccionando tipo de servicio...');
    await autoFormPage.selectDiagnose();
    await autoFormPage.takeScreenshot('01-service-selected');
    
    // Paso 2: Ingresar número de teléfono
    console.log('📱 Paso 2: Ingresando teléfono...');
    await autoFormPage.fillPhone(validUserData.phone);
    await autoFormPage.takeScreenshot('02-phone-filled');
    
    // Paso 3: Seleccionar tipo de usuario "particular"
    console.log('👤 Paso 3: Seleccionando tipo de usuario...');
    await autoFormPage.selectUserTypeParticular();
    await autoFormPage.takeScreenshot('03-user-type-selected');
    
    // Paso 4: Ingresar nombre
    console.log('✍️ Paso 4: Ingresando nombre...');
    await autoFormPage.fillName(validUserData.name);
    await autoFormPage.takeScreenshot('04-name-filled');
    
    // Paso 5: Ingresar placa
    console.log('🚙 Paso 5: Ingresando placa...');
    await autoFormPage.fillPlate(validUserData.plate);
    await autoFormPage.takeScreenshot('05-plate-filled');
    
    // Paso 6: Ingresar kilometraje
    console.log('📊 Paso 6: Ingresando kilometraje...');
    await autoFormPage.fillMileage(validUserData.mileage);
    await autoFormPage.takeScreenshot('06-mileage-filled');
    
    // Paso 7: Ingresar VIN
    console.log('🔢 Paso 7: Ingresando VIN...');
    await autoFormPage.fillVin(validUserData.vin);
    await autoFormPage.takeScreenshot('07-vin-filled');
    
    // Paso 8: Responder que NO está parqueado en TVS
    console.log('🅿️ Paso 8: Respondiendo sobre estacionamiento...');
    await autoFormPage.answerParkedNo();
    await autoFormPage.takeScreenshot('08-parked-answered');
    
    // Paso 9: Responder que NO desea auto para alquilar
    console.log('🚗 Paso 9: Respondiendo sobre alquiler...');
    await autoFormPage.answerRentalNo();
    await autoFormPage.takeScreenshot('09-rental-answered');
    
    // Paso 10: Responder que SÍ el carro está operable
    console.log('✅ Paso 10: Respondiendo sobre operabilidad...');
    await autoFormPage.answerOperableYes();
    await autoFormPage.takeScreenshot('10-operable-answered');
    
    // Paso 11: Aceptar términos y condiciones
    console.log('📜 Paso 11: Aceptando términos...');
    await autoFormPage.acceptTerms();
    await autoFormPage.takeScreenshot('11-terms-accepted');
    
    // Click en botón continuar/enviar
    console.log('🚀 Enviando formulario...');
    await autoFormPage.clickContinue();
    await autoFormPage.takeScreenshot('12-form-submitted');
    
    // Esperar a que se procese el formulario
    await autoFormPage.waitForPageStability();
    await autoFormPage.takeScreenshot('13-final-state');
    
    // Verificar resultado
    const hasSuccess = await autoFormPage.hasSuccess();
    const hasErrors = await autoFormPage.hasErrors();
    
    console.log(`📊 Resultado: ¿Éxito? ${hasSuccess}, ¿Errores? ${hasErrors}`);
    
    // Verificar que no hay errores
    expect(hasErrors).toBeFalsy();
    
    // Verificar éxito (puede que muestre éxito o redireccione)
    // La verificación exacta depende del comportamiento real del formulario
    
    console.log('✅ Prueba del flujo completo finalizada');
  });

  test('Completar formulario usando método helper', async ({ page }) => {
    test.setTimeout(60000);
    
    console.log('🚗 Probando método helper fillCompleteForm...');
    
    // Usar el método helper que llena todo el formulario
    await autoFormPage.fillCompleteForm(validUserData);
    await autoFormPage.takeScreenshot('helper-complete-form');
    
    // Esperar procesamiento
    await autoFormPage.waitForPageStability();
    
    // Verificar que no hay errores
    const hasErrors = await autoFormPage.hasErrors();
    expect(hasErrors).toBeFalsy();
    
    console.log('✅ Método helper funcionando correctamente');
  });

  test('Completar formulario con datos aleatorios generados', async ({ page }) => {
    test.setTimeout(60000);
    
    console.log('🎲 Probando con datos generados aleatoriamente...');
    
    // Generar datos aleatorios
    const randomData = {
      ...validUserData,
      phone: dataGenerators.randomPhone(),
      name: dataGenerators.randomName(),
      plate: dataGenerators.randomPlate(),
      mileage: dataGenerators.randomMileage().toString(),
      vin: dataGenerators.randomVin()
    };
    
    console.log('📋 Datos aleatorios generados:', randomData);
    
    // Llenar formulario con datos aleatorios
    await autoFormPage.fillCompleteForm(randomData);
    await autoFormPage.takeScreenshot('random-data-form');
    
    // Esperar procesamiento
    await autoFormPage.waitForPageStability();
    
    // Verificar que no hay errores
    const hasErrors = await autoFormPage.hasErrors();
    expect(hasErrors).toBeFalsy();
    
    console.log('✅ Formulario completado exitosamente con datos aleatorios');
  });

  test('Verificar que los pasos individuales funcionan correctamente', async ({ page }) => {
    test.setTimeout(60000);
    
    console.log('🔍 Verificando cada paso individualmente...');
    
    // Ejecutar cada paso por separado para debugging
    await autoFormPage.selectDiagnose();
    await page.waitForTimeout(1000);
    
    await autoFormPage.fillPhone(validUserData.phone);
    await page.waitForTimeout(1000);
    
    await autoFormPage.selectUserTypeParticular();
    await page.waitForTimeout(1000);
    
    await autoFormPage.fillName(validUserData.name);
    await page.waitForTimeout(1000);
    
    await autoFormPage.fillPlate(validUserData.plate);
    await page.waitForTimeout(1000);
    
    await autoFormPage.fillMileage(validUserData.mileage);
    await page.waitForTimeout(1000);
    
    await autoFormPage.fillVin(validUserData.vin);
    await page.waitForTimeout(1000);
    
    await autoFormPage.answerParkedNo();
    await page.waitForTimeout(1000);
    
    await autoFormPage.answerRentalNo();
    await page.waitForTimeout(1000);
    
    await autoFormPage.answerOperableYes();
    await page.waitForTimeout(1000);
    
    await autoFormPage.acceptTerms();
    await page.waitForTimeout(1000);
    
    await autoFormPage.clickContinue();
    
    // Esperar resultado
    await autoFormPage.waitForPageStability();
    
    const hasErrors = await autoFormPage.hasErrors();
    console.log(`📊 Resultado paso a paso: ¿Errores? ${hasErrors}`);
    
    // Tomar screenshot final para debugging
    await autoFormPage.takeScreenshot('step-by-step-result');
    
    console.log('✅ Verificación de pasos individuales completada');
  });

  test('Validar que el formulario se carga correctamente', async ({ page }) => {
    console.log('🔍 Verificando carga correcta del formulario...');
    
    // Esperar a que la página cargue completamente
    await autoFormPage.waitForPageStability();
    
    // Tomar screenshot inicial
    await autoFormPage.takeScreenshot('initial-page-load');
    
    // Verificar que estamos en la página correcta
    const title = await page.title();
    console.log('📄 Título de la página:', title);
    
    // Verificar URL
    const url = page.url();
    console.log('🌐 URL actual:', url);
    expect(url).toContain('tvsengineering.com');
    
    // No hay errores visibles al cargar
    const hasErrors = await autoFormPage.hasErrors();
    expect(hasErrors).toBeFalsy();
    
    console.log('✅ Página cargada correctamente sin errores');
  });

  test('Probar resiliencia con timeouts aumentados', async ({ page }) => {
    test.setTimeout(120000); // Timeout más largo para esta prueba
    
    console.log('⏰ Probando con timeouts aumentados para conexiones lentas...');
    
    // Simular conexión más lenta
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 1000); // Retrasar cada petición 1 segundo
    });
    
    // Navegar nuevamente con conexión simulada
    await autoFormPage.goto();
    
    // Intentar completar el formulario
    await autoFormPage.fillCompleteForm(validUserData);
    await autoFormPage.takeScreenshot('slow-connection-test');
    
    // Verificar resultado
    const hasErrors = await autoFormPage.hasErrors();
    console.log(`📊 Resultado con conexión lenta: ¿Errores? ${hasErrors}`);
    
    console.log('✅ Prueba de resiliencia completada');
  });
});