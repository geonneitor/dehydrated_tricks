/**
 * Sonda de diagnóstico (sólo lectura, no afirma nada): imprime evidencia para la revisión.
 * Cubre consistencia tarjeta→calculadora, recorrido de Tab, coste de composición,
 * estado sin JavaScript, texto indexable y contraste de botones.
 *
 * Uso:  npx astro preview --port 4321   (o npm run dev, calentado)
 *       node tests/diagnostico.cjs
 */
const { chromium } = require('playwright');
const URL = process.env.URL || 'http://127.0.0.1:4321';

(async () => {
  const browser = await chromium.launch();

  // ── 1. Producto obsoleto: abro "Orejas" y pido la porción ──
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(URL, { waitUntil: 'load' });

  // elijo charales en la sección para "ensuciar" el estado
  await page.selectOption('select[name="calc_product"]', 'charales');
  await page.click('input[name="pet_type"][value="dog"]', { force: true });
  await page.selectOption('select[name="pet_age"]', 'adult');
  await page.selectOption('select[name="pet_sick"]', 'no');
  await page.waitForTimeout(200);

  // ahora abro la tarjeta 3 (Orejas): el panel trae su calculadora montada por defecto
  await page.evaluate(() => document.getElementById('productos').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.locator('.product-card-btn').nth(2).click();
  await page.waitForTimeout(500);
  const modalProduct = await page.evaluate(() => document.getElementById('spec-img').alt);
  const consistency = await page.evaluate(() => {
    const sel = document.querySelector('select[name="calc_product"]');
    const active = document.activeElement;
    return {
      openProduct: document.getElementById('spec-img').alt,
      calcProduct: sel.value,
      calcProductLabel: sel.options[sel.selectedIndex]?.textContent,
      portion: document.querySelector('.yellow-pill__value').textContent.replace(/\s+/g, ' ').trim(),
      activeElement: active ? `${active.tagName}${active.id ? '#' + active.id : ''}` : 'ninguno',
      dialogName: document.getElementById('nutrition-modal').getAttribute('aria-labelledby'),
      dialogHeading: document.getElementById('nutrition-modal-title')?.textContent,
    };
  });
  console.log('1) CONSISTENCIA TARJETA → CALCULADORA');
  console.log('   tarjeta abierta :', modalProduct);
  console.log('   calculadora dice:', consistency.calcProductLabel, '| porción:', consistency.portion);
  console.log('   foco tras cambiar de vista:', consistency.activeElement);
  console.log('   nombre accesible del diálogo:', consistency.dialogName, '→', JSON.stringify(consistency.dialogHeading));

  // ── 2. Claves de teclado y trampa de foco ──
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.locator('.product-card-btn').first().click();
  await page.waitForTimeout(400);
  const tabbables = [];
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    tabbables.push(await page.evaluate(() => {
      const a = document.activeElement;
      const inDialog = !!a?.closest('#nutrition-modal');
      return `${a?.tagName}${a?.id ? '#' + a.id : ''}${a?.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : ''}${inDialog ? '' : ' ⚠️FUERA'}`;
    }));
  }
  console.log('2) RECORRIDO DE TAB CON EL MODAL ABIERTO');
  console.log('  ', tabbables.join(' → '));

  // ── 3. Cierre con clic en el fondo y segunda tarjeta ──
  await page.mouse.click(20, 450);
  await page.waitForTimeout(400);
  const afterBackdrop = await page.evaluate(() => ({
    open: document.getElementById('nutrition-modal').open,
    home: !!document.getElementById('calculator-host').closest('#calculadora'),
  }));
  await page.locator('.product-card-btn').nth(4).click();
  await page.waitForTimeout(400);
  const second = await page.evaluate(() => {
    const ficha = Array.from(document.querySelectorAll('[data-detail]')).find((b) => !b.hidden);
    const link = ficha?.querySelector('.modal-summary__options a');
    return {
      alt: document.getElementById('spec-img').alt,
      wa: decodeURIComponent(link?.getAttribute('href') || '').slice(-40),
      open: document.getElementById('nutrition-modal').open,
      calcInPanel: !!document.getElementById('calculator-host').closest('#calc-mount-point'),
      noDock: document.querySelectorAll('.app-modal-dock, #btn-show-calc, #btn-order').length === 0,
      noScroll: Array.from(document.querySelectorAll('.modal-panel')).every((p) => p.scrollHeight <= p.clientHeight + 1),
    };
  });
  console.log('3) CLIC EN EL FONDO cierra:', !afterBackdrop.open, '| calculadora en casa:', afterBackdrop.home);
  console.log('   segunda tarjeta:', second.alt, '|', second.wa);
  console.log('   calculadora en el panel:', second.calcInPanel, '| sin dock:', second.noDock, '| sin scroll:', second.noScroll);
  await page.keyboard.press('Escape');

  // ── 4. Coste de pintado/composición (lo que el plan no mide) ──
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  const runtime = await page.evaluate(() => new Promise((resolve) => {
    const inf = document.getAnimations().filter((a) => a.effect?.getTiming?.().iterations === Infinity || a.playState === 'running');
    const long = [];
    let frames = 0;
    const t0 = performance.now();
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (entry.duration > 50) long.push(Math.round(entry.duration));
    });
    observer.observe({ entryTypes: ['longtask'] });
    const tick = () => {
      frames++;
      if (performance.now() - t0 < 2000) requestAnimationFrame(tick);
      else {
        observer.disconnect();
        resolve({
          animations: document.getAnimations().length,
          infinite: inf.filter((a) => a.effect?.getTiming?.().iterations === Infinity).length,
          fps: Math.round((frames / (performance.now() - t0)) * 1000),
          longTasks: long,
          blobs: document.querySelectorAll('.blob').length,
        });
      }
    };
    requestAnimationFrame(tick);
  }));
  console.log('4) COSTE EN EJECUCIÓN (viewport 1440×900, 2s en reposo)');
  console.log('   animaciones activas:', runtime.animations, '| infinitas:', runtime.infinite, '| FPS:', runtime.fps, '| tareas largas:', runtime.longTasks.length, '| blobs blur(70px):', runtime.blobs);

  // ── 5. Sin JavaScript ──
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const noJsPage = await noJs.newPage({ viewport: { width: 1440, height: 900 } });
  await noJsPage.goto(URL, { waitUntil: 'load' });
  const noJsState = await noJsPage.evaluate(() => ({
    calcPill: document.querySelector('.yellow-pill__value')?.textContent.trim(),
    calcVisible: document.querySelector('.package-calc')?.offsetHeight > 0,
    cards: document.querySelectorAll('.product-card-btn').length,
    productText: Array.from(document.querySelectorAll('.product-card__body')).map((b) => b.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
    waFooter: !!document.querySelector('.fab-whatsapp'),
  }));
  console.log('5) SIN JAVASCRIPT');
  console.log('   calculadora visible:', noJsState.calcVisible, '| resultado:', JSON.stringify(noJsState.calcPill));
  console.log('   tarjetas clicables pero mudas:', noJsState.cards, '| texto indexable en tarjetas:', JSON.stringify(noJsState.productText));

  // ── 6. Contraste de los elementos nuevos (con el modal abierto, donde aplica) ──
  await page.locator('.product-card-btn').first().click();
  await page.waitForTimeout(400);
  const buttons = await page.evaluate(() => {
    const parse = (v) => (v.match(/[\d.]+/g) || []).map(Number);
    const bg = (el) => {
      let n = el;
      while (n) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) return c.slice(0, 3);
        n = n.parentElement;
      }
      return [20, 10, 13];
    };
    return ['.btn--primary', '.btn--glass', '.modal-topbar__title', '.spec-zoom__hint', '.product-card__name', '.modal-summary__ingredients'].map((sel) => {
      const el = document.querySelector(sel);
      if (!el) return { sel, fg: [0, 0, 0], bg: [0, 0, 0] };
      return { sel, fg: parse(getComputedStyle(el).color), bg: bg(el) };
    });
  });
  const lum = ([r, g, b]) => {
    const f = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  console.log('6) CONTRASTE DE ELEMENTOS NUEVOS (modal abierto)');
  for (const b of buttons) {
    const [l1, l2] = [lum(b.fg), lum(b.bg)].sort((x, y) => y - x);
    console.log(`   ${b.sel}: ${(((l1 + 0.05) / (l2 + 0.05))).toFixed(2)}:1`);
  }

  console.log('\nErrores JS:', errors.length, errors.slice(0, 3).join(' | '));
  await browser.close();
})();
