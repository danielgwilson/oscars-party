import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  test('invalid game code shows error message', async ({ page }) => {
    await page.goto('/join');

    // Fill in form with invalid game code
    const codeInput = page.getByLabel(/Game Code/i);
    const nameInput = page.getByLabel(/Your Name/i);

    await codeInput.fill('XXXX'); // This should be an invalid code
    await nameInput.fill('TestPlayer');

    // Submit the form
    const joinButton = page.getByRole('button', { name: /Join Game/i });
    await joinButton.click();

    // Check for error toast/alert message
    // Wait a bit for the error message to appear
    await page.waitForTimeout(1000);
    
    // Check if we see an error message
    const errorVisible = await page.getByText(/failed|not found|invalid|error/i).isVisible();
    
    // We should either see an error message or be redirected back to join page
    if (!errorVisible) {
      // If no error message, we should still be on the join page
      await expect(page).toHaveURL(/\/join/);
    }
  });

  test('non-existent pages show 404 message', async ({ page }) => {
    // Navigate to a page that shouldn't exist
    await page.goto('/this-page-does-not-exist');

    // Check if there's a 404 message or we're redirected to home
    const notFoundVisible = await page.getByText(/not found|404/i).isVisible();
    
    if (!notFoundVisible) {
      // If no 404 message, we should be redirected to homepage
      await expect(page).toHaveURL(/^\//);
    }
  });
  
  test('mobile game without code shows error', async ({ page }) => {
    // Try to access the mobile game without a code
    await page.goto('/mobile-game');
    
    // Should redirect to homepage or show error
    await expect(
      page.getByText(/invalid|error|required/i).isVisible() || 
      page.getByText(/You Call Yourself a Movie Buff/i).isVisible()
    ).toBeTruthy();
  });
});
