/**
 * Page Object Model para el formulario de autos
 * Contiene los selectores y métodos para interactuar con el formulario
 */
export class AutoFormPage {
  constructor(page) {
    this.page = page;
    this.selectors = {
      // Selectores principales del formulario (basados en análisis real)
      serviceType: [
        'select:nth-of-type(1)', // Primer select visible con 7 opciones
        'select'
      ],
      phone: [
        'input[name*="phone"]',
        'input[placeholder*="1234567"]',
        'input[type="text"]:nth-of-type(2)'
      ],
      userType: [
        'input[name="attvs[]"][value="0"]', // Radio para "No está en TVS" = particular
        'input[name*="attvs"]'
      ],
      name: [
        'input[name*="name"]',
        'input[placeholder*="klant"]',
        'input[name="name[]"]'
      ],
      plate: [
        'input[name*="plate"]',
        'input[placeholder*="Kenteken"]',
        'input[name="licenseplate[]"]'
      ],
      mileage: [
        'input[name*="mileage"]',
        'input[placeholder*="Kilometerstand"]',
        'input[name="mileage[]"]'
      ],
      vin: [
        'input[name*="vin"]',
        'input[placeholder*="typ"]',
        'input[name="vin[]"]'
      ],
      
      // Preguntas del formulario (basados en análisis real)
      parkedNo: [
        'input[name="attvs[]"][value="0"]', // Ya definido arriba como userType
        'input[name*="attvs"][value="0"]'
      ],
      rentalNo: [
        'input[name="loanCar[]"][value="0"]',
        'input[name*="loanCar"][value="0"]'
      ],
      operableYes: [
        'input[name="inoperableCar[]"][value="0"]', // 0 = operable
        'input[name*="inoperableCar"][value="0"]'
      ],
      
      // Términos y envío
      terms: [
        'input[name="terms[]"]',
        'input[type="checkbox"]:nth-of-type(1)'
      ],
      continueBtn: [
        'button[type="submit"]:visible',
        'input[type="submit"]:visible',
        'button[type="submit"]'
      ],
      
      // Elementos de validación
      errorMessage: [
        '.error',
        '.alert',
        '.validation-error',
        '.field-error',
        '[role="alert"]'
      ],
      successMessage: [
        '.success',
        '.confirmation',
        '.thank-you',
        '.bedankt',
        '[data-testid="success"]'
      ]
    };
  }

  /**
   * Navegar a la página del formulario
   */
  async goto() {
    console.log('🌐 Navegando a la página del formulario...');
    
    try {
      // Navegar con timeout extendido y manejo de errores
      await this.page.goto('/', {
        waitUntil: 'networkidle',
        timeout: 45000
      });
      
      console.log(`✅ Navegación exitosa a: ${this.page.url()}`);
      
      // Esperar un tiempo considerable para que cargue todo
      await this.page.waitForTimeout(5000);
      
      // Verificar que la página se cargó correctamente
      const title = await this.page.title();
      console.log(`📄 Título de la página: "${title}"`);
      
      // Tomar screenshot para diagnóstico
      await this.takeScreenshot('page-loaded');
      
    } catch (error) {
      console.error('💥 Error navegando a la página:', error.message);
      await this.takeScreenshot('navigation-error');
      throw error;
    }
  }

  /**
   * Paso 1: Seleccionar tipo de servicio "diagnose"
   */
  async selectDiagnose() {
    console.log('📋 Intentando seleccionar tipo de servicio...');
    
    // Estrategia 1: Buscar cualquier select visible
    const allSelects = await this.page.$$('select');
    console.log(`📋 Total de selects encontrados: ${allSelects.length}`);
    
    for (let i = 0; i < allSelects.length; i++) {
      const select = allSelects[i];
      const isVisible = await select.isVisible();
      const hasOptions = await select.$$('option').then(opts => opts.length);
      
      console.log(`  Select ${i}: Visible=${isVisible}, Options=${hasOptions}`);
      
      if (isVisible && hasOptions > 1) {
        try {
          // Intentar seleccionar la segunda opción (índice 1)
          await select.selectOption({ index: 1 });
          
          const selectedText = await select.locator('option:checked').textContent();
          console.log(`✅ Selección exitosa: "${selectedText}"`);
          
          await this.takeScreenshot('service-selected');
          return;
        } catch (e) {
          console.log(`❌ Error seleccionando select ${i}: ${e.message}`);
          continue;
        }
      }
    }
    
    // Si llegamos aquí, no se pudo seleccionar
    console.log('⚠️ No se pudo seleccionar tipo de servicio, continuando...');
    await this.takeScreenshot('no-service-selected');
  }

  /**
   * Paso 2: Ingresar número de teléfono
   */
  async fillPhone(phone) {
    console.log('📱 Intentando llenar teléfono...');
    
    // Estrategia 1: Buscar por placeholder
    const phoneByPlaceholder = await this.page.locator('input[placeholder*="1234567"]').first();
    if (await phoneByPlaceholder.isVisible()) {
      await phoneByPlaceholder.fill(phone);
      console.log('✅ Teléfono llenado por placeholder');
      await this.takeScreenshot('phone-filled');
      return;
    }
    
    // Estrategia 2: Buscar por name
    const phoneByName = await this.page.locator('input[name*="phone"]').first();
    if (await phoneByName.isVisible()) {
      await phoneByName.fill(phone);
      console.log('✅ Teléfono llenado por name');
      await this.takeScreenshot('phone-filled');
      return;
    }
    
    // Estrategia 3: Cualquier input de texto visible
    const allInputs = await this.page.$$('input[type="text"]');
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      if (await input.isVisible()) {
        const placeholder = await input.getAttribute('placeholder') || '';
        if (placeholder.includes('321') || placeholder.includes('123')) {
          await input.fill(phone);
          console.log(`✅ Teléfono llenado en input ${i}`);
          await this.takeScreenshot('phone-filled');
          return;
        }
      }
    }
    
