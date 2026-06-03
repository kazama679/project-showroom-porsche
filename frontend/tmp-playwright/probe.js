const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport:{width:1920,height:1080}});
  await page.goto('http://localhost:3000/vi/configurator/test', {waitUntil:'networkidle', timeout:60000});
  await page.screenshot({path:'tmp-playwright/local-initial.png', fullPage:false});
  await browser.close();
})();
