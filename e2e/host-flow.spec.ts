import { test, expect } from '@playwright/test';

test.describe('Host Game Flow', () => {
  test('should create lobby and start a game', async ({ page }) => {
    // 1. Start on the homepage
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('You Call Yourself a Movie Buff?');
    
    // 2. Navigate to create game page
    const createGameButton = page.getByRole('link', { name: /host new game/i });
    await expect(createGameButton).toBeVisible();
    await createGameButton.click();
    
    // 3. Fill in host details
    await expect(page.getByText(/Host a Movie Night Party/i)).toBeVisible();
    await page.getByLabel(/Your Name/i).fill('TestHost');
    const createButton = page.getByRole('button', { name: /Create Game/i });
    await expect(createButton).toBeEnabled();
    
    // 4. Create the game lobby
    await createButton.click();
    
    // 5. Should redirect to the lobby view and show the lobby code
    await expect(page.getByText(/Game Host Dashboard/i)).toBeVisible();
    await expect(page.getByText(/Lobby Code/i)).toBeVisible();
    
    // 6. Wait for the lobby to be fully loaded and check that we're in host view
    await expect(page.getByText(/Game Host Dashboard/i)).toBeVisible();
    
    // 7. Should see the "Generate Questions" button
    const generateButton = page.getByRole('button', { 
      name: /Generate Questions/i 
    });
    await expect(generateButton).toBeVisible();
    
    // 8. Check that the "Start Game" button is present but disabled (no questions yet)
    const startButton = page.getByRole('button', { name: /Start Game/i });
    await expect(startButton).toBeVisible();
    await expect(startButton).toBeDisabled();
    
    // Note: We don't actually click these buttons in this test as they would trigger
    // API calls to generate questions, which we'd want to mock in a more comprehensive test
  });
});