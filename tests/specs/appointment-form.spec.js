import { test, expect } from '@playwright/test';

test.describe('TVS Engineering Appointment Form', () => {
  const testData = {
    job: 'Diagnosis',
    phone: '+573001234567',
    preferredLanguage: 'Engels',
    userType: 'Individual',
    name: 'Test User',
    plate: 'ABC-123',
    mileage: '50000',
    vin: '1HGBH41JXMN109186',
    email: 'test@example.com',
    street: 'Test Street',
    houseNumber: '123',
    postcode: '12345',
    city: 'Test City'
  };

  test('Complete appointment form successfully', async ({ page }) => {
    test.setTimeout(60000);

    console.log('📅 Starting appointment form test...');

    // Step 1: Navigate to appointment page
    console.log('🌐 Step 1: Navigating to appointment page...');
    await page.goto('https://tvsengineering.com/en/appointment/', {
      waitUntil: 'networkidle',
      timeout: 45000
    });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Step 2: Select Job type
    console.log('📋 Step 2: Selecting job type...');
    await page.locator('select').first().selectOption({ label: testData.job });
    await page.waitForTimeout(1000);

    // Step 3: Fill WhatsApp number
    console.log('📱 Step 3: Filling WhatsApp number...');
    const phoneInput = page.locator('input[placeholder*="321"], input[placeholder*="123"]').first();
    await phoneInput.fill(testData.phone);
    await page.waitForTimeout(1000);

    // Step 4: Select Preferred Language
    console.log('🌍 Step 4: Selecting preferred language...');
    const languageSelect = page.locator('select').nth(1);
    await languageSelect.selectOption({ label: testData.preferredLanguage });
    await page.waitForTimeout(1000);

    // Step 5: Select user type
    console.log('👤 Step 5: Selecting user type...');
    const userTypeSelect = page.locator('select').nth(2);
    await userTypeSelect.selectOption({ label: testData.userType });
    await page.waitForTimeout(1500);

    // Handle toast with "No thanks" option
    console.log('🍞 Step 5b: Handling toast...');
    try {
      // Wait for toast to appear
      await page.waitForTimeout(1000);
      const toast = page.locator('#toast, .toast, [class*="toast"]:visible').first();
      if (await toast.isVisible({ timeout: 2000 })) {
        // Click on "No thanks" or "No" button inside the toast
        const noThanksButton = page.locator('#toast button:has-text("No"), #toast .btnNo, [class*="toast"] button:has-text("No"), [class*="toast"] .btnNo').first();
        await noThanksButton.click({ timeout: 3000 });
        console.log('✅ Toast handled with "No thanks"');
      }
    } catch (e) {
      console.log('ℹ️ No toast appeared, continuing...');
    }
    await page.waitForTimeout(1000);

    // Step 6: Fill Name
    console.log('✍️ Step 6: Filling name...');
    const nameInput = page.locator('input[name*="name"], input[placeholder*="Name"]').first();
    await nameInput.fill(testData.name);
    await page.waitForTimeout(1000);

    // Step 7: Fill Vehicle Registration Number
    console.log('🚗 Step 7: Filling vehicle registration number...');
    const plateInput = page.locator('input[name*="plate"], input[name*="license"]').first();
    await plateInput.fill(testData.plate);
    await page.waitForTimeout(1000);

    // Step 8: Fill Mileage
    console.log('📊 Step 8: Filling mileage...');
    const mileageInput = page.locator('input[name*="mileage"], input[type="number"]').first();
    await mileageInput.fill(testData.mileage);
    await page.waitForTimeout(1000);

    // Step 9: Fill VIN
    console.log('🔢 Step 9: Filling VIN...');
    const vinInput = page.locator('input[name*="vin"]').first();
    await vinInput.fill(testData.vin);
    await page.waitForTimeout(2000); // Wait for modal to appear

    // Handle the diagnosis price modal
    console.log('💰 Step 9b: Handling diagnosis price modal...');
    try {
      const modal = page.locator('text=For a comprehensive diagnosis').first();
      if (await modal.isVisible({ timeout: 3000 })) {
        // Click "No thanks" to reject the offer
        await page.getByText('No thanks').click();
        console.log('✅ Diagnosis modal handled - clicked "No thanks"');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('ℹ️ No diagnosis modal appeared, continuing...');
    }

    // Wait for new fields to appear after VIN
    await page.waitForTimeout(2000);

    // Step 10: Fill Email (appears after VIN)
    console.log('📧 Step 10: Filling email...');
    await page.locator('input[placeholder="Email.."], input[name*="email"]').first().waitFor({ state: 'visible', timeout: 5000 });
    await page.locator('input[placeholder="Email.."], input[name*="email"]').first().fill(testData.email);
    await page.waitForTimeout(1000);

    // Step 11: Fill Street
    console.log('🏠 Step 11: Filling street...');
    await page.locator('input[placeholder="Street.."], input[name*="street"]').first().fill(testData.street);
    await page.waitForTimeout(500);

    // Step 12: Fill House Number
    console.log('🔢 Step 12: Filling house number...');
    await page.locator('input[placeholder="House number.."], input[name*="house"]').first().fill(testData.houseNumber);
    await page.waitForTimeout(500);

    // Step 13: Fill Postcode
    console.log('📮 Step 13: Filling postcode...');
    await page.locator('input[placeholder="Postcode.."], input[name*="postcode"]').first().fill(testData.postcode);
    await page.waitForTimeout(500);

    // Step 14: Fill City
    console.log('🏙️ Step 14: Filling city...');
    await page.locator('input[placeholder="City.."], input[name*="city"]').first().fill(testData.city);
    await page.waitForTimeout(1000);

    // Handle any toast that appears
    try {
      const toast = page.locator('#toast:visible').first();
      if (await toast.isVisible({ timeout: 3000 })) {
        await page.locator('#toast .btnNo').first().click();
        console.log('✅ Toast handled');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // No toast, continue
    }

    // Step 15: Select "No" for "Are you at TVS now?"
    console.log('🅿️ Step 15: Selecting "No" for being at TVS...');
    await page.locator('[target-id="attvsno"]').click({ force: true });
    await page.waitForTimeout(1500);

    // Handle any toast that appears
    try {
      const toast = page.locator('#toast:visible').first();
      if (await toast.isVisible({ timeout: 2000 })) {
        await page.locator('#toast .btnNo').first().click({ force: true });
        console.log('✅ Toast handled after step 15');
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // No toast, continue
    }

    // Step 16: Accept terms and conditions
    console.log('📜 Step 16: Accepting terms and conditions...');
    await page.locator('input[name="terms[]"]').check({ force: true });
    await page.waitForTimeout(1000);

    // Step 17: Click Continue
    console.log('🚀 Step 17: Clicking Continue...');
    await page.locator('#section1').getByText('Continue').click();
    await page.waitForTimeout(2000);

    // Verify scheduling options appear
    console.log('✅ Step 18: Verifying scheduling options...');
    const schedulingHeading = page.locator('text=How would you like to schedule your car for repair?');
    await expect(schedulingHeading).toBeVisible({ timeout: 10000 });

    // Verify all three options are present
    const placeInQueue = page.locator('text=Place in queue');
    const bringImmediately = page.locator('text=Bring immediately and wait');
    const setFixedDate = page.locator('text=Set a fixed date');

    await expect(placeInQueue).toBeVisible();
    await expect(bringImmediately).toBeVisible();
    await expect(setFixedDate).toBeVisible();

    console.log('✅ Appointment form test completed successfully!');
    console.log('📊 All scheduling options are visible:');
    console.log('   - Place in queue');
    console.log('   - Bring immediately and wait');
    console.log('   - Set a fixed date');
  });
});
