import { test, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 13'],
});

test('capture mobile screenshots', async ({ page }) => {
  // Capture homepage on mobile
  await page.goto('/');
  await page.waitForTimeout(1000); // Wait for any animations to complete
  await page.screenshot({ path: 'screenshots/homepage-mobile.png', fullPage: true });
  
  // Try other pages on mobile
  try {
    await page.goto('/lobby');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/lobby-mobile.png', fullPage: true });
  } catch (e) {
    console.log('Lobby page not available on mobile');
  }
  
  try {
    await page.goto('/game');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'screenshots/game-mobile.png', fullPage: true });
  } catch (e) {
    console.log('Game page not available on mobile');
  }
});