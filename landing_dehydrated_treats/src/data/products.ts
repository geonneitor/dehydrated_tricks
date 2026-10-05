import type { ImageMetadata } from 'astro';

// ── Imágenes de etiqueta (1772×1181, optimizadas por Astro en build) ──
import labelCharales from '../assets/labels/label-charales.png';
import labelHigados from '../assets/labels/label-higados-res.png';
import labelOrejas from '../assets/labels/label-orejas-cerdo.png';
import labelMollejas from '../assets/labels/label-mollejas-pollo.png';
import labelPatitas from '../assets/labels/label-patitas-pollo.png';

export const SITE = {
  name: 'Guaw & Miaw',
  fullName: 'Guaw & Miaw Pet Shop',
  tagline: 'Premios deshidratados naturales para perros y gatos',
  claim: 'Un solo ingrediente. Cero culpa. Toda la salud.',
  whatsapp: '525528462102',
  year: new Date().getFullYear(),
} as const;

export function waLink(message: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
}

export interface NutritionRow {
  label: string;
  value: string;
}

export interface PortionRow {
  icon: string;
  petSize: string;
  amount: string;
}

/** Rangos para la calculadora interactiva: peso (kg) → porción */
export interface CalcRange {
  maxKg: number; // límite superior del rango (Infinity para el último)
  result: string;
}

export interface Presentation {
  name: string;
  weight: string;
  price: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  emoji: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  benefits: string[];
  protein: number;
  proteinLabel: string;
  ingredients: string;
  nutrition: NutritionRow[];
  portionsTitle: string;
  portions: PortionRow[];
  note?: string;
  calc: { unit: string; ranges: CalcRange[] };
  presentations: Presentation[];
  label: ImageMetadata;
  /** Gradiente de fondo dinámico del carrusel */
  gradient: string;
  /** Acento claro del tema (chips, botones, detalles) */
  accent: string;
  /** Tono profundo del acento (hovers, sombras, marquee) */
  accentDeep: string;
  /** Color de texto legible sobre el acento */
  textOnAccent: string;
  /** Escena animada del slide (ver ProductCarousel.astro) */
  scene: 'charales' | 'higados' | 'orejas' | 'mollejas' | 'patitas';
  waMessage: string;
}

const CONSERVATION =
  'Consérvese en un lugar fresco y seco, lejos del sol. Este producto es un premio complementario; no sustituye una dieta completa. Consulte a su Médico Veterinario Zootecnista.';

export const CONSERVATION_NOTICE = CONSERVATION;

