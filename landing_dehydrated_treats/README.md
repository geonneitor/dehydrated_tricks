# 🐾 Guaw & Miaw — Landing de Premios Deshidratados

Landing page de **Guaw & Miaw Pet Shop**: premios deshidratados naturales (un solo ingrediente) para perros y gatos.

Construida con [Astro](https://astro.build) — cero JS de framework en el cliente, solo vanilla para carrusel, calculadoras y micro-interacciones.

## ✨ Secciones

- **Hero** con mascota flotante, sello giratorio y blobs animados de fondo
- **Marquee** infinito con mensajes de marca
- **Carrusel de productos** con fondo dinámico que cambia de gradiente según el producto (auto-avance, flechas, dots y swipe táctil)
- **Calculadora de Porciones** interactiva, que inyecta JSON y cambia variables CSS estéticas en vivo.
- **CTA final + FAB de WhatsApp** con mensajes precargados por producto

## 📁 Estructura

```
src/
├── assets/            # Marca: logos, mascota, croquetas, etiquetas (optimizadas por Astro)
├── components/        # Navbar, Hero, Marquee, ProductCarousel, PortionCalculator, Footer
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

## 🚀 Deploy

Configurado para **Vercel** (`vercel.json`): `cleanUrls`, sin trailing slash y cache inmutable para `/_astro/*`. 
Adicionalmente se integraron `@sentry/astro` y `@spotlightjs/astro` para monitoreo y depuración.

## ✏️ Editar productos

Todo el contenido de productos vive en `src/data/products.ts`: nombre, beneficios, tabla nutricional, porciones, rangos de la calculadora, **presentaciones duales (Paseo vs Despensa)**, gradiente del carrusel y mensajes de WhatsApp. Agregar o quitar un producto actualiza automáticamente carrusel, información y calculadoras.
