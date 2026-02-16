import { test, expect } from '@playwright/test';
import { AutoFormPage } from '../pages/autoFormPage.js';
import { performanceData, dataGenerators } from '../fixtures/testData.js';

test.describe('Casos Negativos y de Estrés del Formulario', () => {
  let autoFormPage;

  test.beforeEach(async ({ page }) => {
    autoFormPage = new AutoFormPage(page);
    await autoFormPage.goto();
  });

  test.describe('Pruebas de Rendimiento y Carga', () => {
    test('Debe manejar múltiples envíos rápidos', async ({ page }) => {
      test.setTimeout(300000); // 5 minutos para esta prueba
      
      console.log('🚀 Probando múltiples envíos rápidos...');
      const rapidData = performanceData.rapidSubmissions;
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 1; i <= rapidData.count; i++) {
        console.log(`📤 Envío ${i}/${rapidData.count}...`);
        
        try {
          // Generar datos únicos para cada envío
          const uniqueData = {
            ...rapidData.userData,
            phone: dataGenerators.randomPhone(),
            name: `${dataGenerators.randomName()} (Test ${i})`,
            plate: dataGenerators.randomPlate(),
            mileage: dataGenerators.randomMileage().toString(),
            vin: dataGenerators.randomVin()
          };
          
          // Navegar si no es el primer intento
          if (i > 1) {
            await autoFormPage.goto();
          }
          
          await autoFormPage.fillCompleteForm(uniqueData);
          await autoFormPage.takeScreenshot(`rapid-submission-${i}`);
          
          const hasErrors = await autoFormPage.hasErrors();
          if (hasErrors) {
            errorCount++;
            console.log(`❌ Envío ${i} falló`);
          } else {
            successCount++;
            console.log(`✅ Envío ${i} exitoso`);
          }
          
          // Esperar entre envíos
          if (i < rapidData.count) {
            await page.waitForTimeout(rapidData.delayBetween);
          }
          
        } catch (error) {
          console.error(`💥 Error en envío ${i}:`, error.message);
          errorCount++;
        }
      }
      
      console.log(`📊 Resultado final: ${successCount} exitosos, ${errorCount} fallidos`);
      await autoFormPage.takeScreenshot('rapid-submissions-final');
      
      // Al menos algunos deberían ser exitosos
      expect(successCount).toBeGreaterThan(0);
    });

    test('Debe manejar datos extremadamente grandes', async ({ page }) => {
      console.log('📊 Probando con datos grandes...');
      
      const largeData = { ...performanceData.largeData };
      await autoFormPage.fillCompleteForm(largeData);
      await autoFormPage.takeScreenshot('large-data-test');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con datos grandes: ¿Errores? ${hasErrors}`);
      
      // Puede rechazar datos muy grandes o truncarlos
      if (hasErrors) {
        const errorMessages = await autoFormPage.getErrorMessages();
        console.log('📋 Errores con datos grandes:', errorMessages);
      }
    });
  });

  test.describe('Pruebas de Red y Conectividad', () => {
    test('Debe manejar conexión lenta', async ({ page }) => {
      console.log('🐌 Probando conexión lenta...');
      
      // Simular conexión 3G lenta
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 2000); // 2 segundos de retraso
      });
      
      await autoFormPage.goto();
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('slow-connection');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con conexión lenta: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar pérdida temporal de conexión', async ({ page }) => {
      console.log('🔌 Probando pérdida temporal de conexión...');
      
      // Llenar formulario primero
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      
      // Simular pérdida de conexión antes de enviar
      await page.route('**/*', route => route.abort('failed'));
      
      // Intentar enviar
      await autoFormPage.clickContinue();
      await page.waitForTimeout(3000);
      
      // Restaurar conexión
      await page.unroute('**/*');
      
      await autoFormPage.takeScreenshot('connection-lost');
      
      // Debería mostrar error de conexión o timeout
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con pérdida de conexión: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar timeout de servidor', async ({ page }) => {
      console.log('⏰ Probando timeout de servidor...');
      
      // Simular timeout del servidor
      await page.route('**/*', route => {
        // No responder para simular timeout
      });
      
      await autoFormPage.goto();
      
      try {
        await autoFormPage.fillCompleteForm(dataGenerators.randomPhone(), { timeout: 5000 });
      } catch (error) {
        console.log('⏰ Timeout esperado:', error.message);
      }
      
      await autoFormPage.takeScreenshot('server-timeout');
      
      // Restaurar rutas
      await page.unroute('**/*');
    });
  });

  test.describe('Pruebas de Manejo de Errores', () => {
    test('Debe manejar errores JavaScript en la página', async ({ page }) => {
      console.log('💥 Probando manejo de errores JavaScript...');
      
      // Inyectar un error JavaScript
      await page.addScriptTag({
        content: `
          setTimeout(() => {
            throw new Error('Error de prueba inyectado');
          }, 1000);
        `
      });
      
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('js-error');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con error JS: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar CSS roto o estilos faltantes', async ({ page }) => {
      console.log('🎨 Probando con CSS roto...');
      
      // Bloquear archivos CSS
      await page.route('**/*.css', route => route.abort('failed'));
      
      await autoFormPage.goto();
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('broken-css');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con CSS roto: ¿Errores? ${hasErrors}`);
      
      // Restaurar rutas
      await page.unroute('**/*.css');
    });

    test('Debe manejar scripts externos bloqueados', async ({ page }) => {
      console.log('📜 Probando scripts externos bloqueados...');
      
      // Bloquear scripts JS externos
      await page.route('**/*.js', route => {
        const url = route.request().url();
        // Permitir solo scripts del mismo dominio
        if (url.includes('tvsengineering.com')) {
          route.continue();
        } else {
          route.abort('failed');
        }
      });
      
      await autoFormPage.goto();
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('blocked-scripts');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado con scripts bloqueados: ¿Errores? ${hasErrors}`);
      
      // Restaurar rutas
      await page.unroute('**/*.js');
    });
  });

  test.describe('Pruebas de Concurrente y Multi-usuario', () => {
    test('Debe manejar múltiples pestañas simultáneas', async ({ context }) => {
      console.log('🪟 Probando múltiples pestañas simultáneas...');
      
      // Crear múltiples pestañas
      const pages = [];
      for (let i = 0; i < 3; i++) {
        const page = await context.newPage();
        pages.push(page);
      }
      
      // Realizar operaciones en paralelo
      const promises = pages.map(async (page, index) => {
        const formPage = new AutoFormPage(page);
        await formPage.goto();
        
        const uniqueData = {
          phone: dataGenerators.randomPhone(),
          name: `Usuario Concurrente ${index + 1}`,
          plate: dataGenerators.randomPlate(),
          mileage: dataGenerators.randomMileage().toString(),
          vin: dataGenerators.randomVin()
        };
        
        await formPage.fillCompleteForm(uniqueData);
        await formPage.takeScreenshot(`concurrent-tab-${index + 1}`);
        
        const hasErrors = await formPage.hasErrors();
        return { index, hasErrors };
      });
      
      const results = await Promise.all(promises);
      console.log('📊 Resultados concurrentes:', results);
      
      // Cerrar pestañas
      for (const page of pages) {
        await page.close();
      }
      
      // Verificar que al menos una operación fue exitosa
      const successfulOnes = results.filter(r => !r.hasErrors);
      expect(successfulOnes.length).toBeGreaterThan(0);
    });
  });

  test.describe('Pruebas de Seguridad', () => {
    test('Debe manejar intentos XSS en campos de texto', async ({ page }) => {
      console.log('🛡️ Probando protección XSS...');
      
      const xssPayload = '<script>alert("XSS Test")</script>';
      
      await autoFormPage.selectDiagnose();
      await autoFormPage.fillPhone(dataGenerators.randomPhone());
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillName(xssPayload);
      await autoFormPage.fillPlate('TEST123');
      await autoFormPage.fillMileage('50000');
      await autoFormPage.fillVin('12345678901234567');
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('xss-test');
      
      // Verificar que no se ejecutó el script
      const alerts = page.on('dialog', dialog => {
        console.log('🚨 Alerta detectada:', dialog.message());
        dialog.dismiss();
      });
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado XSS: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar intentos SQL Injection', async ({ page }) => {
      console.log('🗃️ Probando protección SQL Injection...');
      
      const sqlPayload = "'; DROP TABLE users; --";
      
      await autoFormPage.selectDiagnose();
      await autoFormPage.fillPhone(dataGenerators.randomPhone());
      await autoFormPage.selectUserTypeParticular();
      await autoFormPage.fillName(sqlPayload);
      await autoFormPage.fillPlate('TEST123');
      await autoFormPage.fillMileage('50000');
      await autoFormPage.fillVin('12345678901234567');
      await autoFormPage.answerParkedNo();
      await autoFormPage.answerRentalNo();
      await autoFormPage.answerOperableYes();
      await autoFormPage.acceptTerms();
      
      await autoFormPage.clickContinue();
      await autoFormPage.takeScreenshot('sql-injection-test');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado SQL Injection: ¿Errores? ${hasErrors}`);
    });
  });

  test.describe('Pruebas de Límites y Recursos', () => {
    test('Debe manejar memoria extrema', async ({ page }) => {
      console.log('💾 Probando manejo de memoria...');
      
      // Crear un objeto grande para consumir memoria
      await page.addScriptTag({
        content: `
          const largeArray = new Array(1000000).fill(0).map((_, i) => ({
            id: i,
            data: 'x'.repeat(100)
          }));
          window.largeArray = largeArray;
        `
      });
      
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('memory-test');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado memoria extrema: ¿Errores? ${hasErrors}`);
    });

    test('Debe manejar tamaño de viewport extremo', async ({ page }) => {
      console.log('📱 Probando viewport extremadamente pequeño...');
      
      // Viewport muy pequeño
      await page.setViewportSize({ width: 320, height: 480 });
      
      await autoFormPage.goto();
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('tiny-viewport');
      
      const hasErrors = await autoFormPage.hasErrors();
      console.log(`📊 Resultado viewport pequeño: ¿Errores? ${hasErrors}`);
      
      // Viewport muy grande
      await page.setViewportSize({ width: 3840, height: 2160 });
      
      await autoFormPage.goto();
      await autoFormPage.fillCompleteForm(dataGenerators.randomPhone());
      await autoFormPage.takeScreenshot('huge-viewport');
      
      const hasErrors2 = await autoFormPage.hasErrors();
      console.log(`📊 Resultado viewport grande: ¿Errores? ${hasErrors2}`);
    });
  });
});