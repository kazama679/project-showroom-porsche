const { chromium } = require('playwright');
const fs = require('fs');
const out='tmp-playwright';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 await page.goto('https://configurator.porsche.com/en-US/mode/model/9921B2',{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForTimeout(5000);
 await page.getByText('Accept All').click({timeout:10000}).catch(()=>{});
 await page.waitForTimeout(2000);
 await page.getByText('Wheels', {exact:false}).first().scrollIntoViewIfNeeded().catch(()=>{});
 await page.waitForTimeout(1000);
 await page.screenshot({path:`${out}/real-wheels-accepted.png`, fullPage:false});
 await page.locator('text=/Carrera S Wheels|Turbo S Design Wheels|RS Spyder/i').first().click({timeout:15000}).catch(e=>fs.writeFileSync(`${out}/real-click-error2.txt`, String(e)));
 await page.waitForTimeout(1500);
 await page.screenshot({path:`${out}/real-wheel-click-accepted.png`, fullPage:false});
 fs.writeFileSync(`${out}/real-accepted-text.txt`, await page.locator('body').innerText().catch(e=>String(e)));
 await browser.close();
})();
