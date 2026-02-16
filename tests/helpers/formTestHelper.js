/**
 * Funciones helper para pruebas del formulario de autos
 * Contiene utilidades reutilizables para diferentes tipos de pruebas
 */

import { expect } from '@playwright/test';

/**
 * Clase Helper con utilidades comunes
 */
export class FormTestHelper {
  constructor(page) {
    this.page = page;
  }

  /**
   * Esperar a que todos los elementos del formulario estén visibles
   */
  async waitForFormElements() {
    const selectors = [
      'select', 'input[type="tel"]', 'input[type="text"]',
      'input[type="checkbox"]', 'button[type="submit"]'
    ];
    
    for (const selector of selectors) {
      try {
        await this.page.waitForSelector(selector, { 
          state: 'visible', 
          timeout: 10000 
        });
      } catch (e) {
        console.log(`⚠️ Selector no encontrado: ${selector}`);
      }
    }
  }

  /**
   * Validar que un elemento tenga la clase o atributo de error
   */
  async hasValidationError(element, errorClass = 'error') {
    const classes = await element.getAttribute('class') || '';
    return classes.includes(errorClass);
  }

  /**
   * Contar elementos visibles de un tipo
   */
  async countVisibleElements(selector) {
    const elements = await this.page.$$(selector);
    let visibleCount = 0;
    
    for (const element of elements) {
      if (await element.isVisible()) {
        visibleCount++;
      }
    }
    
    return visibleCount;
  }

  /**
   * Obtener texto de todos los mensajes de error
   */
  async getAllErrorMessages() {
    const errorSelectors = [
      '.error', '.alert', '.validation-error', 
      '.field-error', '[role="alert"]', '.message.error'
    ];
    
    const messages = [];
    
    for (const selector of errorSelectors) {
      const elements = await this.page.$$(selector);
      for (const element of elements) {
        if (await element.isVisible()) {
          const text = await element.textContent();
          if (text && text.trim()) {
            messages.push(text.trim());
          }
        }
      }
    }
    
    return [...new Set(messages)]; // Remover duplicados
  }

  /**
   * Verificar si el formulario está completamente cargado
   */
  async isFormReady() {
    try {
      // Verificar que hay elementos del formulario
      const hasSelect = await this.page.locator('select').count() > 0;
      const hasInputs = await this.page.locator('input').count() > 0;
      const hasButton = await this.page.locator('button[type="submit"], input[type="submit"]').count() > 0;
      
      return hasSelect && hasInputs && hasButton;
    } catch (e) {
      return false;
    }
  }

  /**
   * Limpiar todos los campos del formulario
   */
  async clearForm() {
    // Limpiar inputs de texto
    const textInputs = await this.page.$$('input[type="text"], input[type="tel"], textarea');
    for (const input of textInputs) {
      if (await input.isVisible()) {
        await input.clear();
      }
    }

    // Resetear selects
    const selects = await this.page.$$('select');
    for (const select of selects) {
      if (await select.isVisible()) {
        await select.selectOption({ index: 0 });
      }
    }

    // Uncheck checkboxes
    const checkboxes = await this.page.$$('input[type="checkbox"]');
    for (const checkbox of checkboxes) {
      if (await checkbox.isVisible() && await checkbox.isChecked()) {
        await checkbox.uncheck();
      }
    }
  }

  /**
   * Validar formato de teléfono
   */
  isValidPhone(phone) {
    return /^3\d{9}$/.test(phone);
  }

  /**
   * Validar formato de placa (estándar)
   */
  isValidPlate(plate) {
    return /^[A-Z]{3}\d{3}$/i.test(plate);
  }

  /**
   * Validar formato de VIN
   */
  isValidVin(vin) {
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
  }

  /**
   * Generar timestamp para nombres de archivo
   */
  getTimestamp() {
    return new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  }

  /**
   * Tomar screenshot con nombre automático
   */
  async takeAutoScreenshot(prefix) {
    const timestamp = this.getTimestamp();
    const filename = `${prefix}-${timestamp}.png`;
    await this.page.screenshot({ 
      path: `screenshots/${filename}`, 
      fullPage: true 
    });
    console.log(`📸 Screenshot guardado: ${filename}`);
    return filename;
  }

