import { test, expect } from '@playwright/test';

test.describe('TVS Engineering Test Appointment Form - Vaste Datum', () => {
  const testData = {
    job: 'Diagnose',
    planning: 'Vaste datum',
    phone: '3012345678',
    email: 'test@example.com',
    address: 'Test Street 123',
    postcode: '12345',
    city: 'Test City',
    language: 'English',
    customerType: 'Particulier',
    name: 'Test User',
    plate: 'ABC-123',
    mileage: '50000',
    vin: '1HGBH41JXMN109186',
    atTvs: false,
    drivable: true,
    rentalCar: false,
    drivingProblems: false,
    hasSounds: true,
    soundOptions: [1, 3, 4],
    vibrations: false,
    dashboard: false
  };

  test('Complete test appointment form with fixed date', async ({ page }) => {
    test.setTimeout(90000);

    console.log('📅 Starting test appointment form (Vaste Datum)...');

    // Step 1: Navigate to page
    console.log('🌐 Step 1: Navigating to test appointment page...');
    await page.goto('https://tvsengineering.com/en/test-appointment/', {
      waitUntil: 'networkidle',
      timeout: 45000
    });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Step 2: Select Job type (Opdracht)
    console.log('📋 Step 2: Selecting job type - Diagnose...');
    await page.locator('select').first().selectOption({ label: testData.job });
    await page.waitForTimeout(1500);

    // Handle modal: "Ik begrijp het"
    console.log('📋 Step 2b: Handling modal...');
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

    // Step 4: Select Planning option - Vaste datum (Fixed date)
    console.log('📅 Step 4: Selecting planning option - Vaste datum...');
    await page.getByRole('button', { name: /Gepland/ }).click();
    await page.waitForTimeout(2000);

    // Step 4b: Select an available date from the calendar
    console.log('📅 Step 4b: Selecting available date from calendar...');
    try {
      // Click on date textbox to open calendar if not already open
      const dateInput = page.getByRole('textbox', { name: /Selecteer een datum/ });
      await dateInput.click({ force: true });
      await page.waitForTimeout(1500);
      
      // Click on a day with cursor=pointer (available days like 23, 24, 25, 26, 27)
      const availableDay = page.locator('text="23"').first();
      if (await availableDay.isVisible({ timeout: 3000 })) {
        await availableDay.click({ force: true });
        await page.waitForTimeout(1500);
        console.log('✅ Date 23 selected from calendar');
      }
    } catch (e) {
      console.log('⚠️ Calendar selection may have failed, continuing...');
    }

    // Handle modal: "Doorgaan" if appears
    console.log('📅 Step 4c: Handling any modal...');
    try {
      const doorgaan = page.locator('text=Doorgaan').first();
      if (await doorgaan.isVisible({ timeout: 3000 })) {
        await doorgaan.click();
        console.log('✅ Modal handled - clicked "Doorgaan"');
      }
    } catch (e) {}
    await page.waitForTimeout(1000);

    // Step 5: Click Volgende to go to Contact
    console.log('➡️ Step 5: Going to Contact step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 6: Fill Contact info
    console.log('📱 Step 6: Filling contact information...');
    await page.locator('input[type="tel"], input[placeholder*="6"]').first().fill(testData.phone);
    await page.waitForTimeout(500);
    
    console.log('📱 Step 6b: Validating phone number...');
    try {
      const checkBtn = page.locator('button:has-text("Controleren")');
      if (await checkBtn.isVisible({ timeout: 2000 })) {
        await checkBtn.click();
        await page.waitForTimeout(2000);
        console.log('✅ Phone validated - fields auto-filled');
      }
    } catch (e) {}

    await page.waitForTimeout(1000);
    console.log('✅ Contact info auto-filled');

    // Step 7: Click Volgende to go to Preferences
    console.log('➡️ Step 7: Going to Preferences step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 8: Fill Preferences
    console.log('⚙️ Step 8: Filling preferences...');
    await page.getByLabel('Klanttype').selectOption(testData.customerType);
    await page.waitForTimeout(1000);

    const nameField = page.getByRole('textbox', { name: /Naam/ });
    const nameValue = await nameField.inputValue();
    if (!nameValue || nameValue === '') {
      await nameField.fill(testData.name);
    }
    await page.waitForTimeout(1000);

    // Handle modal: "Nee bedankt" (remote diagnosis)
    console.log('⚙️ Step 8b: Handling remote diagnosis modal...');
    try {
      const neeBedankt = page.locator('text=Nee bedankt').first();
      if (await neeBedankt.isVisible({ timeout: 3000 })) {
        await neeBedankt.click();
        console.log('✅ Remote diagnosis modal handled - clicked "Nee bedankt"');
      }
    } catch (e) {}
    await page.waitForTimeout(1000);

    // Step 9: Click Volgende to go to Vehicle
    console.log('➡️ Step 9: Going to Vehicle step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 10: Fill Vehicle info
    console.log('🚗 Step 10: Filling vehicle information...');
    await page.getByRole('textbox', { name: /Kenteken/ }).fill(testData.plate);
    await page.getByRole('textbox', { name: /Kilometerstand/ }).fill(testData.mileage);
    await page.getByRole('textbox', { name: /VIN/ }).fill(testData.vin);
    await page.waitForTimeout(2000);

    console.log('🚗 Step 10b: Selecting not at TVS...');
    await page.getByRole('button', { name: 'Nee' }).first().click();
    await page.waitForTimeout(1000);

    console.log('🚗 Step 10c: Selecting no rental car...');
    await page.getByRole('button', { name: 'Nee' }).nth(1).click();
    await page.waitForTimeout(1000);

    // Step 11: Click Volgende to go to Driving Problems
    console.log('➡️ Step 11: Going to Driving Problems step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 12: Answer driving problems (No)
    console.log('🔧 Step 12: Answering driving problems - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 13: Click Volgende to go to Sounds (Bijgeluiden)
    console.log('➡️ Step 13: Going to Sounds step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 14: Answer sounds - select Ja
    console.log('🔊 Step 14: Answering sounds - Ja...');
    await page.getByRole('button', { name: 'Ja' }).click();
    await page.waitForTimeout(1500);

    // Select sound options: 1, 3, 4
    console.log('🔊 Step 14b: Selecting sound options: 1, 3, 4...');
    await page.getByRole('button', { name: /Ratelende/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /terugschakelen/ }).click();
    await page.waitForTimeout(500);
    await page.getByRole('button', { name: /afremmen/ }).click();
    await page.waitForTimeout(500);
    console.log('✅ Sound options selected');

    // Step 15: Click Volgende to go to Vibrations
    console.log('➡️ Step 15: Going to Vibrations step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 16: Answer vibrations (No)
    console.log('📳 Step 16: Answering vibrations - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 17: Click Volgende to go to Dashboard
    console.log('➡️ Step 17: Going to Dashboard step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(1500);

    // Step 18: Answer dashboard (No)
    console.log('📊 Step 18: Answering dashboard - Nee...');
    await page.getByRole('button', { name: 'Nee' }).click();
    await page.waitForTimeout(1000);

    // Step 19: Click Volgende to go to Confirmation
    console.log('➡️ Step 19: Going to Confirmation step...');
    await page.getByRole('button', { name: 'Volgende' }).click();
    await page.waitForTimeout(2000);

    // Step 20: Accept terms and submit
    console.log('📜 Step 20: Accepting terms and conditions...');
    await page.getByRole('checkbox', { name: /Akkoord/ }).check();
    await page.waitForTimeout(1000);

    // Verify confirmation button is enabled
    console.log('✅ Step 21: Verifying submission...');
    const submitButton = page.getByRole('button', { name: /Afspraak maken/ });
    await expect(submitButton).toBeEnabled({ timeout: 10000 });

    // Step 22: Click submit button
    console.log('🚀 Step 22: Submitting form...');
    await submitButton.click();
    await page.waitForTimeout(3000);

    // Verify success message
    console.log('✅ Step 23: Verifying success message...');
    const successMessage = page.locator('text=Uw afspraak is succesvol gemaakt');
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    console.log('🎉 Test appointment form (Vaste Datum) completed successfully!');
    console.log('📋 Summary:');
    console.log(`   - Job: ${testData.job}`);
    console.log(`   - Planning: ${testData.planning} (Fixed date)`);
    console.log(`   - Phone: ${testData.phone}`);
    console.log(`   - Email: ${testData.email}`);
    console.log(`   - Vehicle: ${testData.plate} (${testData.mileage} km)`);
    console.log(`   - Sound issues: Yes (3 options selected)`);
    console.log(`   - Vibration issues: No`);
    console.log(`   - Dashboard issues: No`);
  });
});
