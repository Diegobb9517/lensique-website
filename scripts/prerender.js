import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dbPath = path.resolve(rootDir, '../lensique-pos/database.sqlite');

console.log('🚀 Starting Google Shopping SSG Prerender build script...');

const slugify = (str) => {
  if (!str) return '';
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const getProductSlug = (product) => {
  if (!product) return '';
  const brand = (product.brand && product.brand !== 'null') ? String(product.brand).trim() : '';
  const model = String(product.model || product.name || '').trim();
  const sku = String(product.sku || '').trim();
  
  const parts = [brand, model, sku].filter(Boolean);
  let slug = slugify(parts.join(' '));
  if (!slug) slug = `producto-${product.id}`;
  return slug;
};

// 1. Fetch Products
let products = [];
if (fs.existsSync(dbPath)) {
  try {
    const { DatabaseSync } = await import('node:sqlite');
    const db = new DatabaseSync(dbPath);
    products = db.prepare(`
      SELECT p.id, p.name, p.sku, p.brand, p.price_incl_tax, p.stock, c.name as category, p.image_url, p.description
      FROM products p 
      JOIN product_categories c ON p.category_id = c.id 
      WHERE p.status = 'ACTIVE' 
      AND UPPER(TRIM(COALESCE(p.brand, ''))) != 'CH'
      ORDER BY p.brand ASC, p.name ASC
    `).all();
    console.log(`[Database] Loaded ${products.length} products from SQLite database.`);
  } catch (err) {
    console.warn('[Database] Error loading from SQLite, falling back to content2.json:', err.message);
  }
}

if (products.length === 0) {
  const content2Path = path.join(rootDir, 'content2.json');
  if (fs.existsSync(content2Path)) {
    try {
      const content = JSON.parse(fs.readFileSync(content2Path, 'utf8'));
      const fullCat = typeof content.full_catalog_data === 'string' ? JSON.parse(content.full_catalog_data) : (content.full_catalog_data || []);
      products = fullCat.filter(p => (p.brand || '').toUpperCase().trim() !== 'CH');
      console.log(`[content2.json] Loaded ${products.length} products.`);
    } catch (e) {
      console.error('[content2.json] Error reading content2.json:', e);
    }
  }
}

if (products.length === 0) {
  console.error('❌ Error: No products found for prerendering!');
  process.exit(1);
}

const templatePath = path.join(distDir, 'index.html');
if (!fs.existsSync(templatePath)) {
  console.error(`❌ Template not found at ${templatePath}. Run vite build first.`);
  process.exit(1);
}

const indexTemplate = fs.readFileSync(templatePath, 'utf8');

const formatPrice = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(num);
};

const resolveAbsImage = (imgUrl) => {
  if (!imgUrl || imgUrl === 'null' || imgUrl === 'undefined') {
    return 'https://www.lensique.com.mx/hero_glasses.jpg';
  }
  let url = String(imgUrl).trim();
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `https://lensique-pos.onrender.com${url}`;
  return `https://lensique-pos.onrender.com/${url}`;
};

const sitemapUrls = [
  'https://www.lensique.com.mx/',
  'https://www.lensique.com.mx/armazones',
  'https://www.lensique.com.mx/lentes-de-contacto',
  'https://www.lensique.com.mx/agendar-cita'
];

let generatedCount = 0;

