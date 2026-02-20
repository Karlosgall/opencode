import { test, expect } from '@playwright/test';

test.describe('TVS Engineering Test Appointment Form - Reparatie Fixed Date', () => {
  const testData = {
    job: 'Reparatie',
    planning: 'Gepland',
    date: '27-02-2026',
    phone: '3123456789',
    countryCode: '+57',
    email: 'test@example.com',
    address: 'Calle 123 # 45-67',
    postcode: '110111',
    city: 'Bogota',
    language: 'English',
    customerType: 'Particulier',
    name: 'Prueba fecha fija',
    plate: 'FEB-17-1',
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

    // Step 5: Select date - 27-02-2026
    console.log('📅 Step 5: Selecting date 27-02-2026...');
    await page.getByRole('textbox', { name: /Selecteer een datum/ }).click();
    await page.waitForTimeout(1000);
    
    // Click on 27
    await page.getByText('27').click();
    await page.waitForTimeout(1000);
    console.log('✅ Date selected: 27-02-2026');

    // Step 6: Click Volgende to go to Contact
    console.log('➡️ Step 6: Going to Contact step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 7: Fill Contact info
    console.log('📱 Step 7: Filling contact information...');
    // Phone number
    await page.getByRole('textbox', { name: /6/ }).fill(testData.phone);
    await page.waitForTimeout(500);
    
    // Email
    await page.getByRole('textbox', { name: /email@example.com/ }).fill(testData.email);
    await page.waitForTimeout(500);
    
    // Address
    const addressInputs = await page.getByRole('textbox').all();
    await addressInputs[2].fill(testData.address);
    await page.waitForTimeout(500);
    
    // Postcode
    await addressInputs[3].fill(testData.postcode);
    await page.waitForTimeout(500);
    
    // City
    await addressInputs[4].fill(testData.city);
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
    console.log(`   - Planning: ${testData.planning} (${testData.date})`);
    console.log(`   - Phone: ${testData.countryCode} ${testData.phone}`);
    console.log(`   - Email: ${testData.email}`);
    console.log(`   - Name: ${testData.name}`);
    console.log(`   - Vehicle: ${testData.plate} (${testData.mileage} km)`);
    console.log(`   - VIN: ${testData.vin}`);
    console.log(`   - Driving Problems: No`);
    console.log(`   - Sounds: No`);
    console.log(`   - Vibrations: No`);
    console.log(`   - Dashboard: No`);
  });
});
