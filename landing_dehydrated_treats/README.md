# 🐾 Guaw & Miaw — Landing de Premios Deshidratados

Landing page de **Guaw & Miaw Pet Shop**: premios deshidratados naturales (un solo ingrediente) para perros y gatos.

Construida con [Astro](https://astro.build) — cero JS de framework en el cliente, solo vanilla para el panel de producto, la calculadora y micro-interacciones.

## ✨ Secciones

- **Hero** con la mascota recortada sobre un halo rosa que le da contraste de fondo, el logotipo flotando debajo, croquetas flotantes y blobs animados
- **Marquee** infinito con mensajes de marca
- **Tiendita** (`#productos`): rejilla de tarjetas con nombre, proteína y precios como **texto real** (visibles sin JS); al tocar una se abre el panel de producto
- **Panel de producto**: barra superior con el nombre del premio; a la izquierda la ficha (ingrediente + las 2 presentaciones con precio → WhatsApp) y la etiqueta nutrimental; a la derecha la **calculadora ya montada y precargada con ese premio**. No hay dock de botones y **no hay barra deslizadora**: la etiqueta se escala al espacio que sobra y la pista «Ampliar etiqueta» la abre a tamaño real en otra pestaña si hace falta leerla. En móvil se convierte en pestañas («Tu porción» / «Etiqueta»)
- **Calculadora de porciones** en sección propia a dos columnas (`#calculadora`): guía paso a paso + tarjeta, para que no sobre espacio lateral en pantallas anchas
- **La Guía** (`#tips`) con recomendaciones y **Footer** con datos de contacto y FAB de WhatsApp

## 📁 Estructura

```
src/
├── assets/            # Marca: logos, mascota, croquetas, etiquetas (optimizadas por Astro)
├── components/        # Navbar, Hero, Marquee, ProductCarousel, PortionCalculator, Recommendations, Footer
├── data/products.ts   # 🔑 Modelo único de verdad: presentaciones duales, nutrición, calculadoras, colores
├── layouts/           # Layout base con SEO y fuentes (Fraunces + Nunito)
├── pages/index.astro  # Página principal
└── styles/global.css  # Sistema de diseño (paleta cálida + rosa de marca)
references/            # Imágenes de referencia de diseño (no se publican)
```

## 🛠 Comandos

| Comando           | Acción                                    |
| ----------------- | ----------------------------------------- |
| `npm install`     | Instalar dependencias                     |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321`|
| `npm run build`   | Build de producción a `./dist/`           |
| `npm run preview` | Previsualizar el build localmente         |
| `npm run check`   | Typecheck y diagnóstico de `.astro`       |
| `npm run astro …` | CLI de Astro (sync, info, etc.)           |

## 🧪 Verificación

Suites de regresión con Playwright. Exigen un build servido en el puerto indicado por `URL` (por defecto `http://127.0.0.1:4321`):

```bash
npm run build && npx astro preview --port 4321   # en otra terminal
node tests/p0-flujo.cjs     # anclas, panel, foco, contraste AA medido, consola limpia
node tests/p0-extra.cjs     # teclado, movimiento reducido, móvil 390/320
node tests/diagnostico.cjs  # sonda de solo lectura: imprime evidencia, no afirma
```

Ambas suites `p0-*` deben terminar con código de salida 0 antes de dar por cerrada cualquier fase. `npm run check` debe quedar en 0/0/0.

## 🚀 Deploy

Configurado para **Vercel** (`vercel.json`): `cleanUrls`, sin trailing slash y cache inmutable para `/_astro/*`. 
Adicionalmente se integraron `@sentry/astro` y `@spotlightjs/astro` para monitoreo y depuración.

## ✏️ Editar productos

Todo el contenido de productos vive en `src/data/products.ts`: nombre, beneficios, tabla nutricional, porciones, rangos de la calculadora, **presentaciones duales (Paseo vs Despensa)** y mensajes de WhatsApp. El texto de la tarjeta, la ficha del panel, los precios y el cálculo de porciones salen de ahí.

⚠️ Las imágenes **no** se derivan del JSON: `cardImages` y `specImages` en `ProductCarousel.astro` están indexados por posición. Al agregar o quitar un producto hay que añadir también sus imágenes en ambos arrays, o el build fallará con `specImages[i].src` indefinido.

## ⚠️ Limitaciones conocidas

- El panel de producto está dimensionado para caber sin desplazamiento en viewports de **568px de alto o más**; por debajo de esa altura queda un scroll interno sin barra visible (red de seguridad, no debería verse en dispositivos actuales).
