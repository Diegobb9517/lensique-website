import img1 from '../assets/eye_exam_2.jpg';
import img2 from '../assets/blue_light_laptop.jpg';
import img3 from '../assets/lentes_progresivos.jpg';

export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  author: string;
  datePublished: string;
  image: string;
  excerpt: string;
  body: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'monofocal-bifocal-o-progresivo',
    title: 'Monofocales, bifocales o progresivos: ¿cuál necesitas? | Óptica Lensique',
    metaDescription: 'Diferencias claras entre micas monofocales, bifocales y progresivas: para quién es cada una, ventajas, adaptación y precio. Explicado por Óptica Lensique, Zapopan.',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: new Date().toISOString(),
    image: 'https://www.lensique.com.mx/blog/monofocal-bifocal-o-progresivo.jpg',
    excerpt: '¿Te dijeron que necesitas ver de lejos y de cerca? Conoce las diferencias reales entre monofocal, bifocal y progresivo para tomar la mejor decisión.',
    body: `# Monofocales, bifocales o progresivos: ¿cuál necesitas?

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

> **¿Quieres saber cuál te toca?** [Agenda tu examen con nuestro oftalmólogo](/agendar-cita) o [explora el catálogo](/catalogo) y prueba el asistente de micas: te muestra monofocal, bifocal y progresivo con su precio, sin sorpresas.

---
*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  },

  {
    slug: 'cada-cuanto-examen-de-la-vista',
    title: '¿Cada cuánto hacerte un examen de la vista? | Óptica Lensique',
    metaDescription: '¿Cada cuánto debes revisarte la vista? Guía por edad y señales de alerta, explicada por el equipo de Óptica Lensique en Zapopan. Agenda tu examen con oftalmólogo.',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-20T10:00:00Z',
    image: img1,
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

> **¿Listo para revisarte?** [Agenda tu cita aquí](/#servicios) o escríbenos por WhatsApp. Y si ya tienes tu graduación, puedes elegir tus [Ver nuestro catálogo](/catalogo) en línea y recibirlos en casa o recogerlos en tienda.

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  },
  {
    slug: 'filtro-luz-azul-sirve',
    title: 'Lentes con filtro de luz azul: ¿de verdad sirven? | Óptica Lensique',
    metaDescription: '¿Los lentes con filtro de luz azul reducen la fatiga o protegen tus ojos? Esto es lo que dice la ciencia, explicado con honestidad por Óptica Lensique en Zapopan.',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-21T10:00:00Z',
    image: img2,
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

**¿Los ojos cansados frente a la pantalla?** [Agenda tu cita aquí](/#servicios) y te decimos qué necesitas de verdad. También puedes [Ver nuestras micas](/#micas) o [Ir al cotizador](/cotizador).

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. Basado en evidencia científica disponible (revisión Cochrane 2023; recomendaciones de la Academia Americana de Oftalmología). No sustituye una consulta profesional.*`
  },
  {
    slug: 'monofocal-bifocal-o-progresivo',
    title: 'Monofocales, bifocales o progresivos: ¿cuál necesitas? | Óptica Lensique',
    metaDescription: 'Diferencias claras entre micas monofocales, bifocales y progresivas: para quién es cada una, ventajas, adaptación y precio. Explicado por Óptica Lensique, Zapopan.',
    author: 'Equipo Óptica Lensique (revisado por oftalmólogo)',
    datePublished: '2024-03-22T10:00:00Z',
    image: 'https://www.lensique.com.mx/blog/monofocal-bifocal-o-progresivo.jpg',
    excerpt: 'Si te acaban de decir que necesitas "ver de lejos y de cerca", tarde o temprano vas a escuchar estas tres palabras. Aquí te explicamos cada una sin tecnicismos.',
    body: `# Monofocales, bifocales o progresivos: ¿cuál necesitas?

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
*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  }
];

