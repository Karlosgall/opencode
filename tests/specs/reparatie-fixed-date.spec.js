import { test, expect } from '@playwright/test';

test.describe('TVS Engineering Test Appointment Form - Reparatie Fixed Date', () => {
  const testData = {
    job: 'Reparatie',
    planning: 'Gepland',
    date: '27-03-2026',
    phone: '3123456789',
    countryCode: '+57',
    email: 'test@example.com',
    address: 'Calle 123 # 45-67',
    postcode: '110111',
    city: 'Bogota',
    language: 'English',
    customerType: 'Particulier',
    name: 'Prueba fecha fija',
    mileage: '50000',
    vin: 'WVWZZZ3CZWE123456',
    atTvs: false,
    drivable: true,
    rentalCar: false,
    drivingProblems: false,
    sounds: false,
    vibrations: false,
    dashboard: false
  };

  test('Complete test appointment form with Reparatie and fixed date', async ({ page }) => {
    test.setTimeout(90000);
    
    // Generate unique plate based on timestamp
    const now = new Date();
    const timestamp = now.getHours() + '' + now.getMinutes() + '' + now.getSeconds();
    testData.plate = 'FEB-' + timestamp;

    console.log('📅 Starting test appointment form - Reparatie Fixed Date...');

    // Step 1: Navigate to page
    console.log('🌐 Step 1: Navigating to test appointment page...');
    await page.goto('https://tvsengineering.com/en/test-appointment/', {
      waitUntil: 'networkidle',
      timeout: 45000
    });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Step 2: Select Job type (Opdracht) - Reparatie
    console.log('📋 Step 2: Selecting job type - Reparatie...');
    await page.locator('select').first().selectOption({ label: testData.job });
    await page.waitForTimeout(1500);

    // Handle modal: "Ik begrijp het"
    console.log('📋 Step 2b: Handling modal "Ik begrijp het"...');
    try {
      const ikBegrijp = page.locator('text=Ik begrijp het').first();
      if (await ikBegrijp.isVisible({ timeout: 3000 })) {
        await ikBegrijp.click();
        console.log('✅ Modal "Ik begrijp het" closed');
      }
    } catch (e) {}
    await page.waitForTimeout(1000);

    // Step 3: Click Volgende to go to Planning
    console.log('➡️ Step 3: Going to Planning step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 4: Select Planning option - Gepland (Fixed date)
    console.log('📅 Step 4: Selecting planning option - Gepland...');
    await page.getByRole('button', { name: /Gepland/ }).click();
    await page.waitForTimeout(1000);

    // Step 5: Select date - find first available date
    console.log('📅 Step 5: Selecting first available date...');
    await page.getByRole('textbox', { name: /Selecteer een datum/ }).click();
    await page.waitForTimeout(1500);
    
    // Navigate to month with available dates if needed - look for a day number that is not disabled
    let attempts = 0;
    let dayFound = false;
    
    while (!dayFound && attempts < 12) {
      // Get all day squares that are not disabled and are actual day numbers (not day names like Mon, Tue)
      const dayButtons = page.locator('.qs-square.qs-num:not(.qs-disabled)');
      const count = await dayButtons.count();
      console.log(`Found ${count} available days in current month`);
      
      if (count > 0) {
        // Click the first available day
        await dayButtons.first().click({ force: true });
        await page.waitForTimeout(500);
        dayFound = true;
      } else {
        // No available days, navigate to next month using the right arrow button
        console.log(`No available days, navigating to next month...`);
        // Find the right arrow - it's the second arrow button in the header
        const arrows = await page.locator('.qs-arrow').all();
        if (arrows.length >= 2) {
          await arrows[1].click({ force: true });
        } else {
          // Fallback: click on the month/year text to open month selector
          await page.locator('.qs-month-year').click({ force: true });
          await page.waitForTimeout(300);
          // Click on Mar (March) - index 2 since Jan is 0, Feb is 1, Mar is 2
          await page.locator('.qs-overlay-month').nth(2).click({ force: true });
        }
        await page.waitForTimeout(1000);
        attempts++;
      }
    }
    
    await page.waitForTimeout(1000);
    console.log('✅ Date selected: first available date');

    // Step 6: Click Volgende to go to Contact
    console.log('➡️ Step 6: Going to Contact step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 7: Fill Contact info
    console.log('📱 Step 7: Filling contact information...');
    // Phone number
    await page.locator('input[type="tel"], input[placeholder*="6"]').first().fill(testData.phone);
    await page.waitForTimeout(500);
    // Click Controleren button to validate phone
    console.log('📱 Step 7b: Validating phone number...');
    try {
      const checkBtn = page.locator('button:has-text("Controleren")');
      if (await checkBtn.isVisible({ timeout: 2000 })) {
        await checkBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Phone validated - fields auto-filled');
      }
    } catch (e) {}
    await page.waitForTimeout(1000);
    console.log('✅ Contact info filled');

    // Step 8: Click Volgende to go to Preferences
    console.log('➡️ Step 8: Going to Preferences step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 9: Fill Preferences
    console.log('⚙️ Step 9: Filling preferences...');
    await page.getByLabel('Klanttype').selectOption(testData.customerType);
    await page.waitForTimeout(1000);

    // Fill name
    await page.getByRole('textbox', { name: /Naam/ }).fill(testData.name);
    await page.waitForTimeout(1000);
    console.log('✅ Preferences filled');

    // Step 10: Click Volgende to go to Vehicle
    console.log('➡️ Step 10: Going to Vehicle step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 11: Fill Vehicle info
    console.log('🚗 Step 11: Filling vehicle information...');
    await page.getByRole('textbox', { name: /Kenteken/ }).fill(testData.plate);
    await page.getByRole('textbox', { name: /Kilometerstand/ }).fill(testData.mileage);
    await page.getByRole('textbox', { name: /VIN/ }).fill(testData.vin);
    await page.waitForTimeout(2000);

    // Select "No" for at TVS
    console.log('🚗 Step 11b: Selecting not at TVS...');
    await page.getByRole('button', { name: 'Nee' }).first().click();
    await page.waitForTimeout(1000);

    // Select "No" for rental car
    console.log('🚗 Step 11c: Selecting no rental car...');
    await page.getByRole('button', { name: 'Nee' }).nth(1).click();
    await page.waitForTimeout(1000);
    console.log('✅ Vehicle info filled');

    // Step 12: Click Volgende to go to Driving Problems
    console.log('➡️ Step 12: Going to Driving Problems step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 13: Answer driving problems (No)
    console.log('🔧 Step 13: Answering driving problems - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 14: Click Volgende to go to Sounds (Bijgeluiden)
    console.log('➡️ Step 14: Going to Sounds step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 15: Answer sounds (No)
    console.log('🔊 Step 15: Answering sounds - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 16: Click Volgende to go to Vibrations
    console.log('➡️ Step 16: Going to Vibrations step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 17: Answer vibrations (No)
    console.log('📳 Step 17: Answering vibrations - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 18: Click Volgende to go to Dashboard
    console.log('➡️ Step 18: Going to Dashboard step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 19: Answer dashboard (No)
    console.log('📊 Step 19: Answering dashboard - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 20: Click Volgende to go to Confirmation
    console.log('➡️ Step 20: Going to Confirmation step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(2000);

    // Step 21: Accept terms and conditions
    console.log('📜 Step 21: Accepting terms and conditions...');
    await page.getByRole('checkbox', { name: /Akkoord/ }).check();
    await page.waitForTimeout(1000);

    // Verify confirmation button is enabled
    console.log('✅ Step 22: Verifying submission...');
    const submitButton = page.getByRole('button', { name: /Afspraak maken/ });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    // Step 23: Click submit button
    console.log('🚀 Step 23: Submitting form...');
    await submitButton.click();
    await page.waitForTimeout(3000);

    // Verify success message
    console.log('✅ Step 24: Verifying success message...');
    const successMessage = page.locator('text=Uw afspraak is succesvol gemaakt');
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    console.log('🎉 Test appointment form completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Job: ${testData.job}`);
    console.log(`   - Planning: ${testData.planning}`);
    console.log(`   - Phone: ${testData.countryCode} ${testData.phone}`);
    console.log(`   - Email: ${testData.email}`);
    console.log(`   - Name: ${testData.name}`);
    console.log(`   - Vehicle: ${testData.plate} (${testData.mileage} km)`);
    console.log(`   - VIN: ${testData.vin}`);
    console.log(`   - Driving Problems: No`);
    console.log(`   - Sounds: No`);
    console.log(`   - Vibrations: No`);
    console.log(`   - Dashboard: No`);
    console.log(`   - Date: First available date selected`);
  });
});