export const products: Product[] = [
  {
    id: 'charales',
    emoji: '🐟',
    name: 'Charales Deshidratados',
    shortName: 'Charales',
    tagline: 'El superalimento mexicano',
    description:
      'El superalimento que tu mascota amará. Charal entero repleto de Omega 3 y calcio natural. Un bocado crujiente que protege sus articulaciones y corazón sin una gota de químicos.',
    benefits: ['Omega 3 natural', 'Rico en calcio', '100% mexicano', 'Se come entero'],
    protein: 62,
    proteinLabel: '62% Proteína',
    ingredients: '100% Charal entero deshidratado (Chirostoma spp.). Sin sal, aditivos ni conservadores.',
    nutrition: [
      { label: 'Proteína Cruda (mín.)', value: '62.0%' },
      { label: 'Grasa Cruda (mín.)', value: '5.5%' },
      { label: 'Fibra Cruda (máx.)', value: '1.2%' },
      { label: 'Humedad (máx.)', value: '9.0%' },
      { label: 'Cenizas (máx.)', value: '15.0%' },
    ],
    portionsTitle: 'Porciones diarias recomendadas',
    portions: [
      { icon: '🐱', petSize: 'Gatos y perros < 5 kg', amount: '1 a 2 piezas al día' },
      { icon: '🐕', petSize: 'Perros chicos (5 a 10 kg)', amount: '3 a 5 piezas al día' },
      { icon: '🦮', petSize: 'Perros medianos (10 a 25 kg)', amount: '6 a 8 piezas al día' },
      { icon: '🐕‍🦺', petSize: 'Perros grandes (> 25 kg)', amount: '8 a 12 piezas al día' },
    ],
    calc: {
      unit: 'piezas al día',
      ranges: [
        { maxKg: 5, result: '1 a 2' },
        { maxKg: 10, result: '3 a 5' },
        { maxKg: 25, result: '6 a 8' },
        { maxKg: Infinity, result: '8 a 12' },
      ],
    },
    presentations: [
      { name: 'Bolsa Paseo', weight: '35g', price: 40 },
      { name: 'Bolsa Despensa', weight: '90g', price: 95, isPopular: true },
    ],
    label: labelCharales,
    gradient: 'linear-gradient(135deg, #0E3A4A 0%, #1B6E8C 55%, #2E93B4 100%)',
    accent: '#7FD1E8',
    accentDeep: '#1B6E8C',
    textOnAccent: '#0E3A4A',
    scene: 'charales',
    waMessage: '¡Hola! Me interesan los Charales deshidratados 🐟',
  },
  {
    id: 'higados',
    emoji: '🥩',
    name: 'Hígado de Res Deshidratado',
    shortName: 'Hígado de Res',
    tagline: 'El premio clásico que nunca falla',
    description:
      'El premio de alto valor que garantiza obediencia absoluta. Su aroma irresistible captura su atención al instante, mientras tú le das hierro y proteína pura. El aliado perfecto para entrenar.',
    benefits: ['Monoproteico', 'Alto en hierro', 'Ideal para entrenar', 'Aroma irresistible'],
    protein: 64,
    proteinLabel: '64% Proteína',
    ingredients: '100% Hígado de res deshidratado (Bos taurus). Sin químicos ni sales añadidas.',
    nutrition: [
      { label: 'Proteína Cruda (mín.)', value: '64.0%' },
      { label: 'Grasa Cruda (mín.)', value: '10.5%' },
      { label: 'Fibra Cruda (máx.)', value: '1.0%' },
      { label: 'Humedad (máx.)', value: '8.5%' },
      { label: 'Cenizas (máx.)', value: '5.5%' },
    ],
    portionsTitle: 'Porciones diarias recomendadas',
    portions: [
      { icon: '🐱', petSize: 'Gatos y perros < 5 kg', amount: '1 bocado chico al día (intercalado, máx. 3 veces por semana)' },
      { icon: '🐕', petSize: 'Perros chicos (5 a 10 kg)', amount: '1 a 2 bocados al día' },
      { icon: '🦮', petSize: 'Perros medianos (10 a 25 kg)', amount: '2 a 3 bocados al día' },
      { icon: '🐕‍🦺', petSize: 'Perros grandes (> 25 kg)', amount: '4 a 5 bocados al día' },
    ],
    calc: {
      unit: 'bocados al día',
      ranges: [
        { maxKg: 5, result: '1 (máx. 3 veces/semana)' },
        { maxKg: 10, result: '1 a 2' },
        { maxKg: 25, result: '2 a 3' },
        { maxKg: Infinity, result: '4 a 5' },
      ],
    },
    presentations: [
      { name: 'Bolsa Paseo', weight: '35g', price: 40 },
      { name: 'Bolsa Despensa', weight: '90g', price: 105, isPopular: true },
    ],
    label: labelHigados,
    gradient: 'linear-gradient(135deg, #4A1520 0%, #8C2332 55%, #B23A47 100%)',
    accent: '#FF9AA8',
    accentDeep: '#8C2332',
    textOnAccent: '#4A1520',
    scene: 'higados',
    waMessage: '¡Hola! Me interesa el Hígado de Res deshidratado 🥩',
  },
  {
    id: 'orejas',
    emoji: '🐷',
    name: 'Orejas de Cerdo Deshidratadas',
    shortName: 'Orejas de Cerdo',
    tagline: 'El masticable que los mantiene ocupados',
    description:
      'Salva tus zapatos y dales horas de felicidad. Nuestro masticable estrella limpia sus dientes naturalmente, reduciendo la ansiedad y el estrés mientras disfrutan un sabor que los vuelve locos.',
    benefits: ['Masticable de larga duración', 'Cuidado dental', 'Solo perros', 'Desengrasada natural'],
    protein: 60,
    proteinLabel: '60% Proteína',
    ingredients: '100% Oreja de cerdo deshidratada (Sus scrofa domesticus). Desengrasada naturalmente, sin blanqueadores químicos.',
    nutrition: [
      { label: 'Proteína Cruda (mín.)', value: '60.0%' },
      { label: 'Grasa Cruda (mín.)', value: '22.0%' },
      { label: 'Fibra Cruda (máx.)', value: '2.0%' },
      { label: 'Humedad (máx.)', value: '8.0%' },
      { label: 'Cenizas (máx.)', value: '3.5%' },
    ],
    portionsTitle: 'Porciones recomendadas (exclusivo para perros)',
    portions: [
      { icon: '🐕', petSize: 'Perros < 5 kg', amount: '1/4 de oreja (en tiras), 1 vez por semana' },
      { icon: '🐕', petSize: 'Perros chicos (5 a 10 kg)', amount: '1/2 oreja, 1 a 2 veces por semana' },
      { icon: '🦮', petSize: 'Perros medianos (10 a 25 kg)', amount: '1 pieza entera, 2 veces por semana' },
      { icon: '🐕‍🦺', petSize: 'Perros grandes (> 25 kg)', amount: '1 pieza entera, hasta 3 veces por semana' },
    ],
    note: 'Este producto es exclusivo para perros. No apto para gatos.',
    calc: {
      unit: '(frecuencia semanal)',
      ranges: [
        { maxKg: 5, result: '1/4 de oreja, 1 vez/semana' },
        { maxKg: 10, result: '1/2 oreja, 1 a 2 veces/semana' },
        { maxKg: 25, result: '1 entera, 2 veces/semana' },
        { maxKg: Infinity, result: '1 entera, hasta 3 veces/semana' },
      ],
    },
    presentations: [
      { name: 'Individual', weight: '1 pza', price: 45 },
      { name: 'Bolsa Despensa', weight: '3 pzas', price: 130, isPopular: true },
    ],
    label: labelOrejas,
    gradient: 'linear-gradient(135deg, #6B3244 0%, #C96F8E 60%, #E89BB4 100%)',
    accent: '#FFC9D6',
    accentDeep: '#C96F8E',
    textOnAccent: '#6B3244',
    scene: 'orejas',
    waMessage: '¡Hola! Me interesan las Orejas de Cerdo deshidratadas 🐷',
  },
  {
    id: 'mollejas',
    emoji: '🍗',
    name: 'Mollejas de Pollo Deshidratadas',
    shortName: 'Mollejas de Pollo',
    tagline: 'La campeona de proteína',
    description:
      'La bomba de proteína que fortalece sus músculos. Con un 68% de proteína magra, es la recompensa ideal para mascotas activas. Sabor intenso, digestión ligera y cero aditivos.',
    benefits: ['68% proteína', 'Libre de grasa periférica', 'Textura suave', 'Para gatos y perros'],
    protein: 68,
    proteinLabel: '68% Proteína',
    ingredients: '100% Molleja de pollo deshidratada (Gallus gallus domesticus). Libre de grasa periférica y conservadores.',
    nutrition: [
      { label: 'Proteína Cruda (mín.)', value: '68.0%' },
      { label: 'Grasa Cruda (mín.)', value: '8.0%' },
      { label: 'Fibra Cruda (máx.)', value: '1.5%' },
      { label: 'Humedad (máx.)', value: '8.5%' },
      { label: 'Cenizas (máx.)', value: '4.5%' },
    ],
    portionsTitle: 'Porciones diarias recomendadas',
    portions: [
      { icon: '🐱', petSize: 'Gatos y perros < 5 kg', amount: '1 trocito chico al día' },
      { icon: '🐕', petSize: 'Perros chicos (5 a 10 kg)', amount: '1 pieza entera (o 3 trocitos) al día' },
      { icon: '🦮', petSize: 'Perros medianos (10 a 25 kg)', amount: '2 piezas enteras al día' },
      { icon: '🐕‍🦺', petSize: 'Perros grandes (> 25 kg)', amount: '3 a 5 piezas enteras al día' },
    ],
    calc: {
      unit: 'piezas al día',
      ranges: [
        { maxKg: 5, result: '1 trocito chico' },
        { maxKg: 10, result: '1 pieza (o 3 trocitos)' },
        { maxKg: 25, result: '2 piezas' },
        { maxKg: Infinity, result: '3 a 5 piezas' },
      ],
    },
    presentations: [
      { name: 'Bolsa Paseo', weight: '35g', price: 40 },
      { name: 'Bolsa Despensa', weight: '90g', price: 95, isPopular: true },
    ],
    label: labelMollejas,
    gradient: 'linear-gradient(135deg, #5C3A0E 0%, #C98A2D 60%, #E0A94E 100%)',
    accent: '#FFD98A',
    accentDeep: '#C98A2D',
    textOnAccent: '#5C3A0E',
    scene: 'mollejas',
    waMessage: '¡Hola! Me interesan las Mollejas de Pollo deshidratadas 🍗',
  },
  {
    id: 'patitas',
    emoji: '🐔',
    name: 'Patitas de Pollo Deshidratadas',
    shortName: 'Patitas de Pollo',
    tagline: 'Colágeno natural para sus articulaciones',
    description:
      'Crocancia adictiva con superpoderes para sus articulaciones. Cada patita está cargada de colágeno y glucosamina natural para que nunca dejen de correr. Un snack funcional que adorarán.',
    benefits: ['Colágeno natural', 'Cuidado articular', 'Crocante adictivo', 'Se come entera'],
    protein: 40,
    proteinLabel: '40% Proteína',
    ingredients: '100% Patas de pollo deshidratadas (Gallus gallus domesticus). Sin conservadores.',
    nutrition: [
      { label: 'Proteína Cruda (mín.)', value: '40.0%' },
      { label: 'Grasa Cruda (mín.)', value: '13.0%' },
      { label: 'Fibra Cruda (máx.)', value: '2.0%' },
      { label: 'Humedad (máx.)', value: '12.0%' },
      { label: 'Cenizas (máx.)', value: '20.0%' },
    ],
    portionsTitle: 'Porciones diarias recomendadas',
    portions: [
      { icon: '🐱', petSize: 'Gatos y perros < 5 kg', amount: '1 pieza chica (supervisada)' },
      { icon: '🐕', petSize: 'Perros chicos (5 a 10 kg)', amount: '1 pieza al día' },
      { icon: '🦮', petSize: 'Perros medianos (10 a 25 kg)', amount: '1 a 2 piezas al día' },
      { icon: '🐕‍🦺', petSize: 'Perros grandes (> 25 kg)', amount: '2 a 3 piezas al día' },
    ],
    calc: {
      unit: 'piezas al día',
      ranges: [
        { maxKg: 5, result: '1 chica (supervisada)' },
        { maxKg: 10, result: '1' },
        { maxKg: 25, result: '1 a 2' },
        { maxKg: Infinity, result: '2 a 3' },
      ],
    },
    presentations: [
      { name: 'Bolsa Paseo', weight: '2 pzas', price: 40 },
      { name: 'Bolsa Despensa', weight: '6 pzas', price: 100, isPopular: true },
    ],
    label: labelPatitas,
    gradient: 'linear-gradient(135deg, #6B4423 0%, #B98A5A 60%, #D9B08C 100%)',
    accent: '#FFE3C2',
    accentDeep: '#B98A5A',
    textOnAccent: '#6B4423',
    scene: 'patitas',
    waMessage: '¡Hola! Me interesan las Patitas de Pollo deshidratadas 🐔',
  },
];