  /**
   * Esperar a que desaparezcan los loaders
   */
  async waitForLoaders() {
    const loaderSelectors = [
      '.loading', '.spinner', '.loader',
      '[class*="loading"]', '[class*="spinner"]',
      '[aria-busy="true"]'
    ];
    
    for (const selector of loaderSelectors) {
      try {
        await this.page.waitForSelector(selector, { 
          state: 'hidden', 
          timeout: 5000 
        });
      } catch (e) {
        // Continuar si no hay loader
      }
    }
  }

  /**
   * Simular usuario humano con delays aleatorios
   */
  async simulateHumanTyping(element, text, minDelay = 50, maxDelay = 150) {
    await element.focus();
    
    for (const char of text) {
      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      await element.type(char, { delay });
    }
  }

  /**
   * Verificar accesibilidad básica
   */
  async checkBasicAccessibility() {
    const checks = {
      hasAltText: await this.page.locator('img:not([alt])').count() === 0,
      hasLabels: await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count() === 0,
      hasHeadings: await this.page.locator('h1, h2, h3, h4, h5, h6').count() > 0,
      hasTitle: await this.page.title() !== ''
    };
    
    console.log('♿ Verificación de accesibilidad básica:', checks);
    return checks;
  }

  /**
   * Medir rendimiento de la página
   */
  async measurePerformance() {
    const metrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    console.log('📊 Métricas de rendimiento:', metrics);
    return metrics;
  }

  /**
   * Verificar consola de errores
   */
  async checkConsoleErrors() {
    const errors = [];
    
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          text: msg.text(),
          location: msg.location()
        });
      }
    });
    
    return errors;
  }

  /**
   * Simular diferentes dispositivos
   */
  async simulateDevice(deviceName) {
    const devices = {
      mobile: { width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)' },
      tablet: { width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)' },
      desktop: { width: 1920, height: 1080, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    };
    
    const device = devices[deviceName] || devices.desktop;
    
    await this.page.setViewportSize({ width: device.width, height: device.height });
    await this.page.setUserAgent(device.userAgent);
    
    console.log(`📱 Simulando dispositivo: ${deviceName} (${device.width}x${device.height})`);
  }

  /**
   * Crear reporte personalizado
   */
  async createTestReport(testResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: testResults.length,
        passed: testResults.filter(r => r.status === 'passed').length,
        failed: testResults.filter(r => r.status === 'failed').length,
        skipped: testResults.filter(r => r.status === 'skipped').length
      },
      details: testResults
    };
    
    console.log('📊 Reporte de prueba:', JSON.stringify(report, null, 2));
    return report;
  }
}

/**
 * Utilidades estáticas
 */
export const TestUtils = {
  /**
   * Generar datos de prueba consistentes
   */
  generateConsistentTestData(seed = 'test') {
    const hash = this.simpleHash(seed);
    const random = this.seededRandom(hash);
    
    return {
      phone: `3${Math.floor(random() * 1000000000).toString().padStart(9, '0')}`,
      name: `Test User ${seed}`,
      plate: this.generatePlate(hash),
      vin: this.generateVin(hash),
      mileage: Math.floor(random() * 200000 + 1000).toString()
    };
  },

  /**
   * Hash simple para generar datos consistentes
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  },

  /**
   * Generador de números aleatorios con semilla
   */
  seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  },

  /**
   * Generar placa basada en hash
   */
  generatePlate(hash) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let plate = '';
    
    for (let i = 0; i < 3; i++) {
      const index = (hash + i * 7) % 26;
      plate += letters[index];
    }
    
    for (let i = 0; i < 3; i++) {
      const digit = (hash + i * 13) % 10;
      plate += digit.toString();
    }
    
    return plate;
  },

  /**
   * Generar VIN basado en hash
   */
  generateVin(hash) {
    const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
    let vin = '';
    
    for (let i = 0; i < 17; i++) {
      const index = (hash + i * 17) % chars.length;
      vin += chars[index];
    }
    
    return vin;
  },

  /**
   * Formatear duración de prueba
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }
};

export default FormTestHelper;