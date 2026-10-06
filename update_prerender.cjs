const fs = require('fs');
const path = require('path');
let content = fs.readFileSync('scripts/prerender.js', 'utf8');

const newPostStr = `,
  {
    slug: 'monofocal-bifocal-o-progresivo',
    title: 'Monofocales, bifocales o progresivos: ¿cuál necesitas? | Óptica Lensique',
    metaDescription: 'Diferencias claras entre micas monofocales, bifocales y progresivas: para quién es cada una, ventajas, adaptación y precio. Explicado por Óptica Lensique, Zapopan.',
    image: 'https://www.lensique.com.mx/assets/lentes_progresivos.jpg',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-22T10:00:00Z',
    excerpt: 'Si te acaban de decir que necesitas "ver de lejos y de cerca", tarde o temprano vas a escuchar estas tres palabras. Aquí te explicamos cada una sin tecnicismos.',
    faq: [
      {
        question: "¿Cuánto tarda uno en acostumbrarse a los progresivos?",
        answer: "La mayoría se adapta en unos días; algunas personas tardan hasta dos semanas. Ayuda usarlos de forma continua desde el primer día y mover la cabeza (no solo los ojos) para enfocar. Si después de dos semanas no te acomodas, vuelve con nosotros: revisamos el centrado y la graduación, y aplica nuestra garantía de adaptación."
      },
      {
        question: "¿Los progresivos sirven para la computadora?",
        answer: "Sí, la zona intermedia está pensada para eso. Si trabajas muchas horas frente a pantalla, coméntalo en tu examen: existen diseños con zona intermedia más amplia."
      },
      {
        question: "¿Puedo usar bifocales si ya usé progresivos?",
        answer: "Sí. No hay problema en cambiar de un tipo a otro; solo requiere un breve reajuste."
      },
      {
        question: "¿Cada cuánto debo revisar mi graduación si uso progresivos?",
        answer: "A partir de los 40, lo recomendable es una revisión anual: la presbicia avanza gradualmente y la graduación de cerca suele cambiar."
      }
    ],
    body: \`# Monofocales, bifocales o progresivos: ¿cuál necesitas?

Si te acaban de decir que ya necesitas "ver de lejos y de cerca", o si tienes más de 40 y las letras chicas empezaron a alejarse, tarde o temprano vas a escuchar estas tres palabras: **monofocal, bifocal y progresivo**. Son los tres tipos de micas que existen, y elegir bien entre ellas cambia por completo cómo se sienten tus lentes todos los días. Aquí te explicamos cada una sin tecnicismos, para quién es y qué esperar.

## Primero, ¿por qué hay tres tipos?

Todo se reduce a **cuántas distancias necesitas corregir**:

- Si solo necesitas ver bien **de lejos** (miopía) o **solo de cerca** (hipermetropía o vista cansada), te basta **una** graduación.
- Si necesitas **ambas** —lo más común a partir de los 40, cuando aparece la presbicia—, necesitas que una misma mica te dé **dos o más** distancias.

De ahí salen las tres opciones.

## Monofocales: una sola distancia

La mica monofocal tiene **una sola graduación en toda su superficie**. Es la más sencilla, la más económica y la que usa la mayoría de las personas menores de 40.

- **Para quién:** miopía, hipermetropía o astigmatismo cuando solo necesitas corregir una distancia. También para quien usa lentes "solo para leer" o "solo para manejar".
- **Ventajas:** campo de visión completo, cero adaptación, precio más accesible.
- **Límite:** si ya necesitas lejos y cerca, tendrías que cargar dos pares (o quitarte los lentes para leer).

## Bifocales: dos distancias con una línea visible

La bifocal tiene **dos zonas**: la parte superior para lejos y una "ventanita" inferior para cerca, separadas por una **línea visible**.

- **Para quién:** personas con presbicia que quieren una solución práctica y económica, y a quienes no les molesta la línea.
- **Ventajas:** funciona muy bien para lejos y cerca, adaptación rápida, cuesta menos que un progresivo.
- **Límites:** no tiene distancia intermedia (la de la computadora), el salto entre zonas se nota, y la línea es visible desde afuera. Por eso hoy se usan cada vez menos.

## Progresivos: lejos, intermedio y cerca, sin línea

El progresivo corrige **todas las distancias en una sola mica**, con una transición suave de arriba (lejos) al centro (intermedio, como la computadora) y abajo (cerca, como el celular). **No tiene línea**: por fuera se ve como un lente normal.

- **Para quién:** la mayoría de las personas con presbicia que quieren un solo par para todo el día.
- **Ventajas:** visión natural a todas las distancias, estética limpia, un solo par de lentes.
- **Lo que debes saber:** requiere un **periodo de adaptación** (normalmente unos días, a veces un par de semanas) porque el cerebro aprende a "buscar" cada zona moviendo la cabeza y no solo los ojos. Y la calidad del diseño importa muchísimo: un progresivo de entrada tiene campos más estrechos; uno de gama alta tiene zonas más amplias y una adaptación más fácil.

## Comparación rápida

| | Monofocal | Bifocal | Progresivo |
|---|---|---|---|
| Distancias | 1 | 2 (lejos y cerca) | 3 (lejos, intermedio y cerca) |
| Línea visible | No | Sí | No |
| Adaptación | Ninguna | Rápida | Días a semanas |
| Computadora | Solo si es "de cerca" | No cubre bien | Sí |
| Precio | El más accesible | Intermedio | El más alto (varía por diseño) |

## ¿Cuál te conviene? Tres preguntas que te lo dicen

1. **¿Necesitas ver bien a más de una distancia?** Si no, monofocal y listo.
2. **¿Pasas horas frente a la computadora?** Si sí y necesitas dos distancias, el progresivo es la opción que cubre el intermedio; la bifocal no.
3. **¿Te importa que no se note la línea?** Si sí, progresivo. Si te da igual y buscas lo más práctico y económico para lejos y cerca, la bifocal sigue siendo válida.

Y una honesta: **el progresivo no es para todos.** Hay personas a las que, por su graduación o su forma de trabajar, les funciona mejor una bifocal o incluso dos monofocales (uno para lejos, otro para cerca). Por eso la decisión final debe tomarse **con tu graduación en la mano y con un especialista**, no solo con una tabla.

## ¿Y el precio?

Aquí va el dato que casi nadie explica: **el precio de un lente completo es el armazón más las micas**, y las micas cambian según el tipo. En Lensique lo mostramos desde el principio para que no haya sorpresas: cada armazón del catálogo ya incluye micas monofocales antirreflejantes en el precio que ves, y si necesitas bifocales o progresivos, el asistente te muestra exactamente cuánto suma cada opción **antes** de decidir. Un progresivo de entrada cuesta menos de lo que muchos creen, y los de gama alta se justifican cuando pasas el día cambiando de distancia.

## Preguntas frecuentes

**¿Cuánto tarda uno en acostumbrarse a los progresivos?**
La mayoría se adapta en unos días; algunas personas tardan hasta dos semanas. Ayuda usarlos de forma continua desde el primer día y mover la cabeza (no solo los ojos) para enfocar. Si después de dos semanas no te acomodas, vuelve con nosotros: revisamos el centrado y la graduación, y aplica nuestra garantía de adaptación.

**¿Los progresivos sirven para la computadora?**
Sí, la zona intermedia está pensada para eso. Si trabajas muchas horas frente a pantalla, coméntalo en tu examen: existen diseños con zona intermedia más amplia.

**¿Puedo usar bifocales si ya usé progresivos?**
Sí. No hay problema en cambiar de un tipo a otro; solo requiere un breve reajuste.

**¿Cada cuánto debo revisar mi graduación si uso progresivos?**
A partir de los 40, lo recomendable es una revisión anual: la presbicia avanza gradualmente y la graduación de cerca suele cambiar.

## En resumen

- **Una distancia:** monofocal.
- **Lejos y cerca, práctico y económico, línea visible:** bifocal.
- **Todas las distancias, sin línea, un solo par:** progresivo (con periodo de adaptación).

La mejor forma de decidir es con tu graduación actual y una valoración. En **Óptica Lensique**, en Zapopan, tu examen lo realiza un **oftalmólogo**, y con tu graduación puedes elegir armazón y micas en el asistente de nuestro sitio, ver el precio total desde el inicio, y recibir tus lentes en casa o recogerlos en tienda.

> **¿Quieres saber cuál te toca?** [Agenda tu examen con nuestro oftalmólogo](/#servicios) o [explora el catálogo](/catalogo) y prueba el asistente de [micas](/#micas): te muestra monofocal, bifocal y progresivo con su precio, sin sorpresas.

---
*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*\`/n  }`;

