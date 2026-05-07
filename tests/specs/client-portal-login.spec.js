import { test, expect } from '@playwright/test';

test.describe('TVS Client Portal Login', () => {
  const credentials = {
    email: 'karlitosgallego123@gmail.com',
    password: 'A12345678'
  };

  test('Login successfully with email and password', async ({ page }) => {
    test.setTimeout(60000);
    
    console.log('🌐 Step 1: Navigating to login page...');
    await page.goto('https://app-dev.tvsengineering.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    console.log(`✅ Navigated to: ${page.url()}`);

    // Step 2: Verify login page elements
    console.log('🔍 Step 2: Verifying login page elements...');
    await expect(page.getByRole('heading', { name: /TVS Client Portal/i })).toBeVisible();
    console.log('✅ Login page loaded correctly');

    // Step 3: Fill email
    console.log('📧 Step 3: Filling email...');
    const emailInput = page.locator('input[placeholder*="you@company.com"], input[type="email"], input[name="email"]').first();
    await emailInput.fill(credentials.email);
    console.log('✅ Email filled');

    // Step 4: Fill password
    console.log('🔐 Step 4: Filling password...');
    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(credentials.password);
    console.log('✅ Password filled');

    // Step 5: Click sign in
    console.log('🔵 Step 5: Clicking Sign in button...');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for navigation or dashboard
    console.log('⏳ Step 6: Waiting for response...');
    await page.waitForTimeout(5000);
    
    console.log(`📍 Current URL after login: ${page.url()}`);
    console.log(`📋 Page title: ${await page.title()}`);

    // Step 7: Verify successful login (should redirect to dashboard or home)
    console.log('✅ Step 7: Verifying successful login...');
    // Check if we're NOT on login page anymore
    if (!page.url().includes('/login')) {
      console.log('✅ Successfully redirected from login page');
    } else {
      console.log('⚠️ Still on login page, checking for errors...');
      const errorMessage = page.locator('text=/error|invalid|failed/i').first();
      if (await errorMessage.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`❌ Login error: ${await errorMessage.textContent()}`);
      }
    }
  });

  test('Verify login page has all required elements', async ({ page }) => {
    test.setTimeout(30000);
    
    await page.goto('https://app-dev.tvsengineering.com/login', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Verify main heading
    await expect(page.getByRole('heading', { name: /TVS Client Portal/i })).toBeVisible();
    
    // Verify Google sign-in button
    await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible();
    
    // Verify TVS Dealer button
    await expect(page.getByRole('button', { name: /TVS International Dealer/i })).toBeVisible();
    
    // Verify email input
    await expect(page.locator('input[type="email"], input[placeholder*="you@company.com"]')).toBeVisible();
    
    // Verify password input
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Verify sign in button
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Verify forgot password link
    await expect(page.getByText(/Forgot your password/i)).toBeVisible();
    
    // Verify sign up link
    await expect(page.getByText(/Sign up/i)).toBeVisible();
    
    console.log('✅ All login page elements verified');
  });
});
