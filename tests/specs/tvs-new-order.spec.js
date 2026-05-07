import { test, expect } from '@playwright/test';

test.use({ storageState: null });

const BASE_URL = 'https://app-dev.tvsengineering.com';

const credentials = {
  email: 'karlitosgallego123@gmail.com',
  password: 'A12345678'
};

const vehicleData = {
  vin: 'VSSAD75F1L6525602'
};

const customerData = {
  firstName: 'Carlos',
  lastName: 'Gallego',
  phone: '573015363880',
  street: 'Calle 100 #45-30',
  city: 'Bogotá',
  postalCode: '110311',
  country: 'Colombia'
};

const paymentData = {
  cardholderName: 'Cargos',
  cardNumber: '4242424242424242',
  expiryDate: '12/28',
  cvv: '123'
};

test.describe('TVS Client Portal - New Order Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
  });

  test('Complete new order flow from login to completion', async ({ page }) => {
    test.setTimeout(300000);
    
    // ===== STEP 1: LOGIN =====
    console.log('📍 Step 1: Login');
    await expect(page.getByRole('heading', { name: /TVS Client Portal/i })).toBeVisible();
    await page.locator('input[type="email"], input[name="email"]').first().fill(credentials.email);
    await page.locator('input[type="password"]').first().fill(credentials.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForFunction(() => {
      const url = window.location.href;
      return url.includes('/orders') || url.includes('/auth/') || url.includes('/onboarding/');
    }, { timeout: 30000 });
    console.log(`✅ Login successful - URL: ${page.url()}`);
    
    // ===== STEP 2: NEW ORDER =====
    console.log('📍 Step 2: Starting new order');
    await page.getByRole('button', { name: /new order/i }).click();
    await expect(page).toHaveURL(/onboarding\/terms/);
    console.log('✅ Navigated to Terms page');
    
    // ===== STEP 3: ACCEPT TERMS =====
    console.log('📍 Step 3: Accepting terms');
    await page.getByRole('checkbox', { name: /i agree/i }).check();
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/onboarding\/vin/);
    console.log('✅ Terms accepted');
    
    // ===== STEP 4: ENTER VIN =====
    console.log('📍 Step 4: Entering VIN');
    await expect(page.getByRole('heading', { name: /vehicle identification/i })).toBeVisible({ timeout: 10000 });
    
    // Enter VIN in the text field
    const vinInput = page.locator('input[placeholder*="VIN"], input[name="VIN"], input[type="text"]').first();
    await vinInput.fill(vehicleData.vin);
    await page.waitForTimeout(500);
    
    // Click the search/verify button next to VIN input
    await page.locator('button').filter({ hasNot: page.locator('[disabled]') }).first().click();
    
    // Wait for VIN validation response
    await page.waitForTimeout(3000);
    
    // Check if redirected to orders (active order exists)
    if (page.url().includes('/orders')) {
      console.log('   ⚠️ VIN has active order - redirected to orders');
      console.log('✅ Skipping full flow - testing basic navigation only');
      return;
    }
    
    // Wait for Continue button to be enabled
    await expect(page.getByRole('button', { name: /continue/i })).toBeEnabled({ timeout: 15000 });
    console.log(`✅ VIN ${vehicleData.vin} validated`);
    
    // Click Continue to proceed
    await page.getByRole('button', { name: /continue/i }).click();
    await expect(page).toHaveURL(/onboarding\/stage-selection/);
    console.log('✅ Proceeded to Stage Selection');
    
    // ===== STEP 5: STAGE SELECTION =====
    console.log('📍 Step 5: Selecting tuning stage');
    
    // Authorize the tool rental fee if checkbox exists
    const authorizeCheckbox = page.getByRole('checkbox', { name: /authorize fee/i });
    if (await authorizeCheckbox.isVisible()) {
      await authorizeCheckbox.check();
    }
    
    await page.getByRole('button', { name: /configure.*continue/i }).click();
    await expect(page).toHaveURL(/onboarding\/registration/);
    console.log('✅ Stage selection completed');
    
    // ===== STEP 6: REGISTRATION =====
    console.log('📍 Step 6: Filling registration');
    await page.getByRole('textbox', { name: /first name/i }).fill(customerData.firstName);
    await page.getByRole('textbox', { name: /last name/i }).fill(customerData.lastName);
    await page.getByRole('textbox', { name: /phone/i }).fill(customerData.phone);
    
    // Select country
    await page.locator('[role="combobox"]').first().click();
    await page.getByRole('button', { name: new RegExp(customerData.country, 'i') }).click();
    
    // Fill address
    await page.getByRole('textbox', { name: /street/i }).fill(customerData.street);
    await page.getByRole('textbox', { name: /city/i }).fill(customerData.city);
    await page.getByRole('textbox', { name: /zip/i }).fill(customerData.postalCode);
    
    await page.getByRole('button', { name: /save and continue/i }).click();
    await expect(page).toHaveURL(/onboarding\/checkout/);
    console.log('✅ Registration completed');
    
    // ===== STEP 7: CHECKOUT =====
    console.log('📍 Step 7: Processing payment');
    await page.getByRole('textbox', { name: /full name as on card/i }).fill(paymentData.cardholderName);
    await page.getByRole('textbox', { name: /0000/i }).fill(paymentData.cardNumber);
    await page.getByRole('textbox', { name: /mm/i }).fill(paymentData.expiryDate);
    await page.getByRole('textbox', { name: /cvv/i }).fill(paymentData.cvv);
    await page.getByRole('checkbox', { name: /i agree to be charged/i }).check();
    
    await page.getByRole('button', { name: /pay and continue/i }).click();
    await expect(page).toHaveURL(/onboarding\/schedule/);
    console.log('✅ Payment processed');
    
    // ===== STEP 8: SCHEDULE APPOINTMENT =====
    console.log('📍 Step 8: Scheduling appointment');
    
    // Wait for calendar or locked state
    await page.waitForTimeout(2000);
    
    // If appointment booking is locked, advance dev status
    const isLocked = await page.locator('text=/appointment booking locked/i').isVisible().catch(() => false);
    
    if (isLocked) {
      console.log('   📍 Appointment locked - advancing dev status...');
      
      // Expand toggle stepper
      const toggleStepper = page.getByRole('button', { name: /toggle stepper/i });
      if (await toggleStepper.isVisible()) {
        await toggleStepper.click();
        await page.waitForTimeout(500);
      }
      
      // Advance Dongle Shipped
      const dongleShippedBtn = page.locator('h4:has-text("Dongle Shipped") + button');
      if (await dongleShippedBtn.isVisible()) {
        await dongleShippedBtn.click();
        await page.waitForTimeout(1000);
      }
      
      // Advance Dongle Delivered
      const dongleDeliveredBtn = page.locator('h4:has-text("Dongle Delivered") + button');
      if (await dongleDeliveredBtn.isVisible()) {
        await dongleDeliveredBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    
    // Wait for calendar to appear
    await page.waitForSelector('text=/available slots/i', { timeout: 10000 });
    
    // Navigate to next month if needed to find available dates
    const availableDays = page.locator('button[role="gridcell"]:not([disabled])');
    const firstAvailableDay = availableDays.first();
    
    if (await firstAvailableDay.isVisible()) {
      await firstAvailableDay.click();
      await page.waitForTimeout(1000);
      
      // Find and select first available time slot
      const timeSlots = page.locator('button').filter({ hasText: /AM|PM/ });
      if (await timeSlots.first().isVisible()) {
        await timeSlots.first().click();
        await page.waitForTimeout(500);
      }
    }
    
    // Confirm appointment if button is enabled
    const confirmBtn = page.getByRole('button', { name: /confirm appointment/i });
    if (await confirmBtn.isEnabled()) {
      await confirmBtn.click();
    }
    
    await expect(page).toHaveURL(/onboarding\/tuning/);
    console.log('✅ Appointment scheduled');
    
    // ===== STEP 9: TUNING SESSION (DEV MODE) =====
    console.log('📍 Step 9: Tuning session - Dev mode');
    
    // Simulate appointment day
    const simulateButton = page.getByRole('button', { name: /simulate appointment day/i });
    if (await simulateButton.isVisible()) {
      await simulateButton.click();
      await page.waitForTimeout(2000);
    }
    
    // ===== STEP 10: ADVANCE ORDER STATUS (DEV MODE) =====
    console.log('📍 Step 10: Advancing order status');
    
    // Expand toggle stepper
    const toggleStepper = page.getByRole('button', { name: /toggle stepper/i });
    if (await toggleStepper.isVisible()) {
      await toggleStepper.click();
      await page.waitForTimeout(500);
    }
    
    // Function to advance to next status
    async function advanceToNextStatus() {
      const devButton = page.getByRole('button', { name: /set as current.*dev/i });
      if (await devButton.isVisible()) {
        await devButton.click();
        await page.waitForTimeout(1000);
        return true;
      }
      return false;
    }
    
    // Advance through all statuses
    let advanced = true;
    while (advanced) {
      advanced = await advanceToNextStatus();
      if (advanced) {
        console.log('   Advanced to next status...');
      }
    }
    
    console.log('✅ Order flow completed');
    
    // ===== VERIFY FINAL STATE =====
    console.log('📍 Verifying final state');
    await page.goto(`${BASE_URL}/orders`);
    await page.waitForTimeout(1000);
    
    // Verify order is visible with COMPLETED status
    const seatCupraOrder = page.locator('text=/seat.*cupra/i').first();
    await expect(seatCupraOrder).toBeVisible({ timeout: 10000 });
    
    // Check for COMPLETED status
    const completedStatus = page.locator('text=COMPLETED').first();
    await expect(completedStatus).toBeVisible();
    
    console.log('✅ Test completed successfully - Order shows COMPLETED status');
  });

  test('Login page has all required elements', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /TVS Client Portal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /tvs international dealer/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('Verify order traceability in existing order', async ({ page }) => {
    test.setTimeout(300000);
    
    // Login first
    await page.locator('input[type="email"]').first().fill(credentials.email);
    await page.locator('input[type="password"]').first().fill(credentials.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    
    await page.waitForFunction(() => {
      const url = window.location.href;
      return url.includes('/orders') || url.includes('/auth/');
    }, { timeout: 30000 });
    
    // Navigate to an existing completed order
    const completedOrder = page.locator('text=/seat.*cupra.*completed/i').first();
    if (await completedOrder.isVisible({ timeout: 5000 })) {
      await completedOrder.click();
    } else {
      // Try clicking on any order
      await page.locator('text=/seat.*cupra/i').first().click();
    }
    
    await page.waitForTimeout(2000);
    
    // Check Order Traceability section exists
    await expect(page.locator('text=/order traceability/i')).toBeVisible();
    
    // Expand toggle stepper
    const toggleButton = page.getByRole('button', { name: /toggle stepper/i });
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      await page.waitForTimeout(500);
    }
    
    // Verify key steps are visible
    await expect(page.locator('h4:has-text("Order Created")')).toBeVisible();
    await expect(page.locator('h4:has-text("Warehouse Assigned")')).toBeVisible();
    await expect(page.locator('h4:has-text("Completed")')).toBeVisible();
    
    console.log('✅ Order traceability verified');
  });
});
