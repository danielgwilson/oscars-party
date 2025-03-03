import { test, expect } from '@playwright/test';

test.describe('Navigation and basic functionality', () => {
  test('homepage loads', async ({ page }) => {
    await page.goto('/');
    // We'll just check that we can load the homepage without errors
    await expect(page.locator('body')).toBeVisible();
  });

  // Mark tests as skipped until we have actual UI components implemented
  test.skip('create game form works', async ({ page }) => {
    await page.goto('/');
    
    // Look for a "Create Game" or "Host Game" button/link
    const createGameButton = page.getByRole('button', { name: /create|host/i });
    await expect(createGameButton).toBeVisible();
    
    // Click the button to navigate to create game page or open modal
    await createGameButton.click();
    
    // Should have a form with name input
    const nameInput = page.getByPlaceholder(/name|username/i);
    await expect(nameInput).toBeVisible();
    
    await nameInput.fill('TestHost');
    
    // Submit the form
    const submitButton = page.getByRole('button', { name: /submit|start|create/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();
  });

  test.skip('join game form works', async ({ page }) => {
    await page.goto('/');
    
    // Look for a "Join Game" button/link
    const joinGameButton = page.getByRole('button', { name: /join/i });
    await expect(joinGameButton).toBeVisible();
    
    // Click the button to navigate to join game page or open modal
    await joinGameButton.click();
    
    // Should have inputs for game code and player name
    const codeInput = page.getByPlaceholder(/code|game code/i);
    const nameInput = page.getByPlaceholder(/name|username/i);
    
    await expect(codeInput).toBeVisible();
    await expect(nameInput).toBeVisible();
    
    await codeInput.fill('TEST');
    await nameInput.fill('TestPlayer');
  });
});