import { test } from '@playwright/test';

test('capture updated screenshots with spinners', async ({ page }) => {
  // Capture homepage
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/homepage-updated.png', fullPage: true });
  
  // Try to navigate to create game page
  try {
    await page.goto('/create');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/create-updated.png', fullPage: true });
    
    // Fill the form to see the spinner
    await page.fill('input[id="hostName"]', 'Test Host');
    await page.click('button[type="submit"]');
    // Quickly take a screenshot before we navigate away
    await page.screenshot({ path: 'screenshots/create-loading-updated.png' });
  } catch (e) {
    console.log('Create page not available or error occurred');
  }
  
  // Try join page
  try {
    await page.goto('/join');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/join-updated.png', fullPage: true });
  } catch (e) {
    console.log('Join page not available');
  }
});