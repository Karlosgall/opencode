const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  
  try {
    console.log('Navigating to page...');
    await page.goto('https://tvsengineering.com/en/test-appointment/', {
      waitUntil: 'networkidle',
      timeout: 45000
    });
    
    console.log('Page title:', await page.title());
    console.log('Current URL:', page.url());
    
    await page.waitForTimeout(2000);
    
    // Get all select elements
    const selects = await page.locator('select').all();
    console.log('\n--- SELECT ELEMENTS ---');
    for (let i = 0; i < selects.length; i++) {
      const id = await selects[i].getAttribute('id');
      const name = await selects[i].getAttribute('name');
      const options = await selects[i].locator('option').all();
      console.log(`Select ${i}: id=${id}, name=${name}`);
      console.log(`  Options:`);
      for (const opt of options) {
        const value = await opt.getAttribute('value');
        const text = await opt.textContent();
        console.log(`    - ${value}: ${text}`);
      }
    }
    
    // Get all buttons
    const buttons = await page.locator('button').all();
    console.log('\n--- BUTTONS ---');
    for (const btn of buttons) {
      const text = await btn.textContent();
      const visible = await btn.isVisible();
      if (visible) console.log(`- ${text.trim()}`);
    }
    
    // Get all inputs
    const inputs = await page.locator('input').all();
    console.log('\n--- INPUTS ---');
    for (const input of inputs) {
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const name = await input.getAttribute('name');
      const id = await input.getAttribute('id');
      console.log(`- type=${type}, placeholder=${placeholder}, name=${name}, id=${id}`);
    }
    
    // Take screenshot
    await page.screenshot({ path: 'page-screenshot.png', fullPage: true });
    console.log('\nScreenshot saved to page-screenshot.png');
    
    console.log('\n--- Waiting 30 seconds for you to inspect ---');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
