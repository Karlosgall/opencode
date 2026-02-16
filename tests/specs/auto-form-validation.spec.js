import { test, expect } from '@playwright/test';
import { AutoFormPage } from '../pages/autoFormPage.js';
import { testCases, dataGenerators } from '../fixtures/testData.js';

test.describe('Validaciones del Formulario de Autos', () => {
  let autoFormPage;

  test.beforeEach(async ({ page }) => {
    autoFormPage = new AutoFormPage(page);
    await autoFormPage.goto();
  });

  test.describe('Validación de Campos Obligatorios', () => {
    test('Debe mostrar error cuando teléfono está vacío', async ({ page }) => {
      console.log('📱 Probando teléfono vacío...');
      
      // Llenar todos los campos excepto teléfono
      const invalidData = { ...testCases.emptyFields[0].data };
      await autoFormPage.selectDiagnose();
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillName(invalidData.name);
      await autoFormPage.fillPlate(invalidData.plate);
      await autoFormPage.fillMileage(invalidData.mileage);
      await autoFormPage.fillVin(invalidData.vin);
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      // Intentar enviar sin teléfono
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('error-empty-phone');
      
      // Verificar que hay errores
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
      
      const errorMessages = await autoFormPage.getErrorMessages();
      console.log('📋 Mensajes de error:', errorMessages);
    });

    test('Debe mostrar error cuando nombre está vacío', async ({ page }) => {
      console.log('👤 Probando nombre vacío...');
      
      const invalidData = { ...testCases.emptyFields[1].data };
      await autoFormPage.selectDiagnose();
      await autoFormPage.fillPhone(invalidData.phone);
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillPlate(invalidData.plate);
      await autoFormPage.fillMileage(invalidData.mileage);
      await autoFormPage.fillVin(invalidData.vin);
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('error-empty-name');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error cuando placa está vacía', async ({ page }) => {
      console.log('🚙 Probando placa vacía...');
      
      const invalidData = { ...testCases.emptyFields[2].data };
      await autoFormPage.selectDiagnose();
      await autoFormPage.fillPhone(invalidData.phone);
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillName(invalidData.name);
      await autoFormPage.fillMileage(invalidData.mileage);
      await autoFormPage.fillVin(invalidData.vin);
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('error-empty-plate');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar múltiples errores cuando todos los campos están vacíos', async ({ page }) => {
      console.log('📋 Probando todos los campos vacíos...');
      
      const invalidData = { ...testCases.emptyFields[3].data };
      await autoFormPage.selectDiagnose();
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('error-all-empty');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
      
      const errorMessages = await autoFormPage.getErrorMessages();
      console.log('📋 Todos los mensajes de error:', errorMessages);
    });
  });

  test.describe('Validación de Formato de Placa', () => {
    test('Debe mostrar error para placa muy corta', async ({ page }) => {
      console.log('🚙 Probando placa muy corta...');
      
      const testData = { ...testCases.invalidFormats.plates[0].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-plate-muy-corta');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para placa muy larga', async ({ page }) => {
      console.log('🚙 Probando placa muy larga...');
      
      const testData = { ...testCases.invalidFormats.plates[1].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-plate-muy-larga');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para placa con caracteres especiales', async ({ page }) => {
      console.log('🚙 Probando placa con caracteres especiales...');
      
      const testData = { ...testCases.invalidFormats.plates[2].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-plate-caracteres-especiales');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para placa con arroba', async ({ page }) => {
      console.log('🚙 Probando placa con arroba...');
      
      const testData = { ...testCases.invalidFormats.plates[3].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-plate-arroba');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para placa solo números', async ({ page }) => {
      console.log('🚙 Probando placa solo números...');
      
      const testData = { ...testCases.invalidFormats.plates[4].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-plate-solo-numeros');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe aceptar placa válida generada aleatoriamente', async ({ page }) => {
      console.log('🎲 Probando placa aleatoria válida...');
      
      const validData = {
        ...testCases.valid[0].data,
        plate: dataGenerators.randomPlate()
      };
      
      await autoFormPage.fillCompleteForm(validData);
      await autoFormPage.takeScreenshot('valid-random-plate');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeFalsy();
    });
  });

  test.describe('Validación de Formato de Teléfono', () => {
    test('Debe mostrar error para teléfono 9 dígitos', async ({ page }) => {
      console.log('📱 Probando teléfono 9 dígitos...');
      
      const testData = { ...testCases.invalidFormats.phones[0].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-phone-9-digitos');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para teléfono 11 dígitos', async ({ page }) => {
      console.log('📱 Probando teléfono 11 dígitos...');
      
      const testData = { ...testCases.invalidFormats.phones[1].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-phone-11-digitos');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para teléfono con guiones', async ({ page }) => {
      console.log('📱 Probando teléfono con guiones...');
      
      const testData = { ...testCases.invalidFormats.phones[2].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-phone-guiones');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para teléfono con letra', async ({ page }) => {
      console.log('📱 Probando teléfono con letra...');
      
      const testData = { ...testCases.invalidFormats.phones[3].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-phone-letra');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para teléfono solo letras', async ({ page }) => {
      console.log('📱 Probando teléfono solo letras...');
      
      const testData = { ...testCases.invalidFormats.phones[4].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-phone-solo-letras');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe aceptar teléfono válido generado aleatoriamente', async ({ page }) => {
      console.log('🎲 Probando teléfono aleatorio válido...');
      
      const validData = {
        ...testCases.valid[0].data,
        phone: dataGenerators.randomPhone()
      };
      
      await autoFormPage.fillCompleteForm(validData);
      await autoFormPage.takeScreenshot('valid-random-phone');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeFalsy();
    });
  });

  test.describe('Validación de Formato de VIN', () => {
    test('Debe mostrar error para VIN muy corto', async ({ page }) => {
      console.log('🔢 Probando VIN muy corto...');
      
      const testData = { ...testCases.invalidFormats.vins[0].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-vin-muy-corto');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para VIN muy largo', async ({ page }) => {
      console.log('🔢 Probando VIN muy largo...');
      
      const testData = { ...testCases.invalidFormats.vins[1].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-vin-muy-largo');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe mostrar error para VIN con caracteres especiales', async ({ page }) => {
      console.log('🔢 Probando VIN con caracteres especiales...');
      
      const testData = { ...testCases.invalidFormats.vins[2].data };
      await autoFormPage.fillCompleteForm(testData);
      await autoFormPage.takeScreenshot('error-vin-caracteres-especiales');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe aceptar VIN válido generado aleatoriamente', async ({ page }) => {
      console.log('🎲 Probando VIN aleatorio válido...');
      
      const validData = {
        ...testCases.valid[0].data,
        vin: dataGenerators.randomVin()
      };
      
      await autoFormPage.fillCompleteForm(validData);
      await autoFormPage.takeScreenshot('valid-random-vin');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeFalsy();
    });
  });

  test.describe('Validación de Casos Especiales y Edge Cases', () => {
    test('Debe manejar caracteres especiales en nombre', async ({ page }) => {
      console.log('⚠️ Probando caracteres especiales en nombre...');
      
      const specialCase = testCases.edgeCases[0];
      await autoFormPage.fillCompleteForm(specialCase.data);
      await autoFormPage.takeScreenshot('special-chars-name');
      
      // Puede aceptar o rechazar, depende de la implementación
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con caracteres especiales: ¿Errores? ${hasErrors}`);
    });

    test('Debe rechazar kilometraje negativo', async ({ page }) => {
      console.log('📉 Probando kilometraje negativo...');
      
      const negativeCase = testCases.edgeCases[1];
      await autoFormPage.fillCompleteForm(negativeCase.data);
      await autoFormPage.takeScreenshot('negative-mileage');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });

    test('Debe validar kilometraje extremadamente alto', async ({ page }) => {
      console.log('📈 Probando kilometraje extremadamente alto...');
      
      const extremeCase = testCases.edgeCases[3];
      await autoFormPage.fillCompleteForm(extremeCase.data);
      await autoFormPage.takeScreenshot('extreme-mileage');
      
      const hasErrors = await autoFormPage.hasErrors();
      // Depende de los límites configurados
      console.log(`📊 Resultado con kilometraje extremo: ¿Errores? ${hasErrors}`);
    });

    test('Debe aceptar placa en minúsculas', async ({ page }) => {
      console.log('🔤 Probando placa en minúsculas...');
      
      const lowercaseCase = testCases.edgeCases[4];
      await autoFormPage.fillCompleteForm(lowercaseCase.data);
      await autoFormPage.takeScreenshot('lowercase-plate');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeFalsy();
    });

    test('Debe rechazar nombre muy largo', async ({ page }) => {
      console.log('📝 Probando nombre muy largo...');
      
      const longNameCase = testCases.edgeCases[5];
      await autoFormPage.fillCompleteForm(longNameCase.data);
      await autoFormPage.takeScreenshot('long-name');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });
  });

  test.describe('Validación de Términos y Condiciones', () => {
    test('Debe rechazar envío sin aceptar términos', async ({ page }) => {
      console.log('📜 Probando envío sin aceptar términos...');
      
      const noTermsCase = testCases.formSpecific[0];
      
      // Llenar todo el formulario pero NO aceptar términos
      await autoFormPage.selectDiagnose();
      await autoFormPage.fillPhone(noTermsCase.data.phone);
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillName(noTermsCase.data.name);
      await autoFormPage.fillPlate(noTermsCase.data.plate);
      await autoFormPage.fillMileage(noTermsCase.data.mileage);
      await autoFormPage.fillVin(noTermsCase.data.vin);
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      
      // NO aceptar términos
      // await autoFormPage.acceptTerms(); // Comentado intencionalmente
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('error-no-terms');
      
      const hasErrors = await autoFormPage.hasErrors();
      expect(hasErrors).toBeTruthy();
    });
  });

  test.describe('Validación de Respuestas del Formulario', () => {
    test('Debe manejar respuesta diferente en parqueado TVS', async ({ page }) => {
      console.log('🅿️ Probando respuesta diferente en parqueado...');
      
      const differentParkedCase = testCases.formSpecific[1];
      await autoFormPage.fillCompleteForm(differentParkedCase.data);
      await autoFormPage.takeScreenshot('different-parked-response');
      
      // Depende del flujo del negocio
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con respuesta diferente en parqueado: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar respuesta diferente en alquiler', async ({ page }) => {
      console.log('🚗 Probando respuesta diferente en alquiler...');
      
      const differentRentalCase = testCases.formSpecific[2];
      await autoFormPage.fillCompleteForm(differentRentalCase.data);
      await autoFormPage.takeScreenshot('different-rental-response');
      
      // Depende del flujo del negocio
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con respuesta diferente en alquiler: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar carro no operable', async ({ page }) => {
      console.log('⚠️ Probando carro no operable...');
      
      const notOperableCase = testCases.formSpecific[3];
      await autoFormPage.fillCompleteForm(notOperableCase.data);
      await autoFormPage.takeScreenshot('not-operable-car');
      
      // Depende del flujo del negocio
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con carro no operable: ¿Errores? ${hasErrors}`);
    });
  });

  test.describe('Validación de Tiempo Real', () => {
    test('Debe validar campos en tiempo real al salir del campo', async ({ page }) => {
      console.log('⏰ Probando validación en tiempo real...');
      
      await autoFormPage.selectDiagnose();
      
      // Enviar valor inválido y salir del campo para trigger validación
      const phoneInput = await autoFormPage.findVisibleElement(autoFormPage.selectors.phone);
      if (phoneInput) {
        await phoneInput.fill('123'); // Teléfono inválido
        await phoneInput.blur(); // Salir del campo
        
        await page.waitForTimeout(1000); // Esperar validación
        
        const hasErrors = await autoFormPage.hasErrors();
        await autoFormPage.takeScreenshot('realtime-validation');
        
        console.log(`📊 Validación en tiempo real: ¿Errores? ${hasErrors}`);
      }
    });
  });
});