content = content.replace(`No sustituye una consulta profesional.*\`/n  }\n];`, `No sustituye una consulta profesional.*\`` + newPostStr + `\n];`);

// Now update JSON-LD to include FAQPage if present
const oldJsonLd = `const postJsonLd = {
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
  };`;

const newJsonLd = `const jsonLdNodes = [
    {
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
    }
  ];
  
  if (post.faq) {
    jsonLdNodes.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": post.faq.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    });
  }`;

content = content.replace(oldJsonLd, newJsonLd);
content = content.replace(`JSON.stringify(postJsonLd)`, `JSON.stringify(jsonLdNodes)`);

// 404 Replace
const old404 = `// 4. Generate 404.html page to prevent soft 404s
const fourOhFourHtml = \`<!doctype html>
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
</html>\`;`;

const new404 = `// 4. Generate 404.html page to prevent soft 404s
const fourOhFourHtml = \`<!doctype html>
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
    .btn { display: inline-block; padding: 14px 28px; background: #1b2436; color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: 600; margin: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>404 - Página no encontrada</h1>
    <p>El enlace que buscas no existe o cambió.</p>
    <a href="https://www.lensique.com.mx/catalogo" class="btn">Ir al catálogo</a>
    <a href="https://www.lensique.com.mx/blog" class="btn">Ir al blog</a>
  </div>
</body>
</html>\`;`;

content = content.replace(old404, new404);

fs.writeFileSync('scripts/prerender.js', content);
console.log('DONE');
