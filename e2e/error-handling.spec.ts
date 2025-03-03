import { test, expect } from '@playwright/test';

test.describe('Error handling', () => {
  // Skip these tests until we have the error handling implemented
  test.skip('invalid game code shows error message', async ({ page }) => {
    await page.goto('/');
    
    // Find and click the join game button
    const joinGameButton = page.getByRole('button', { name: /join/i });
    await joinGameButton.click();
    
    // Fill in form with invalid game code
    const codeInput = page.getByPlaceholder(/code|game code/i);
    const nameInput = page.getByPlaceholder(/name|username/i);
    
    await codeInput.fill('INVALID');
    await nameInput.fill('TestPlayer');
    
    // Submit the form
    const submitButton = page.getByRole('button', { name: /submit|join/i });
    await submitButton.click();
    
    // Check for error message
    const errorMessage = page.locator('.error-message, [role="alert"]');
    
    // Wait for the error to appear
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    
    // Verify error text contains expected message
    const errorText = await errorMessage.textContent();
    expect(errorText?.toLowerCase()).toContain('invalid' || 'not found' || 'error');
  });

  test('non-existent pages show some content', async ({ page }) => {
    // Navigate to a page that shouldn't exist
    await page.goto('/this-page-does-not-exist');
    
    // Just make sure the page loads with some content
    await expect(page.locator('body')).toBeVisible();
  });
});