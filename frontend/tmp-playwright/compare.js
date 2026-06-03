const { chromium } = require('playwright');
const fs = require('fs');
const out='tmp-playwright';
fs.mkdirSync(out,{recursive:true});
async function shot(page,name){ await page.screenshot({path:`${out}/${name}.png`, fullPage:false}); }
async function textDump(page,name){ const txt=await page.locator('body').innerText({timeout:10000}).catch(e=>String(e)); fs.writeFileSync(`${out}/${name}.txt`, txt); }
(async()=>{
 const browser=await chromium.launch({headless:true});
 const ctx=await browser.newContext({viewport:{width:1920,height:1080}, deviceScaleFactor:1});
 const local=await ctx.newPage();
 await local.goto('http://localhost:3000/vi/configurator/test',{waitUntil:'networkidle',timeout:60000});
 await shot(local,'local-initial'); await textDump(local,'local-initial');
 await local.getByText('Wheels').first().scrollIntoViewIfNeeded().catch(()=>{});
 await local.waitForTimeout(500); await shot(local,'local-wheels-scroll');
 const wheelButtons=await local.locator('button[title*="Wheel"], button:has-text("Wheels")').count();
 fs.writeFileSync(`${out}/local-counts.txt`, `wheel-ish buttons ${wheelButtons}\n`);
 await local.locator('button[title*="Carrera S Wheels"]').first().click({timeout:10000}).catch(async e=>{fs.appendFileSync(`${out}/local-counts.txt`, `click wheel failed ${e}\n`)});
 await local.waitForTimeout(800); await shot(local,'local-wheel-click'); await textDump(local,'local-wheel-click');
 await local.getByText('Summary').first().click().catch(()=>{}); await local.waitForTimeout(600); await shot(local,'local-summary');

 const real=await ctx.newPage();
 await real.goto('https://configurator.porsche.com/en-US/mode/model/9921B2',{waitUntil:'domcontentloaded',timeout:90000});
 await real.waitForTimeout(7000);
 await shot(real,'real-initial'); await textDump(real,'real-initial');
 await real.getByText('Wheels', {exact:false}).first().scrollIntoViewIfNeeded().catch(()=>{});
 await real.waitForTimeout(1000); await shot(real,'real-wheels-scroll'); await textDump(real,'real-wheels-scroll');
 await real.locator('text=/Carrera S Wheels|Turbo S Design Wheels|RS Spyder/i').first().click({timeout:15000}).catch(e=>fs.writeFileSync(`${out}/real-click-error.txt`, String(e)));
 await real.waitForTimeout(1500); await shot(real,'real-wheel-click'); await textDump(real,'real-wheel-click');
 await browser.close();
})();
