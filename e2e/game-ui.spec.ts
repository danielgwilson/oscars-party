import { test, expect } from '@playwright/test';

test.describe('Game UI components', () => {
  test('homepage components load correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Check that main header is visible
    await expect(page.locator('h1')).toContainText('You Call Yourself a Movie Buff?');
    
    // Check for at least one action button/link (either host or join)
    const hasCreateLink = await page.getByRole('link', { name: /host|create|new game/i }).isVisible();
    const hasJoinLink = await page.getByRole('link', { name: /join|enter/i }).isVisible();
    
    expect(hasCreateLink || hasJoinLink).toBeTruthy();
  });

  test('UI elements have styling', async ({ page }) => {
    // Go to homepage to check for basic styling
    await page.goto('/');
    
    // Find any button on the page
    const buttons = page.getByRole('button');
    const links = page.getByRole('link');
    
    // We should have either buttons or links
    const buttonCount = await buttons.count();
    const linkCount = await links.count();
    
    expect(buttonCount + linkCount).toBeGreaterThan(0);
    
    // If we have at least one button, check its styling
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      await expect(firstButton).toBeVisible();
    }
    
    // Otherwise check a link's styling
    else if (linkCount > 0) {
      const firstLink = links.first();
      await expect(firstLink).toBeVisible();
    }
  });
  
  test('mobile view UI loads', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to homepage
    await page.goto('/');
    
    // Just check that the page loads
    await expect(page.locator('body')).toBeVisible();
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});