products.forEach(p => {
  const brand = (p.brand && p.brand !== 'null') ? p.brand.trim() : '';
  const model = (p.model || p.name || '').trim();
  const isContact = String(p.category || '').toLowerCase().includes('contacto');
  const categoryLabel = isContact ? 'Lentes de Contacto' : 'Armazón oftálmico';
  const slug = getProductSlug(p);
  const canonicalUrl = `https://www.lensique.com.mx/producto/${slug}`;
  sitemapUrls.push(canonicalUrl);

  const isOutOfStock = p.stock != null && p.stock !== '' && Number(p.stock) <= 0;
  const availabilitySchema = isOutOfStock ? 'https://schema.org/PreOrder' : 'https://schema.org/InStock';
  const availabilityText = isOutOfStock ? 'Sobre pedido' : 'En existencia';
  
  const numericPrice = (Number(p.price_incl_tax) || 0).toFixed(2);
  const formattedPriceMxn = `${formatPrice(p.price_incl_tax)} MXN`;
  const absImg = resolveAbsImage(p.image_url);
  const pageTitle = `${brand ? brand + ' ' : ''}${model} | ${categoryLabel} | Óptica Lensique`;
  const pageDesc = p.description || `Compra ${brand ? brand + ' ' : ''}${model} (${categoryLabel}) en Óptica Lensique. Examen de vista gratis en Zapopan y envío a todo México.`;

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": `${brand ? brand + ' ' : ''}${model} - ${categoryLabel}`,
    "image": [absImg],
    "description": pageDesc,
    "sku": p.sku || slug,
    "mpn": p.sku || slug,
    "brand": { "@type": "Brand", "name": brand || "Lensique" },
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": "MXN",
      "price": numericPrice,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availabilitySchema,
      "seller": { "@type": "Organization", "name": "Óptica Lensique" }
    }
  };

  const headInjection = `
    <title>${pageTitle}</title>
    <meta name="description" content="${pageDesc}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${pageTitle}" />
    <meta property="og:description" content="${pageDesc}" />
    <meta property="og:image" content="${absImg}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:type" content="product" />
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
  `;

  const bodyInjection = `
    <div id="product-seo-fallback" style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif; border: 1px solid #eaeaea; border-radius: 16px; background: #ffffff;">
      <span style="font-size: 14px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.05em;">${brand || 'Óptica Lensique'} · ${categoryLabel}</span>
      <h1 style="font-size: 28px; font-weight: 700; color: #111827; margin: 8px 0;">${brand ? brand + ' ' : ''}${model}</h1>
      <p style="font-size: 24px; font-weight: 700; color: #16a34a; margin: 12px 0;">${formattedPriceMxn}</p>
      <div style="display: inline-block; padding: 6px 12px; background: ${isOutOfStock ? '#fff7ed' : '#f0fdf4'}; color: ${isOutOfStock ? '#c2410c' : '#15803d'}; font-weight: 600; border-radius: 6px; font-size: 13px; margin-bottom: 16px;">
        Disponibilidad: ${availabilityText}
      </div>
      <div style="margin: 20px 0;">
        <img src="${absImg}" alt="${model}" style="max-width: 100%; height: auto; border-radius: 12px;" />
      </div>
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6;">${pageDesc}</p>
      <p style="font-size: 13px; color: #9ca3af; margin-top: 12px;">SKU: <strong>${p.sku || slug}</strong></p>
      <a href="${canonicalUrl}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">
        Seleccionar micas y comprar
      </a>
    </div>
  `;

  let html = indexTemplate;
  if (html.includes('<title>')) {
    html = html.replace(/<title>.*?<\/title>/s, `<title>${pageTitle}</title>`);
  }
  html = html.replace('</head>', `${headInjection}\n</head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${bodyInjection}</div>`);

  const prodDir = path.join(distDir, 'producto', slug);
  if (!fs.existsSync(prodDir)) {
    fs.mkdirSync(prodDir, { recursive: true });
  }
  fs.writeFileSync(path.join(prodDir, 'index.html'), html, 'utf8');
  generatedCount++;
});

console.log(`✅ Pre-rendered ${generatedCount} static product HTML pages in /dist/producto/[slug]/index.html`);

// Generate /agendar-cita prerender
const agendarTitle = "Agenda tu Examen de Vista Sin Costo | Óptica Lensique Zapopan";
const agendarDesc = "Agenda tu examen de la vista sin costo en Zapopan. Realizado por oftalmólogo certificado. Elige día y hora en línea.";
const agendarCanonical = "https://www.lensique.com.mx/agendar-cita";

