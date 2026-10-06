/**
 * Verificación P0 — segunda pasada: anclajes, teclado, movimiento reducido, móvil
 * y medición del contraste ANTES/DESPUÉS del riel del toggles.
 *
 * Uso:  node tests/p0-extra.cjs   (con el servidor de Astro corriendo en 4321)
 */
const { chromium } = require('playwright');

const URL = process.env.URL || 'http://127.0.0.1:4321';
const results = [];
const ok = (name, pass, extra = '') => {
  results.push({ name, pass });
  console.log(`${pass ? '✅' : '❌'} ${name}${extra ? ` — ${extra}` : ''}`);
};

const NAV_OFFSET = 88; // scroll-margin-top de las secciones

async function anchorLands(page, linkSelector, targetId, label, expectedTop = NAV_OFFSET, startScroll = 0) {
  await page.evaluate((y) => window.scrollTo(0, y), startScroll);
  await page.waitForTimeout(700);
  await page.click(linkSelector);
  await page.waitForTimeout(1600);
  const top = await page.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top), targetId);
  ok(label, Math.abs(top - expectedTop) <= 10, `top=${top}px (esperado ≈${expectedTop}px)`);
}

(async () => {
  const browser = await chromium.launch();

  // ── A. Anclajes con scroll suave (Lenis) ──
  console.log('\n── A. Anclajes con Lenis ──');
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(URL, { waitUntil: 'load' });
  await anchorLands(page, 'a[href="#productos"]', 'productos', 'Ancla #productos (navbar)');
  await anchorLands(page, 'a[href="#calculadora"]', 'calculadora', 'Ancla #calculadora (Hero)');
  // #inicio es la primera sección (y el logo vive en el navbar fijo): vuelve hasta arriba, top 0.
  await anchorLands(page, 'a[href="#inicio"]', 'inicio', 'Ancla #inicio (logo) vuelve arriba', 0, 1000);

  // ── B. Modal operable sólo con teclado ──
  console.log('\n── B. Teclado ──');
  await page.evaluate(() => document.getElementById('productos').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.locator('.product-card-btn').first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(500);
  ok('Enter en la tarjeta abre el panel', await page.evaluate(() => document.getElementById('nutrition-modal').open));

  const keyboard = await page.evaluate(() => ({
    calcInPanel: !!document.getElementById('calculator-host').closest('#calc-mount-point'),
    focusInCalc: !!document.activeElement?.closest('#calculator-host'),
    focusInDialog: !!document.activeElement?.closest('#nutrition-modal'),
    dockGone: document.querySelectorAll('.app-modal-dock, #btn-show-calc, #btn-show-spec, #btn-order').length === 0,
    tabsHiddenDesktop: getComputedStyle(document.querySelector('.modal-tabs')).display === 'none',
  }));
  ok('La calculadora ya está dentro del panel (sin botón intermedio)', keyboard.calcInPanel);
  ok('El foco cae dentro de la calculadora al abrir con teclado',
    keyboard.focusInCalc && keyboard.focusInDialog, `foco=${await page.evaluate(() => document.activeElement?.tagName)}`);
  ok('En escritorio no hay dock ni pestañas visibles', keyboard.dockGone && keyboard.tabsHiddenDesktop);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // ── C. Contraste ANTES/DESPUÉS del riel del toggles ──
  console.log('\n── C. Contraste del toggles (riel oscuro anterior vs riel claro) ──');
  const toggleContrast = await page.evaluate(() => {
    const parse = (v) => (v.match(/[\d.]+/g) || []).map(Number);
    const relLum = ([r, g, b]) => {
      const f = (c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a, b) => {
      const [l1, l2] = [relLum(a), relLum(b)].sort((x, y) => y - x);
      return (l1 + 0.05) / (l2 + 0.05);
    };
    const group = document.querySelector('.toggle-group');
    const span = document.querySelector('.toggle-btn:last-of-type span'); // opción NO seleccionada
    const fg = parse(getComputedStyle(span).color);
    const after = ratio(fg, parse(getComputedStyle(group).backgroundColor));
    group.style.background = 'var(--white)'; // riel oscuro anterior
    const before = ratio(fg, parse(getComputedStyle(group).backgroundColor));
    group.style.background = '';
    return { before, after };
  });
  ok('El riel oscuro anterior fallaba AA y el nuevo pasa',
    toggleContrast.before < 4.5 && toggleContrast.after >= 4.5,
    `antes ${toggleContrast.before.toFixed(2)}:1 → ahora ${toggleContrast.after.toFixed(2)}:1`);

  // ── D. Movimiento reducido ──
  console.log('\n── D. Movimiento reducido ──');
  const reduced = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await reduced.emulateMedia({ reducedMotion: 'reduce' });
  await reduced.goto(URL, { waitUntil: 'load' });
  await reduced.click('a[href="#calculadora"]');
  await reduced.waitForTimeout(600);
  const reducedTop = await reduced.evaluate(() => Math.round(document.getElementById('calculadora').getBoundingClientRect().top));
  ok('Sin Lenis, el ancla sigue llegando a la calculadora', Math.abs(reducedTop - NAV_OFFSET) <= 10, `top=${reducedTop}px`);

  await reduced.evaluate(() => document.getElementById('productos').scrollIntoView({ block: 'start' }));
  await reduced.waitForTimeout(200);
  await reduced.click('.product-card-btn');
  await reduced.waitForTimeout(300);
  const beforeY = await reduced.evaluate(() => window.scrollY);
  await reduced.mouse.wheel(0, 500);
  await reduced.waitForTimeout(400);
  const afterY = await reduced.evaluate(() => window.scrollY);
  ok('Sin Lenis el fondo también queda bloqueado y se libera al cerrar', beforeY === afterY, `${beforeY}px → ${afterY}px`);
  await reduced.keyboard.press('Escape');
  await reduced.waitForTimeout(300);
  await reduced.mouse.wheel(0, 400);
  await reduced.waitForTimeout(400);
  ok('Al cerrar se recupera el scroll nativo',
    (await reduced.evaluate(() => window.scrollY)) !== afterY);

  // ── E. Móvil ──
  console.log('\n── E. Móvil ──');
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await mobile.goto(URL, { waitUntil: 'load' });
  const heroCta = mobile.locator('a[href="#calculadora"]').first();
  ok('El CTA del Hero es visible en 390px', (await heroCta.boundingBox())?.width > 0);
  await heroCta.click();
  await mobile.waitForTimeout(1600);
  ok('En móvil el CTA lleva a la calculadora',
    await mobile.evaluate(() => Math.abs(document.getElementById('calculadora').getBoundingClientRect().top - 88) <= 12));
  await mobile.locator('.product-card-btn').first().click();
  await mobile.waitForTimeout(600);
  const mobileCalc = await mobile.evaluate(() => {
    const host = document.getElementById('calculator-host');
    const panels = document.getElementById('modal-panels');
    const calc = document.getElementById('calc-mount-point');
    const spec = document.getElementById('spec-content');
    const r = host.getBoundingClientRect();
    return {
      inModal: !!host.closest('#calc-mount-point'),
      view: panels.dataset.view,
      calcVisible: calc.offsetParent !== null,
      specHidden: spec.offsetParent === null,
      tabsShown: getComputedStyle(document.querySelector('.modal-tabs')).display !== 'none',
      w: Math.round(r.width),
      fits: r.width <= window.innerWidth,
      noScroll: calc.scrollHeight <= calc.clientHeight + 1,
    };
  });
  ok('En móvil el panel abre con la calculadora de ese premio',
    mobileCalc.inModal && mobileCalc.view === 'calc' && mobileCalc.calcVisible && mobileCalc.specHidden,
    `vista=${mobileCalc.view}`);
  ok('La calculadora cabe en el panel móvil sin barra',
    mobileCalc.fits && mobileCalc.noScroll, `ancho=${mobileCalc.w}px`);
  ok('En móvil se ven las pestañas para cambiar de vista', mobileCalc.tabsShown);

  await mobile.click('#tab-spec');
  await mobile.waitForTimeout(400);
  const specState = await mobile.evaluate(() => {
    const panel = document.getElementById('spec-content');
    return {
      specVisible: panel.offsetParent !== null,
      calcHidden: document.getElementById('calc-mount-point').offsetParent === null,
      pressed: document.getElementById('tab-spec').getAttribute('aria-pressed'),
      focusInside: !!document.activeElement?.closest('#nutrition-modal'),
      noScroll: panel.scrollHeight <= panel.clientHeight + 1,
    };
  });
  ok('La pestaña "Etiqueta" cambia la vista sin barra deslizadora',
    specState.specVisible && specState.calcHidden && specState.pressed === 'true' && specState.noScroll,
    JSON.stringify(specState));
  ok('El foco sigue dentro del panel al cambiar de vista', specState.focusInside);

  await mobile.click('#tab-calc');
  await mobile.waitForTimeout(300);
  ok('La pestaña "Tu porción" devuelve la calculadora',
    await mobile.evaluate(() =>
      !!document.getElementById('calculator-host').closest('#calc-mount-point') &&
      document.getElementById('calc-mount-point').offsetParent !== null));
  await mobile.keyboard.press('Escape');

  // El marquee rota y escala fuera del viewport (se recorta con overflow: hidden), así que
  // lo que importa es que el usuario no pueda desplazarse en horizontal.
  const narrow = await browser.newPage({ viewport: { width: 320, height: 720 } });
  await narrow.goto(URL, { waitUntil: 'load' });
  const pan = await narrow.evaluate(() => {
    window.scrollTo(600, 0);
    const x = window.scrollX;
    window.scrollTo(0, 0);
    return x;
  });
  ok('La página no se puede desplazar en horizontal (320px)', pan === 0, `scrollX=${pan}px`);

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones OK`);
  await browser.close();
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(2);
});
