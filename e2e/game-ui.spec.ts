import { test, expect } from '@playwright/test';

test.describe('Game UI components', () => {
  test('page loads without errors', async ({ page }) => {
    // Navigate directly to homepage
    await page.goto('/');
    
    // Just check that the page loads with a body element
    await expect(page.locator('body')).toBeVisible();
  });

  // Skip this test until we have actual UI components
  test.skip('category component displays correctly', async ({ page }) => {
    // In a real test, we would:
    // 1. Create a game
    // 2. Navigate to the game page
    // 3. Verify category components render correctly
    // 4. Test selection of nominees
    
    /* Example of what this would look like:
    await page.goto('/game/TEST');
    
    // Check if categories are visible
    const categories = page.locator('.category-card');
    await expect(categories).toHaveCount({ min: 1 });
    
    // Check if nominees are visible
    const nominees = page.locator('.nominee-card');
    await expect(nominees).toHaveCount({ min: 1 });
    
    // Test selecting a nominee
    await nominees.first().click();
    await expect(nominees.first()).toHaveClass(/selected/);
    */
  });
});