const agendarHeadInjection = `
    <title>${agendarTitle}</title>
    <meta name="description" content="${agendarDesc}" />
    <link rel="canonical" href="${agendarCanonical}" />
    <meta property="og:title" content="${agendarTitle}" />
    <meta property="og:description" content="${agendarDesc}" />
    <meta property="og:image" content="https://www.lensique.com.mx/hero_glasses.jpg" />
    <meta property="og:url" content="${agendarCanonical}" />
    <meta property="og:type" content="website" />
`;

const agendarBodyInjection = `
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; text-align: center; font-family: sans-serif;">
    <h1 style="font-size: 28px; font-weight: 700; color: #111827;">Agenda tu Examen de Vista Sin Costo</h1>
    <p style="font-size: 16px; color: #4b5563;">El examen no tiene costo y es realizado por un oftalmólogo certificado.</p>
    <a href="${agendarCanonical}" style="display: inline-block; margin-top: 20px; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600;">Confirmar y enviar WhatsApp</a>
  </div>
`;

let agendarHtml = indexTemplate;
if (agendarHtml.includes('<title>')) {
  agendarHtml = agendarHtml.replace(/<title>.*?<\/title>/s, `<title>${agendarTitle}</title>`);
}
agendarHtml = agendarHtml.replace('</head>', `${agendarHeadInjection}\n</head>`);
agendarHtml = agendarHtml.replace('<div id="root"></div>', `<div id="root">${agendarBodyInjection}</div>`);

const agendarDir = path.join(distDir, 'agendar-cita');
if (!fs.existsSync(agendarDir)) {
  fs.mkdirSync(agendarDir, { recursive: true });
}
fs.writeFileSync(path.join(agendarDir, 'index.html'), agendarHtml, 'utf8');
console.log('✅ Pre-rendered /agendar-cita/index.html');
// Generate /cotizador prerender
const cotizadorTitle = "Cotizador de Micas y Lentes Graduados | Óptica Lensique Zapopan";
const cotizadorDesc = "Calcula el costo de tus micas en menos de un minuto. Monofocales, progresivos, antirreflejante y filtro azul. Óptica en Zapopan.";
const cotizadorCanonical = "https://www.lensique.com.mx/cotizador";
sitemapUrls.push(cotizadorCanonical);

const cotizadorHeadInjection = `
    <title>${cotizadorTitle}</title>
    <meta name="description" content="${cotizadorDesc}" />
    <link rel="canonical" href="${cotizadorCanonical}" />
    <meta property="og:title" content="${cotizadorTitle}" />
    <meta property="og:description" content="${cotizadorDesc}" />
    <meta property="og:url" content="${cotizadorCanonical}" />
    <meta property="og:type" content="website" />
`;

const cotizadorBodyInjection = `
  <div style="max-width: 600px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
    <h1 style="font-size: 28px; font-weight: 700; color: #111827;">Cotiza tus micas en menos de un minuto</h1>
    <p style="font-size: 16px; color: #4b5563;">Descubre las opciones de micas monofocales, bifocales, progresivos, fotocromáticos, filtro azul y antirreflejante.</p>
  </div>
`;

let cotizadorHtml = indexTemplate;
if (cotizadorHtml.includes('<title>')) {
  cotizadorHtml = cotizadorHtml.replace(/<title>.*?<\/title>/s, `<title>${cotizadorTitle}</title>`);
}
cotizadorHtml = cotizadorHtml.replace('</head>', `${cotizadorHeadInjection}\n</head>`);
cotizadorHtml = cotizadorHtml.replace('<div id="root"></div>', `<div id="root">${cotizadorBodyInjection}</div>`);

