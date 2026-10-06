/**
 * Verificación P0: CTA del Hero, calculadora compartida con el modal,
 * bloqueo de scroll, teclado y contraste real medido en Chromium.
 *
 * Uso:  npm run build && npx astro preview --port 4321
 *       node tests/p0-flujo.cjs
 *       node tests/p0-extra.cjs
 *
 * Contra `astro dev` el primer cargado puede fallar con "504 Outdated Optimize Dep":
 * es Vite re-optimizando dependencias y recargando la página. Calienta el servidor
 * con una visita antes de correr las pruebas.
 */
const { chromium } = require('playwright');

const URL = process.env.URL || 'http://127.0.0.1:4321';
const results = [];
const ok = (name, pass, extra = '') => {
  results.push({ name, pass, extra });
  console.log(`${pass ? '✅' : '❌'} ${name}${extra ? ` — ${extra}` : ''}`);
};

async function contrastAudit(page) {
  const samples = await page.evaluate(() => {
    const parse = (value) => (value.match(/[\d.]+/g) || []).map(Number);
    const effectiveBg = (el) => {
      let node = el;
      while (node && node !== document.documentElement) {
        const bg = getComputedStyle(node).backgroundColor;
        const parts = parse(bg);
        if (parts.length >= 3 && (parts[3] === undefined || parts[3] > 0.5)) return parts;
        node = node.parentElement;
      }
      return [20, 10, 13];
    };
    const targets = [
      ['.package-calc__title', 'calculadora · título'],
      ['.package-calc__subtitle', 'calculadora · subtítulo'],
      ['.weight-display', 'calculadora · etiqueta peso'],
      ['.compact-field label', 'calculadora · etiqueta de campo'],
      // los toggles se miden abajo, en sus dos estados
      ['.compact-select', 'calculadora · select'],
      ['.footer-note', 'calculadora · nota inferior'],
      ['.yellow-pill__label', 'calculadora · etiqueta del resultado'],
      ['.yellow-pill__value', 'calculadora · valor del resultado'],
      ['.store-title', 'tiendita · título'],
      ['.store-desc', 'tiendita · descripción'],
      ['.hero-desc', 'hero · descripción'],
      ['.kicker', 'global · kicker'],
      ['.calculator-section__desc', 'calculadora · bajada de sección'],
      ['.marquee__track span', 'marquee · texto'],
      ['.footer-massive-title', 'footer · título'],
      ['.product-card__name', 'tiendita · nombre de producto'],
      ['.product-card__claim', 'tiendita · reclamo de producto'],
      ['.product-card__pres', 'tiendita · presentación'],
      ['.product-card__pres strong', 'tiendita · precio'],
      ['.product-card__pres.is-popular strong', 'tiendita · precio destacado'],
      ['.calculator-steps__text strong', 'calculadora · paso (título)'],
      ['.calculator-steps__text span', 'calculadora · paso (detalle)'],
      ['.calc-cta', 'calculadora · CTA de pedido'],
    ];
    const sample = (el, label) => {
      const cs = getComputedStyle(el);
      return {
        label,
        fg: parse(cs.color),
        bg: effectiveBg(el),
        size: parseFloat(cs.fontSize),
        weight: Number(cs.fontWeight) || 400,
      };
    };

    const collected = targets.flatMap(([selector, label]) => {
      const el = document.querySelector(selector);
      return el ? [sample(el, label)] : [];
    });

    // Los toggles de especie tienen dos estados: se miden los dos.
    document.querySelectorAll('.toggle-btn').forEach((label_) => {
      const input = label_.querySelector('input');
      const span = label_.querySelector('span');
      if (span) collected.push(sample(span, `calculadora · toggle ${input.checked ? 'seleccionado' : 'sin seleccionar'}`));
    });

    return collected;
  });

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

  console.log('\n── Contraste (WCAG AA: 4.5 texto normal, 3.0 texto grande) ──');
  const failing = [];
  for (const s of samples) {
    const value = ratio(s.fg.slice(0, 3), s.bg.slice(0, 3));
    const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
    const min = large ? 3 : 4.5;
    const pass = value >= min;
    if (!pass) failing.push(`${s.label} (${value.toFixed(2)}:1, mínimo ${min})`);
    console.log(`${pass ? '✅' : '❌'} ${s.label.padEnd(42)} ${value.toFixed(2)}:1 (${s.size}px${large ? ', grande' : ''})`);
  }
  return failing;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });

  await page.goto(URL, { waitUntil: 'load' });

  // 1. Un solo #calculadora y en flujo normal (no dentro de un contenedor oculto)
  const calcInfo = await page.evaluate(() => {
    const nodes = document.querySelectorAll('#calculadora');
    const el = nodes[0];
    if (!el) return null;
    return {
      count: nodes.length,
      tag: el.tagName,
      hiddenAncestor: !!el.closest('[hidden], [style*="display: none"]'),
      offsetHeight: el.offsetHeight,
    };
  });
  ok('Existe un único #calculadora', calcInfo?.count === 1, `tag=${calcInfo?.tag}`);
  ok('#calculadora tiene layout y no está en un ancestro oculto',
    !!calcInfo && calcInfo.offsetHeight > 0 && !calcInfo.hiddenAncestor,
    `alto=${calcInfo?.offsetHeight}px, ancestroOculto=${calcInfo?.hiddenAncestor}`);

  // 2. El CTA del Hero lleva la calculadora al viewport
  await page.click('a[href="#calculadora"]');
  await page.waitForTimeout(1800);
  const cta = await page.evaluate(() => {
    const el = document.getElementById('calculadora');
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), visible: r.top < window.innerHeight && r.bottom > 0, scrollY: Math.round(window.scrollY) };
  });
  ok('CTA del Hero desplaza a la calculadora visible', cta.visible, `top=${cta.top}px, scrollY=${cta.scrollY}`);

  // 3. Calculadora utilizable en la página (sin abrir ningún modal)
  await page.click('input[name="pet_type"][value="dog"]', { force: true });
  await page.selectOption('select[name="pet_age"]', 'adult');
  await page.selectOption('select[name="pet_sick"]', 'no');
  await page.selectOption('select[name="calc_product"]', 'charales');
  await page.waitForTimeout(200);
  const inPagePill = await page.textContent('.yellow-pill__value');
  // 15 kg con Charales cae en el rango de 10–25 kg → "6 a 8"
  ok('Calculadora funciona en la sección', /6 a 8/.test(inPagePill || ''), `resultado="${(inPagePill || '').trim()}"`);

  // 4. Peso máximo 80 kg y bordes de rango
  await page.evaluate(() => {
    const slider = document.querySelector('[data-weight-slider]');
    slider.value = '80';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(150);
  const bigDog = await page.textContent('.yellow-pill__value');
  ok('80 kg devuelve el rango de perro grande', /8 a 12/.test(bigDog || ''), `resultado="${(bigDog || '').trim()}"`);

  await page.evaluate(() => {
    const slider = document.querySelector('[data-weight-slider]');
    slider.value = '26';
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(150);
  const medium = await page.textContent('.yellow-pill__value');
  ok('26 kg sale del rango <25 kg', /8 a 12/.test(medium || ''), `resultado="${(medium || '').trim()}"`);

  // 5. Panel: abre directo con la calculadora de ese premio, sin dock ni scroll
  await page.evaluate(() => document.getElementById('productos').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(400);
  await page.click('.product-card-btn');
  await page.waitForTimeout(500);
  const modalState = await page.evaluate(() => {
    const modal = document.getElementById('nutrition-modal');
    const img = document.getElementById('spec-img');
    const host = document.getElementById('calculator-host');
    const panels = Array.from(document.querySelectorAll('.modal-panel'));
    return {
      open: modal.open,
      imgLoaded: img.complete && img.naturalWidth > 0,
      imgAlt: img.alt,
      imgW: img.width,
      imgH: img.height,
      calcInPanel: !!host.closest('#calc-mount-point'),
      dockLeft: document.querySelectorAll('.app-modal-dock, #btn-show-calc, #btn-show-spec, #btn-order').length,
      product: document.querySelector('#calc-product')?.value,
      focusInCalc: !!document.activeElement?.closest('#calculator-host'),
      fits: panels.every((p) => p.scrollHeight <= p.clientHeight + 1),
      specVisible: document.getElementById('spec-content').offsetParent !== null,
    };
  });
  ok('El panel abre con la etiqueta', modalState.open && modalState.imgLoaded, `alt="${modalState.imgAlt}"`);
  ok('La calculadora está montada por defecto, sin botones intermedios',
    modalState.calcInPanel && modalState.dockLeft === 0, `botones de dock restantes=${modalState.dockLeft}`);
  ok('La calculadora nace con el premio de la tarjeta abierta',
    modalState.product === 'charales', `premio=${modalState.product}`);
  ok('El foco cae dentro de la calculadora del panel', modalState.focusInCalc,
    `foco=${await page.evaluate(() => document.activeElement?.tagName + (document.activeElement?.id ? '#' + document.activeElement.id : ''))}`);
  ok('La ficha y la etiqueta conviven con la calculadora (dos columnas)', modalState.specVisible);
  ok('El panel no necesita scroll en desktop', modalState.fits);
  ok('La etiqueta declara dimensiones (sin salto de layout)',
    modalState.imgW > 0 && modalState.imgH > 0, `${modalState.imgW}×${modalState.imgH}`);
  ok('Ya no hay overlay invisible clicable',
    (await page.locator('.invisible-calc-trigger, #image-calc-trigger').count()) === 0);

  // 6. Scroll de fondo bloqueado.
  // Ojo: el clic de Playwright hace scrollIntoViewIfNeeded ANTES de pulsar, así que la
  // medición debe partir de un scroll ya asentado; si no, el propio arnés se cuenta como fallo.
  const stableScroll = async () => {
    let previous = -1;
    for (let i = 0; i < 12; i++) {
      const now = await page.evaluate(() => Math.round(window.scrollY));
      if (now === previous) return now;
      previous = now;
      await page.waitForTimeout(150);
    }
    return previous;
  };
  const beforeScroll = await stableScroll();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  const afterScroll = await page.evaluate(() => Math.round(window.scrollY));
  ok('El fondo no se desplaza con el modal abierto', beforeScroll === afterScroll,
    `${beforeScroll}px → ${afterScroll}px`);

  // 7. La calculadora dentro del panel: misma instancia, con el estado conservado
  const inModal = await page.evaluate(() => {
    const host = document.getElementById('calculator-host');
    const ficha = Array.from(document.querySelectorAll('[data-detail]')).find((b) => !b.hidden);
    return {
      inModal: !!host.closest('#calc-mount-point'),
      result: document.querySelector('.yellow-pill__value').textContent.replace(/\s+/g, ' ').trim(),
      waLinks: Array.from(ficha?.querySelectorAll('.modal-summary__options a') || []).map((a) => decodeURIComponent(a.getAttribute('href') || '')),
      noScroll: Array.from(document.querySelectorAll('.modal-panel')).every((p) => p.scrollHeight <= p.clientHeight + 1),
    };
  });
  ok('La calculadora se monta en el panel (instancia única)', inModal.inModal);
  ok('Conserva el estado al pasar al panel', /8 a 12/.test(inModal.result), `resultado="${inModal.result}"`);
  ok('El pedido sale desde las presentaciones de la ficha (sin dock de WhatsApp)',
    inModal.waLinks.length === 2 && inModal.waLinks.every((l) => l.includes('wa.me') && /Charales/.test(l)),
    inModal.waLinks.map((l) => l.slice(-46)).join(' | '));
  ok('Ninguna columna del panel necesita barra deslizadora', inModal.noScroll);

  // 8. Esc cierra y devuelve la calculadora a la página
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const afterClose = await page.evaluate(() => ({
    open: document.getElementById('nutrition-modal').open,
    home: !!document.getElementById('calculator-host').closest('#calculadora'),
    specVisible: !document.getElementById('spec-content').hidden,
  }));
  ok('Esc cierra el modal', !afterClose.open);
  ok('La calculadora vuelve a la sección #calculadora', afterClose.home);

  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(400);
  const unlocked = await page.evaluate(() => window.scrollY);
  ok('El scroll de la página se reactiva al cerrar', unlocked !== afterScroll, `scrollY=${unlocked}px`);

  // 9. Teclado: los toggles de especie muestran el foco
  await page.evaluate(() => document.getElementById('calculadora').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.focus('input[name="pet_type"][value="dog"]');
  const focusRing = await page.evaluate(() => {
    const input = document.querySelector('input[name="pet_type"][value="dog"]');
    const span = input.nextElementSibling;
    const cs = getComputedStyle(span);
    return { outline: cs.outlineStyle, width: cs.outlineWidth, color: cs.outlineColor };
  });
  ok('El toggles muestra anillo de foco al navegar con teclado',
    focusRing.outline !== 'none' && parseFloat(focusRing.width) >= 2, JSON.stringify(focusRing));

  // 9b. Regresiones encontradas por el review adversarial
  await page.evaluate(() => document.getElementById('productos').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  const thirdCardName = await page.locator('.product-card-btn').nth(2).getAttribute('data-name');
  await page.locator('.product-card-btn').nth(2).click();
  await page.waitForTimeout(500);
  const sync = await page.evaluate(() => {
    const select = document.getElementById('calc-product');
    return {
      calcProduct: select.value,
      result: document.querySelector('.yellow-pill__value').textContent.replace(/\s+/g, ' ').trim(),
      focusInCalc: !!document.activeElement?.closest('#calculator-host'),
      dialogName: document.getElementById('nutrition-modal-title').textContent,
    };
  });
  ok('La calculadora del modal usa el premio de la tarjeta abierta',
    sync.calcProduct === 'orejas' && !/^--/.test(sync.result),
    `tarjeta="${thirdCardName}" → calculadora="${sync.calcProduct}" (${sync.result})`);
  ok('El foco se queda dentro de la calculadora al abrir el panel', sync.focusInCalc,
    `foco=${await page.evaluate(() => document.activeElement?.tagName)}`);
  ok('El nombre accesible del diálogo identifica el producto',
    sync.dialogName.includes(thirdCardName || '\u0000'), `"${sync.dialogName}"`);

  // Trampa de foco: Tab nunca debe salir del diálogo
  const escaped = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      return { inside: !!el?.closest('#nutrition-modal'), tag: el?.tagName || 'null' };
    });
    if (!where.inside) escaped.push(where.tag);
  }
  ok('Tab no escapa del modal (trampa de foco)', escaped.length === 0, `salidas=${escaped.join(',') || 'ninguna'}`);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 9c. Precios, presentaciones y salida de compra (paso 13)
  const cards = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.product-card')).map((card) => ({
      name: card.querySelector('.product-card__name')?.textContent?.trim() || '',
      prices: Array.from(card.querySelectorAll('.product-card__pres strong')).map((s) => s.textContent.trim()),
    }))
  );
  ok('Las 5 tarjetas muestran nombre y sus 2 precios como texto',
    cards.length === 5 && cards.every((c) => c.name && c.prices.length === 2 && c.prices.every((p) => /^\$\d+$/.test(p))),
    cards.map((c) => `${c.name}: ${c.prices.join(' / ')}`).join(' · '));

  await page.locator('.product-card-btn').nth(1).click();
  await page.waitForTimeout(400);
  const detail = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll('[data-detail]')).filter((b) => !b.hidden);
    return {
      visible: visible.length,
      links: Array.from(visible[0]?.querySelectorAll('.modal-summary__options a') || []).map((a) => ({
        text: a.textContent.replace(/\s+/g, ' ').trim(),
        href: decodeURIComponent(a.getAttribute('href') || ''),
      })),
    };
  });
  ok('El modal muestra una sola ficha de producto con sus 2 presentaciones',
    detail.visible === 1 && detail.links.length === 2, `fichas visibles=${detail.visible}, opciones=${detail.links.length}`);
  ok('Cada presentación se pide con su propio mensaje',
    detail.links.every((l) => l.href.includes('wa.me') && l.href.includes('$') && /Bolsa|Individual/.test(l.href)),
    detail.links.map((l) => l.text).join(' | '));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  await page.evaluate(() => document.getElementById('calculadora').scrollIntoView({ block: 'start' }));
  await page.waitForTimeout(300);
  await page.selectOption('#calc-product', 'higados');
  await page.waitForTimeout(200);
  const calcCta = await page.evaluate(() => decodeURIComponent(document.querySelector('[data-calc-cta]').href));
  ok('El CTA de la calculadora lleva el premio elegido',
    calcCta.includes('wa.me') && calcCta.includes('Hígado'), calcCta.replace('https://wa.me/', ''));

  // 10. Contraste real medido
  const failing = await contrastAudit(page);
  ok('Sin fallos de contraste AA medidos', failing.length === 0, failing.join(' | '));

  // 11. Consola limpia
  ok('Sin errores de JavaScript', consoleErrors.length === 0, consoleErrors.slice(0, 4).join(' | '));

  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} comprobaciones OK`);
  await browser.close();
  process.exit(failed.length ? 1 : 0);
})().catch((error) => {
  console.error(error);
  process.exit(2);
});