    console.log('⚠️ No se encontró campo de teléfono, continuando...');
  }

  /**
   * Paso 3: Seleccionar tipo de usuario "particular" (No está en TVS = 0)
   */
  async selectUserTypeParticular() {
    const userTypeRadio = await this.findVisibleElement(this.selectors.userType);
    if (userTypeRadio) {
      await userTypeRadio.check();
    } else {
      throw new Error('No se encontró el selector de tipo de usuario (attvs[])');
    }
  }

  /**
   * Paso 4: Ingresar nombre
   */
  async fillName(name) {
    const nameInput = await this.findVisibleElement(this.selectors.name);
    if (nameInput) {
      await nameInput.fill(name);
    } else {
      throw new Error('No se encontró el campo de nombre');
    }
  }

  /**
   * Paso 5: Ingresar placa
   */
  async fillPlate(plate) {
    const plateInput = await this.findVisibleElement(this.selectors.plate);
    if (plateInput) {
      await plateInput.fill(plate);
    } else {
      throw new Error('No se encontró el campo de placa');
    }
  }

  /**
   * Paso 6: Ingresar kilometraje
   */
  async fillMileage(mileage) {
    const mileageInput = await this.findVisibleElement(this.selectors.mileage);
    if (mileageInput) {
      await mileageInput.fill(mileage);
    } else {
      throw new Error('No se encontró el campo de kilometraje');
    }
  }

  /**
   * Paso 7: Ingresar VIN
   */
  async fillVin(vin) {
    const vinInput = await this.findVisibleElement(this.selectors.vin);
    if (vinInput) {
      await vinInput.fill(vin);
    } else {
      throw new Error('No se encontró el campo de VIN');
    }
  }

  /**
   * Paso 8: Responder que NO está parqueado en TVS (mismo que paso 3)
   */
  async answerParkedNo() {
    // Este ya está cubierto por selectUserTypeParticular()
    console.log('ℹ️ Paso 8 (parqueado) ya cubierto por tipo de usuario');
  }

  /**
   * Paso 9: Responder que NO desea auto para alquilar
   */
  async answerRentalNo() {
    const rentalRadio = await this.findVisibleElement(this.selectors.rentalNo);
    if (rentalRadio) {
      await rentalRadio.check();
    } else {
      console.log('No se encontró opción para "no desea alquilar" (loanCar[])');
    }
  }

  /**
   * Paso 10: Responder que SÍ el carro está operable (value="0")
   */
  async answerOperableYes() {
    const operableRadio = await this.findVisibleElement(this.selectors.operableYes);
    if (operableRadio) {
      await operableRadio.check();
    } else {
      console.log('No se encontró opción para "carro operable" (inoperableCar[])');
    }
  }

  /**
   * Paso 11: Aceptar términos y condiciones
   */
  async acceptTerms() {
    const termsCheckbox = await this.findVisibleElement(this.selectors.terms);
    if (termsCheckbox) {
      await termsCheckbox.check();
    } else {
      console.log('No se encontró checkbox de términos y condiciones');
    }
  }

  /**
   * Click en botón continuar/enviar
   */
  async clickContinue() {
    const continueBtn = await this.findVisibleElement(this.selectors.continueBtn);
    if (continueBtn) {
      await continueBtn.click();
      // Esperar un momento para procesar
      await this.page.waitForTimeout(1000);
    } else {
      throw new Error('No se encontró el botón de continuar/enviar');
    }
  }

  /**
   * Método completo para llenar el formulario con todos los datos
   */
  async fillCompleteForm(formData) {
    await this.selectDiagnose();
    await this.fillPhone(formData.phone);
    await this.selectUserTypeParticular();
    await this.fillName(formData.name);
    await this.fillPlate(formData.plate);
    await this.fillMileage(formData.mileage);
    await this.fillVin(formData.vin);
    await this.answerParkedNo();
    await this.answerRentalNo();
    await this.answerOperableYes();
    await this.acceptTerms();
    await this.clickContinue();
  }

  /**
   * Verificar si hay mensajes de error
   */
  async hasErrors() {
    const errorElement = await this.findVisibleElement(this.selectors.errorMessage);
    return errorElement !== null;
  }

  /**
   * Verificar si hay mensajes de éxito
   */
  async hasSuccess() {
    const successElement = await this.findVisibleElement(this.selectors.successMessage);
    return successElement !== null;
  }

  /**
   * Obtener texto de mensajes de error
   */
  async getErrorMessages() {
    const errors = await this.page.locator(this.selectors.errorMessage.join(', ')).all();
    const errorTexts = [];
    for (const error of errors) {
      if (await error.isVisible()) {
        errorTexts.push(await error.textContent());
      }
    }
    return errorTexts;
  }

  /**
   * Método helper para encontrar el primer elemento visible de una lista de selectores
   */
  async findVisibleElement(selectors) {
    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          return element;
        }
      } catch (e) {
        // Continuar con el siguiente selector
        continue;
      }
    }
    return null;
  }

  /**
   * Tomar screenshot para debugging
   */
  async takeScreenshot(name) {
    await this.page.screenshot({ 
      path: `screenshots/${name}-${Date.now()}.png`, 
      fullPage: true 
    });
  }

  /**
   * Esperar a que la página se estabilice
   */
  async waitForPageStability() {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }
}