const cotizadorDir = path.join(distDir, 'cotizador');
if (!fs.existsSync(cotizadorDir)) {
  fs.mkdirSync(cotizadorDir, { recursive: true });
}
fs.writeFileSync(path.join(cotizadorDir, 'index.html'), cotizadorHtml, 'utf8');
console.log('✅ Pre-rendered /cotizador/index.html');

// Generate /marca/[slug] prerender
const uniqueBrandsMap = new Map();
products.forEach(p => {
  const brand = (p.brand && p.brand !== 'null') ? String(p.brand).trim() : '';
  if (brand && brand.toLowerCase() !== 'ch') {
    const slug = slugify(brand);
    if (!uniqueBrandsMap.has(slug)) {
      uniqueBrandsMap.set(slug, { name: brand, products: [] });
    }
    uniqueBrandsMap.get(slug).products.push(p);
  }
});

let brandCount = 0;
for (const [slug, brandData] of uniqueBrandsMap.entries()) {
  const brandName = brandData.name;
  const brandTitle = `Armazones ${brandName} en Zapopan | Óptica Lensique`;
  const brandDesc = `Armazones ${brandName} originales en Zapopan. Examen de vista sin costo con oftalmólogo. Envío gratis en compras mayores a $2,500. Cotiza en línea.`;
  const brandCanonical = `https://www.lensique.com.mx/marca/${slug}`;
  sitemapUrls.push(brandCanonical);
  
  const brandHeadInjection = `
    <title>${brandTitle}</title>
    <meta name="description" content="${brandDesc}" />
    <link rel="canonical" href="${brandCanonical}" />
    <meta property="og:title" content="${brandTitle}" />
    <meta property="og:description" content="${brandDesc}" />
    <meta property="og:url" content="${brandCanonical}" />
    <meta property="og:type" content="website" />
  `;
  
  const productsHtml = brandData.products.slice(0, 24).map(p => 
    `<li>${p.model || p.name} - $${Math.round(p.price_incl_tax)}</li>`
  ).join('');

  const brandBodyInjection = `
    <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
      <h1 style="font-size: 32px; font-weight: 700;">Armazones ${brandName} en Zapopan | Óptica Lensique</h1>
      <p style="font-size: 16px; color: #4b5563;">Descubre nuestra colección de ${brandName}. Agenda tu examen de vista sin costo con oftalmólogo en Chapalita, Zapopan.</p>
      <ul style="margin-top: 20px;">
        ${productsHtml}
      </ul>
    </div>
  `;

  let brandHtml = indexTemplate;
  if (brandHtml.includes('<title>')) {
    brandHtml = brandHtml.replace(/<title>.*?<\/title>/s, `<title>${brandTitle}</title>`);
  }
  brandHtml = brandHtml.replace('</head>', `${brandHeadInjection}\n</head>`);
  brandHtml = brandHtml.replace('<div id="root"></div>', `<div id="root">${brandBodyInjection}</div>`);

  const brandDir = path.join(distDir, 'marca', slug);
  if (!fs.existsSync(brandDir)) {
    fs.mkdirSync(brandDir, { recursive: true });
  }
  fs.writeFileSync(path.join(brandDir, 'index.html'), brandHtml, 'utf8');
  brandCount++;
}
console.log(`✅ Pre-rendered ${brandCount} brand HTML pages in /dist/marca/[slug]/index.html`);


// Generate /blog prerender
const blogIndexTitle = "Blog de Salud Visual | Óptica Lensique";
const blogIndexDesc = "Consejos, guías y respuestas sobre salud visual, lentes y tratamientos. Todo lo que necesitas saber para cuidar tus ojos, escrito por oftalmólogos.";
const blogIndexCanonical = "https://www.lensique.com.mx/blog";
sitemapUrls.push(blogIndexCanonical);

