import { test, expect } from '@playwright/test';
import { getLandingPageHtml } from '../shared/ui/templates.js';
import * as fs from 'fs';
import * as path from 'path';

test('verify landing page rendering', async ({ page }) => {
  // Generate HTML
  const html = getLandingPageHtml();

  // Write to a temporary file
  const filePath = path.resolve('verification', 'landing.html');
  fs.writeFileSync(filePath, html);

  // Load file in Playwright
  await page.goto(`file://${filePath}`);

  // Assertions
  await expect(page.locator('h1')).toHaveText('🌱 HomeGarden API');
  await expect(page.locator('.badge')).toHaveText('v2.0.0 • AI-Powered');

  // Screenshot
  await page.screenshot({ path: 'verification/landing-page.png' });
});
