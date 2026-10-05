const { chromium } = require('playwright');
const path = require('path');

const OUT = '/home/geonneitor55/.gemini/antigravity-ide/brain/1893e88b-be09-4ab8-b225-210904e5eb39/scratch';
const URL = 'http://localhost:4321';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });

  // 1. Screenshot of calculator section
  await page.evaluate(() => {
    document.querySelector('#calculadora')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT, 'calc-initial.png') });
  console.log('✅ calc-initial.png');

  // 2. Select "Perro"
  await page.click('input[name="pet_type"][value="dog"]', { force: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'calc-perro.png') });
  console.log('✅ calc-perro.png');

  // 3. Select adult + healthy
  await page.click('input[name="pet_age"][value="adult"]', { force: true });
  await page.click('input[name="pet_sick"][value="no"]', { force: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'calc-step2.png') });
  console.log('✅ calc-step2.png');

  // 4. Select a product
  await page.click('input[name="calc_product"][value="charales"]', { force: true });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, 'calc-result.png') });
  console.log('✅ calc-result.png');

  // 5. Open product modal
  await page.evaluate(() => {
    document.querySelector('#productos')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);
  const firstCard = page.locator('.product-card-btn').first();
  await firstCard.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, 'modal-open.png') });
  console.log('✅ modal-open.png');

  await browser.close();
  console.log('Done!');
})();