const blogPostsData = [
  {
    slug: 'cada-cuanto-examen-de-la-vista',
    title: '¿Cada cuánto hacerte un examen de la vista? | Óptica Lensique',
    metaDescription: '¿Cada cuánto debes revisarte la vista? Guía por edad y señales de alerta, explicada por el equipo de Óptica Lensique en Zapopan. Agenda tu examen con oftalmólogo.',
    image: 'https://www.lensique.com.mx/assets/eye_exam_2.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-20T10:00:00Z',
    excerpt: 'Muchos problemas visuales avanzan en silencio, así que revisarte a tiempo es la mejor forma de cuidar tus ojos. Aquí te explicamos cuándo acudir según tu edad y síntomas.',
    body: `# ¿Cada cuánto debes hacerte un examen de la vista?

Es una de las preguntas que más nos hacen en Lensique, y la respuesta corta es: **depende de tu edad y de tus factores de riesgo, pero casi nunca es "solo cuando algo se siente mal".** Muchos problemas visuales avanzan en silencio, así que revisarte a tiempo es la mejor forma de cuidar tus ojos. Aquí te lo explicamos claro.

## La regla general, según tu edad

Aunque cada caso es distinto, estas son las frecuencias que recomiendan los especialistas para una persona sana:

- **Niños y adolescentes:** al menos un examen antes de entrar a primaria, y luego cada año o dos años. La miopía está creciendo rapidísimo en los niños por el uso de pantallas.
- **Adultos de 18 a 39 años:** si ves bien y no tienes molestias ni antecedentes, **cada 1 a 2 años** suele ser suficiente.
- **A partir de los 40 años:** idealmente **una vez al año**. Es la edad en la que aparece la presbicia (el famoso "brazo corto" para leer) y sube el riesgo de otras condiciones.
- **60 años o más:** **revisión anual**, sin excepción.

## Cuándo revisarte antes de lo previsto

No esperes a tu fecha "programada" si notas alguna de estas señales:

- Ves borroso de lejos o de cerca, o te cuesta enfocar.
- Dolores de cabeza frecuentes, sobre todo al final del día.
- Cansancio o ardor en los ojos al usar la computadora o el celular.
- Ves halos alrededor de las luces, o te molesta más la luz de lo normal.
- Ya usas lentes y sientes que "ya no te gradúan" como antes.

Cualquiera de estas es motivo suficiente para agendar una revisión, aunque haya pasado poco tiempo desde la última.

## ¿Por qué revisarte aunque veas bien?

Aquí está lo importante: **algunas de las enfermedades más serias de los ojos no dan síntomas al principio.** El glaucoma, por ejemplo, es conocido como "el ladrón silencioso de la vista" porque puede dañar tu visión sin que lo notes hasta que es difícil recuperarla. Lo mismo pasa con etapas tempranas de la retinopatía diabética.

Un examen no solo mide "cuánto ves": también permite detectar a tiempo estas condiciones. Por eso, si tienes **diabetes, presión alta o antecedentes familiares de glaucoma**, lo recomendable es una revisión **anual**, sin importar tu edad.

## Qué debe incluir un buen examen (y por qué importa quién lo hace)

Un examen de la vista completo va más allá de leer letras en una pantalla. Debe evaluar tu agudeza visual, tu graduación exacta, la salud de la parte frontal e interna del ojo y, cuando corresponde, la presión intraocular.

En **Óptica Lensique** tu examen lo realiza un **oftalmólogo**, no solo un aparato automático. Eso hace la diferencia entre "una graduación aproximada" y una **valoración profesional** que cuida de verdad tu salud visual, y que se refleja en unos lentes que se sienten cómodos desde el primer día.

## En resumen

- Sin problemas y menos de 40 años: **cada 1-2 años**.
- 40 años o más: **cada año**.
- Con síntomas, lentes actuales o factores de riesgo (diabetes, glaucoma en la familia): **anual o antes** si algo cambia.

Cuidar tu vista es más barato y más fácil cuando lo haces a tiempo. Si ya te tocaba o notaste alguna de las señales de arriba, **agenda tu examen con nuestro oftalmólogo en Zapopan** — y de paso, aprovecha para probarte los nuevos armazones. 🔓

> **¿Listo para revisarte?** [Agenda tu cita aquí](/#examen) o escríbenos por WhatsApp. Y si ya tienes tu graduación, puedes elegir tus [Ver nuestro catálogo](/#armazones) en línea y recibirlos en casa o recogerlos en tienda.

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  },
  {
    slug: 'filtro-luz-azul-sirve',
    title: 'Lentes con filtro de luz azul: ¿de verdad sirven? | Óptica Lensique',
    metaDescription: '¿Los lentes con filtro de luz azul reducen la fatiga o protegen tus ojos? Esto es lo que dice la ciencia, explicado con honestidad por Óptica Lensique en Zapopan.',
    image: 'https://www.lensique.com.mx/assets/hero_glasses.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-21T10:00:00Z',
    excerpt: 'Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes. Aquí te explicamos qué es real, qué es marketing, y si de verdad vale la pena.',
    body: `# Lentes con filtro de luz azul: ¿de verdad sirven?

Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes: que si descansa tus ojos, que si te protege de las pantallas, que si te ayuda a dormir. En Lensique preferimos decirte la verdad, aunque no sea la más comercial: **la mayoria de esas promesas no están respaldadas por la ciencia.** Aquí te explicamos qué es real y qué es marketing, para que decidas informado.

## ¿Qué es la luz azul?

Es una parte de la luz visible, de longitud de onda corta y alta energía. La fuente **más grande de luz azul con diferencia es el sol**; las pantallas de tu celular o computadora emiten una cantidad muchísimo menor. Ese dato por sí solo ya pone en perspectiva varias de las promesas que verás abajo.

## Lo que promete el marketing vs. lo que dice la evidencia

**"Reduce la fatiga visual de las pantallas."**
La evidencia dice que **no**. Una revisión sistemática de Cochrane (2023) que analizó varios estudios concluyó que los lentes con filtro de luz azul **no reducen la fatiga visual** por uso de pantallas frente a los lentes normales. La Academia Americana de Oftalmología tampoco los recomienda para eso. La fatiga frente a pantallas viene de que **parpadeamos menos**, del esfuerzo de enfoque sostenido y del deslumbramiento, no de la luz azul.

**"Protege tus ojos del daño de las pantallas."**
**No hay evidencia** de que la luz azul que emiten las pantallas dañe la retina o cause enfermedades oculares. Las cantidades son bajas y muy lejanas a las del sol. Aquí el que sí importa es el sol: para proteger tus ojos a largo plazo, lo respaldado es usar **lentes con protección UV** al aire libre.

**"Te ayuda a dormir mejor."**
Esta es la más matizada. La luz azul por la noche sí puede afectar tu ritmo de sueño, pero la evidencia de que unos lentes lo mejoren es **débil y mixta**. Lo que de verdad funciona es **reducir pantallas antes de dormir** y usar el modo nocturno del dispositivo.

## Entonces, ¿por qué alguien elegiría un filtro de luz azul?

No todo es blanco o negro. Hay razones **legítimas** para elegirlo, siempre que no esperes un milagro de salud:

- **Comodidad subjetiva:** a algunas personas simplemente les resulta más cómodo el tono, sobre todo de noche. Si a ti te gusta, es válido.
- **Estética:** ciertos filtros reducen el reflejo azulado en fotos y videollamadas.

Lo importante es que lo elijas **sabiendo qué hace y qué no**, no porque un anuncio te prometió proteger tu vista.

## Lo que SÍ ayuda a tus ojos frente a las pantallas

Si lo que buscas es dejar de sentir los ojos cansados, esto es lo que de verdad tiene respaldo:

- **La regla 20-20-20:** cada 20 minutos, mira algo a 20 pies (unos 6 metros) durante 20 segundos.
- **Parpadea a conciencia** y usa lágrimas artificiales si sientes los ojos secos.
- **Cuida la iluminación** para reducir reflejos y deslumbramiento en la pantalla.
- **Antirreflejante (AR):** este sí tiene un beneficio real y notable — **reduce los reflejos** de la pantalla y las luces, y mejora la nitidez y el confort. Es, honestamente, mucho más útil que un filtro azul.
- **La graduación correcta:** gran parte de la "fatiga" es simplemente una graduación mal hecha o desactualizada. Un examen bien hecho lo resuelve.

## En resumen

El filtro de luz azul **no reduce la fatiga ni protege tus ojos del daño de las pantallas** — eso es marketing, no ciencia. Si te gusta por comodidad, adelante; pero si tu meta es sentirte mejor frente a la computadora, invierte en un **antirreflejante** y, sobre todo, en una **graduación correcta**.

En Óptica Lensique preferimos que gastes tu dinero en lo que de verdad funciona. Si quieres, **agenda tu examen con nuestro oftalmólogo** y te asesoramos con honestidad sobre qué micas te convienen —incluido el antirreflejante— según tu caso. 🔓

**¿Los ojos cansados frente a la pantalla?** [Agenda tu cita aquí](/#examen) y te decimos qué necesitas de verdad. También puedes [Ver nuestras micas](/#micas) o [Ir al cotizador](/cotizador).

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. Basado en evidencia científica disponible (revisión Cochrane 2023; recomendaciones de la Academia Americana de Oftalmología). No sustituye una consulta profesional.*`
  }
];

function cleanMetaTags(html) {
  let cleaned = html.replace(/<title>.*?<\/title>/si, '');
  cleaned = cleaned.replace(/<meta name="description"[^>]*>/gi, '');
  cleaned = cleaned.replace(/<meta property="og:[^>]*>/gi, '');
  return cleaned;
}

const blogIndexHeadInjection = `
    <title>${blogIndexTitle}</title>
    <meta name="description" content="${blogIndexDesc}" />
    <link rel="canonical" href="${blogIndexCanonical}" />
    <meta property="og:title" content="${blogIndexTitle}" />
    <title>${blogIndexTitle}</title>
    <meta name="description" content="${blogIndexDesc}" />
    <link rel="canonical" href="${blogIndexCanonical}" />
    <meta property="og:title" content="${blogIndexTitle}" />
    <meta property="og:description" content="${blogIndexDesc}" />
    <meta property="og:url" content="${blogIndexCanonical}" />
    <meta property="og:type" content="website" />
`;

const blogIndexBodyInjection = `
  <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;">
    <h1 style="font-size: 32px; font-weight: 700;">Blog de Salud Visual</h1>
    ${blogPostsData.map(p => `<article style="margin-bottom: 24px;"><h2 style="font-size: 24px;"><a href="/blog/${p.slug}">${p.title}</a></h2><p>${p.excerpt}</p></article>`).join('')}
  </div>
`;

let blogIndexHtml = indexTemplate;
blogIndexHtml = cleanMetaTags(blogIndexHtml);
blogIndexHtml = blogIndexHtml.replace('</head>', `${blogIndexHeadInjection}\n</head>`);
blogIndexHtml = blogIndexHtml.replace('<div id="root"></div>', `<div id="root">${blogIndexBodyInjection}</div>`);

const blogDir = path.join(distDir, 'blog');
if (!fs.existsSync(blogDir)) {
  fs.mkdirSync(blogDir, { recursive: true });
}
fs.writeFileSync(path.join(blogDir, 'index.html'), blogIndexHtml, 'utf8');
console.log('✅ Pre-rendered /blog/index.html');

// Generate /blog/:slug prerender
for (const post of blogPostsData) {
  const postTitle = post.title;
  const postDesc = post.metaDescription;
  const postCanonical = `https://www.lensique.com.mx/blog/${post.slug}`;
  sitemapUrls.push(postCanonical);
  
  const postJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription,
    "image": post.image,
    "datePublished": post.datePublished,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Óptica Lensique",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.lensique.com.mx/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": postCanonical
    }
  };

  const postHeadInjection = `
    <title>${postTitle}</title>
    <meta name="description" content="${postDesc}" />
    <link rel="canonical" href="${postCanonical}" />
    <meta property="og:title" content="${postTitle}" />
    <meta property="og:description" content="${postDesc}" />
    <meta property="og:image" content="${post.image}" />
    <meta property="og:url" content="${postCanonical}" />
    <meta property="og:type" content="article" />
    <meta property="article:published_time" content="${post.datePublished}" />
    <meta property="article:author" content="${post.author}" />
    <script type="application/ld+json">${JSON.stringify(postJsonLd)}</script>
  `;

  const fullBodyHtml = marked.parse(post.body);

  const postBodyInjection = `
    <div style="max-width: 800px; margin: 40px auto; padding: 24px; font-family: sans-serif;" class="blog-content-wrapper">
      <h1 style="font-size: 32px; font-weight: 700; margin-bottom: 24px;">${postTitle}</h1>
      <img src="${post.image}" alt="${post.title}" style="width: 100%; max-height: 400px; object-fit: cover; margin-bottom: 24px; border-radius: 8px;" />
      ${fullBodyHtml}
    </div>
  `;

  let postHtml = indexTemplate;
  postHtml = cleanMetaTags(postHtml);
  postHtml = postHtml.replace('</head>', `${postHeadInjection}\n</head>`);
  postHtml = postHtml.replace('<div id="root"></div>', `<div id="root">${postBodyInjection}</div>`);

  const postDir = path.join(blogDir, post.slug);
  if (!fs.existsSync(postDir)) {
    fs.mkdirSync(postDir, { recursive: true });
  }
  fs.writeFileSync(path.join(postDir, 'index.html'), postHtml, 'utf8');
}
console.log(`✅ Pre-rendered ${blogPostsData.length} blog post HTML pages in /dist/blog/[slug]/index.html`);


