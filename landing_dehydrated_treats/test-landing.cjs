const { chromium } = require('playwright');

const OUT_DIR = '/home/geonneitor55/.gemini/antigravity-ide/brain/1893e88b-be09-4ab8-b225-210904e5eb39/scratch';
const URL = 'http://localhost:4321';

async function runTests() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Loading page...");
  let jsErrors = [];
  page.on('pageerror', err => jsErrors.push(err));

  await page.goto(URL);

  // Responsive Screenshots
  const viewports = [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize(vp);
    await page.waitForTimeout(500); // Wait for relayout
    await page.screenshot({ path: `${OUT_DIR}/screenshot-${vp.width}.png`, fullPage: true });
    console.log(`Saved screenshot-${vp.width}.png`);
  }

  // Restore desktop size
  await page.setViewportSize({ width: 1440, height: 900 });

  // 1. Hero Test (rAF counting)
  console.log("Testing Hero...");
  const frames = await page.evaluate(() => {
    return new Promise((resolve) => {
      let count = 0;
      let start = performance.now();
      function tick() {
        count++;
        if (performance.now() - start < 1000) {
          requestAnimationFrame(tick);
        } else {
          resolve(count);
        }
      }
      requestAnimationFrame(tick);
    });
  });
  console.log(`Measured ~${frames} frames per second baseline.`);
  
  await page.evaluate(() => {
    window.frameCount = 0;
    window.lastTime = performance.now();
    const originalRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = function(cb) {
      window.frameCount++;
      window.lastTime = performance.now();
      return originalRaf(cb);
    };
  });

  // Hover over mascot
  const mascot = page.locator('.tilt-mascot').first(); // Adjust selector based on DOM
  if (await mascot.count() > 0) {
    await mascot.hover();
    await page.waitForTimeout(1000);
    // Unhover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(4000);

    const timeSinceLastFrame = await page.evaluate(() => performance.now() - window.lastTime);
    console.log(`Time since last rAF: ${timeSinceLastFrame}ms`);
    if (timeSinceLastFrame < 100) {
      console.error("❌ rAF is still running in the background! CPU not resting.");
    } else {
      console.log("✅ CPU resting (rAF stopped).");
    }
  } else {
    console.log("Could not find mascot element to test hover.");
  }

  // 2. Calculadora
  console.log("Testing Calculator...");
  // Test Gato -> disables Orejas
  await page.click('input[name="pet_type"][value="cat"]', { force: true });
  await page.waitForTimeout(300);
  const orejasDisabled = await page.evaluate(() => {
    const el = document.querySelector('input[name="calc_product"][value="orejas"]');
    return el ? el.disabled : null;
  });
  console.log(`Gato disables Orejas: ${orejasDisabled ? '✅' : '❌'}`);

  const orejasNoteHidden = await page.evaluate(() => {
    const el = document.querySelector('[data-orejas-note]');
    return el ? el.hidden : null;
  });
  console.log(`Orejas note shown for Gato: ${orejasNoteHidden === false ? '✅' : '❌'}`);

  // Test restricted state
  await page.click('input[name="pet_type"][value="dog"]', { force: true });
  await page.click('input[name="pet_age"][value="puppy"]', { force: true });
  await page.click('input[name="pet_sick"][value="no"]', { force: true });
  await page.waitForTimeout(300);
  const isRestricted = await page.evaluate(() => {
    return document.querySelector('.calc-ticket')?.getAttribute('data-state') === 'restricted';
  });
  console.log(`Puppy shows restricted state: ${isRestricted ? '✅' : '❌'}`);

  // Test valid flow
  await page.click('input[name="pet_age"][value="adult"]', { force: true });
  await page.click('input[name="calc_product"][value="higados"]', { force: true });
  await page.waitForTimeout(300);
  const waHref = await page.evaluate(() => {
    const cta = document.querySelector('[data-calc-cta]');
    return cta ? cta.href : '';
  });
  console.log(`WhatsApp Link Generated: ${waHref.includes('wa.me') ? '✅' : '❌'} (${waHref})`);

  console.log(`JS Errors on page: ${jsErrors.length}`);

  await browser.close();
}

runTests().catch(console.error);
