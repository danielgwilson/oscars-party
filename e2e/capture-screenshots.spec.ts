import { test } from '@playwright/test';

test('capture movie trivia game screenshots', async ({ page }) => {
  // Create screenshots directory if it doesn't exist
  try {
    await page.evaluate(() => {
      const fs = require('fs');
      if (!fs.existsSync('screenshots')) {
        fs.mkdirSync('screenshots');
      }
    });
  } catch (e) {
    // Directory probably already exists or we're running in a restricted environment
  }

  // Capture homepage
  await page.goto('/');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/homepage.png', fullPage: true });
  
  // Navigate to create game page
  try {
    await page.goto('/create');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/create.png', fullPage: true });
    
    // Fill the form to see the spinner (if available)
    const hostNameField = page.getByLabel(/Your Name/i);
    if (await hostNameField.isVisible()) {
      await hostNameField.fill('Test Host');
      
      const submitButton = page.getByRole('button', { name: /Create Game/i });
      if (await submitButton.isVisible() && await submitButton.isEnabled()) {
        // Take screenshot before clicking
        await page.screenshot({ path: 'screenshots/create-filled.png', fullPage: true });
        
        // Click and quickly capture loading state
        await submitButton.click();
        await page.screenshot({ path: 'screenshots/create-loading.png' });
      }
    }
  } catch (e) {
    console.log('Create page navigation error:', e);
  }
  
  // Join page
  try {
    await page.goto('/join');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/join.png', fullPage: true });
    
    // Try to fill the form
    const codeField = page.getByLabel(/Game Code/i);
    const nameField = page.getByLabel(/Your Name/i);
    
    if (await codeField.isVisible() && await nameField.isVisible()) {
      await codeField.fill('TEST');
      await nameField.fill('Player One');
      await page.screenshot({ path: 'screenshots/join-filled.png', fullPage: true });
    }
  } catch (e) {
    console.log('Join page navigation error:', e);
  }
  
  // Debug page (to capture UI components)
  try {
    await page.goto('/debug');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/debug.png', fullPage: true });
  } catch (e) {
    console.log('Debug page not available');
  }
});