// 2. Generate sitemap.xml
const todayStr = new Date().toISOString().split('T')[0];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${todayStr}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${url.includes('/producto/') ? '0.8' : '1.0'}</priority>
  </url>`).join('\n')}
</urlset>`;

fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemapXml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', 'sitemap.xml'), sitemapXml, 'utf8');
console.log(`✅ Generated /sitemap.xml with ${sitemapUrls.length} URLs.`);

// 3. Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://www.lensique.com.mx/sitemap.xml
`;

fs.writeFileSync(path.join(distDir, 'robots.txt'), robotsTxt, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', 'robots.txt'), robotsTxt, 'utf8');
console.log('✅ Generated /robots.txt with Sitemap directive.');

// 4. Generate 404.html page to prevent soft 404s
const fourOhFourHtml = `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8" />
  <title>Página no encontrada (404) | Óptica Lensique</title>
  <meta name="robots" content="noindex, nofollow" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { font-family: sans-serif; text-align: center; padding: 60px 20px; background: #f8f6f2; color: #1b2436; margin: 0; }
    .card { max-width: 500px; margin: 0 auto; background: #ffffff; padding: 40px 24px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
    h1 { font-size: 32px; font-weight: 700; margin: 0 0 12px; color: #1b2436; }
    p { font-size: 16px; color: #666; margin: 0 0 28px; line-height: 1.5; }
    a { display: inline-block; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 - Producto no encontrado</h1>
    <p>El producto o enlace que buscas no existe en nuestro catálogo.</p>
    <a href="https://www.lensique.com.mx/armazones">Explorar Catálogo</a>
  </div>
</body>
</html>`;

fs.writeFileSync(path.join(distDir, '404.html'), fourOhFourHtml, 'utf8');
fs.writeFileSync(path.join(rootDir, 'public', '404.html'), fourOhFourHtml, 'utf8');
console.log('✅ Generated /404.html page.');
