const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('https://tvsengineering.com/en/test-appointment/', { waitUntil: 'networkidle' });
  
  await page.locator('select').first().selectOption({ label: 'Reparatie' });
  console.log('Reparatie seleccionado');
  
  await page.waitForTimeout(600000);
})();
