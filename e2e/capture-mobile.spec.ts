import { test, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 15 Pro'],
});

test('capture mobile screenshots for movie trivia game', async ({ page }) => {
  // Create screenshots directory if it doesn't exist
  // Using try/catch since we can't use node.js fs module directly in Playwright tests
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

  // Capture homepage on mobile
  await page.goto('/');
  await page.waitForTimeout(1000); // Wait for any animations to complete
  await page.screenshot({
    path: 'screenshots/homepage-mobile.png',
    fullPage: true,
  });

  // Join page on mobile
  try {
    await page.goto('/join');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'screenshots/join-mobile.png',
      fullPage: true,
    });
  } catch (e) {
    console.log('Join page not available on mobile');
  }

  // Create page on mobile
  try {
    await page.goto('/create');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'screenshots/create-mobile.png',
      fullPage: true,
    });
  } catch (e) {
    console.log('Create page not available on mobile');
  }

  // Try the mobile game page (will likely redirect, but capture anyway)
  try {
    await page.goto('/mobile-game/TEST');
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: 'screenshots/mobile-game.png',
      fullPage: true,
    });
  } catch (e) {
    console.log('Mobile game page not available');
  }
});
