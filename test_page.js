const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));
  await page.goto('https://cozy-sunburst-70d64c.netlify.app/#screensaver');
  await page.waitForTimeout(3000);
  await browser.close();
})();
