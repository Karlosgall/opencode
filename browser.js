const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Navegar a la ruta específica
  await page.goto("https://tvsengineering.com/nl/afspraak");

  // Esperar a que la página cargue completamente
  await page.waitForLoadState("networkidle");

  // Esperar a que los campos del formulario estén disponibles
  await page.waitForTimeout(3000); // Esperar 3 segundos para que cargue la página

  // Llenar el formulario con datos de ejemplo
  try {
    // Buscar y llenar campos de nombre
    const nameInputs = await page.$$(
      'input[name*="name"], input[name*="naam"], input[placeholder*="name"], input[placeholder*="naam"]',
    );
    if (nameInputs.length > 0) {
      await nameInputs[0].fill("Juan Pérez");
    }

    // Buscar y llenar campos de email
    const emailInputs = await page.$$(
      'input[type="email"], input[name*="email"], input[name*="mail"]',
    );
    if (emailInputs.length > 0) {
      await emailInputs[0].fill("juan.perez@example.com");
    }

    // Buscar y llenar campos de teléfono
    const phoneInputs = await page.$$(
      'input[type="tel"], input[name*="phone"], input[name*="telefoon"]',
    );
    if (phoneInputs.length > 0) {
      await phoneInputs[0].fill("+1234567890");
    }

    // Buscar y seleccionar opciones en select
    const selects = await page.$$("select");
    for (const select of selects) {
      const options = await select.$$("option");
      if (options.length > 1) {
        await select.selectOption({ index: 1 }); // Seleccionar la segunda opción
      }
    }

    // Buscar y llenar campos de texto o textarea
    const textAreas = await page.$$(
      'textarea, input[type="text"]:not([name*="email"]):not([name*="phone"])',
    );
    for (let i = 0; i < Math.min(textAreas.length, 2); i++) {
      await textAreas[i].fill(
        i === 0 ? "Información adicional" : "Comentarios sobre el servicio",
      );
    }

    console.log("Formulario llenado con datos de ejemplo");

    // Capturar una captura de pantalla después de llenar el formulario
    await page.screenshot({ path: "formulario_lleno.png", fullPage: true });
  } catch (error) {
    console.log(
      "No se encontraron campos del formulario o error al llenar:",
      error.message,
    );
  }

  // Capturar una captura de pantalla inicial
  await page.screenshot({
    path: "tvsengineering_afspraak.png",
    fullPage: true,
  });

  console.log("Página de cita cargada y capturas de pantalla guardadas");

  // Mantener el navegador abierto por 15 segundos para que puedas verlo
  setTimeout(async () => {
    await browser.close();
  }, 15000);
})();
