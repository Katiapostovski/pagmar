const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('CONSOLE:', msg.text()));
    page.on('pageerror', error => console.log('ERROR:', error.message));
    page.on('requestfailed', request => console.log('FAILED:', request.url(), request.failure().errorText));
    await page.goto('https://cozy-sunburst-70d64c.netlify.app/', {waitUntil: 'networkidle0'});
    await browser.close();
})();
