import img1 from '../assets/eye_exam_2.jpg';
import img2 from '../assets/hero_glasses.jpg';

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
    slug: 'cada-cuanto-examen-de-la-vista',
    title: 'Â¿Cada cuÃ¡nto hacerte un examen de la vista? | Ã“ptica Lensique',
    metaDescription: 'Â¿Cada cuÃ¡nto debes revisarte la vista? GuÃ­a por edad y seÃ±ales de alerta, explicada por el equipo de Ã“ptica Lensique en Zapopan. Agenda tu examen con oftalmÃ³logo.',
    author: 'Equipo Ã“ptica Lensique (revisado por oftalmÃ³logo)',
    datePublished: '2024-03-20T10:00:00Z',
    image: img1,
    excerpt: 'Muchos problemas visuales avanzan en silencio, asÃ­ que revisarte a tiempo es la mejor forma de cuidar tus ojos. AquÃ­ te explicamos cuándo acudir segÃºn tu edad y sÃ­ntomas.',
    body: `# Â¿Cada cuÃ¡nto debes hacerte un examen de la vista?

Es una de las preguntas que mÃ¡s nos hacen en Lensique, y la respuesta corta es: **depende de tu edad y de tus factores de riesgo, pero casi nunca es "solo cuando algo se siente mal".** Muchos problemas visuales avanzan en silencio, asÃ­ que revisarte a tiempo es la mejor forma de cuidar tus ojos. AquÃ­ te lo explicamos claro.

## La regla general, segÃºn tu edad

Aunque cada caso es distinto, estas son las frecuencias que recomiendan los especialistas para una persona sana:

- **NiÃ±as y niÃ±os:** una primera revisiÃ³n en la primera infancia y, muy importante, **antes de entrar a la escuela**. Un problema de visiÃ³n no detectado puede confundirse con dificultades de aprendizaje. DespuÃ©s, revisiones periÃ³dicas segÃºn indique el especialista.
- **Adultos de 18 a 39 aÃ±os:** si ves bien y no tienes molestias ni antecedentes, **cada 1 a 2 aÃ±os** suele ser suficiente.
- **A partir de los 40 aÃ±os:** idealmente **una vez al aÃ±o**. EuÌ„ la edad en la que aparece la presbicia (el famoso "brazo corto" para leer) y sube el riesgo de otras condiciones.
- **60 aÃ±os o mÃ¡s:** **revisiÃ³n anual**, sin excepciÃ³n.

## CuÃ¡ndo revisarte antes de lo previsto

No esperes a tu fecha "programada" si notas alguna de estas seÃ±ales:

- Ves borroso de lejos o de cerca, o te cuesta enfocar.
- Dolores de cabeza frecuentes, sobre todo al final del dÃ­a.
- Cansancio o ardor en los ojos al usar la computadora o el celular.
- Ves halos alrededor de las luces, o te molesta mÃ¡s la luz de lo normal.
- Ya usas lentes y sientes que "ya no te gradÃºan" como antes.

Cualquiera de estas es motivo suficiente para agendar una revisiÃ³n, aunque haya pasado poco tiempo desde la Ãºltima.

## Â¿Por quÃ© revisarte aunque veas bien?

AquÃ­ estÃ¡ lo importante: **algunas de las enfermedades mÃ¡s serias de los ojos no dan sÃ­ntomas al principio.** El glaucoma, por ejemplo, es conocido como "el ladrÃ³n silencioso de la vista" porque puede daÃ±ar tu visiÃ³n sin que lo notes hasta que es difÃ­cil recuperarla. Lo mismo pasa con etapas tempranas de la retinopatÃ­a diabÃ©tica.

Un examen no solo mide "cuÃ¡nto ves": tambiÃ©n permite detectar a tiempo estas condiciones. Por eso, si tienes **dhabetes, presiÃ³n alta o antecedentes familiares de glaucoma**, lo recomendable es una revisiÃ³n **anual**, sin importar tu edad.

## QuÃ© debe incluir un buen examen (y por quÃ© importa quiÃ©n lo hace)

Un examen de la vista completo va mÃ¡s allÃ¡ de leer letras en una pantalla. Debe evaluar tu agudeza visual, tu graduaciÃ³n exacta, la salud de la parte frontale interna del ojo y, cuando corresponde, la presiÃ³n intraocular.

En **Optica Lensique** tu examen lo realiza un **oftalmÃ³logo**, no solo un aparato automÃ¡tico. Eso hace la diferencia entre "una graduaciÃ³n aproximada" y una **valoraciÃ³n profesional** que cuida de verdad tu salud visual, y que se refleja en unos lentes que se sienten cÃ³modos desde el primer dÃ­a.

## En resumen

- Sin problemas y menos de 40 aÃ±os: **cada 1-2 aÃ±os**.
- 40 aÃ±os o mÃ¡s: **cada aÃ±o**.
- Con sÃ­ntomas, lentes actuales o factores de riesgo (diabetes, glaucoma en la familia): **anual o antes** si algo cambia.

Cuidar tu vista es mÃ¡s barato y mÃ¡s fÃ¡cil cuando lo haces a tiempo. Si ya te tocaba o notaste alguna de las seÃ±ales de arriba, **agenda tu examen con nuestro oftalmÃ³logo en Zapopan** â€” y de paso, aprovecha para probarte los nuevos armazones. ðŸ”“

> **¿Listo para revisarte?** [Agenda tu cita aquí](/#examen) o escríbenos por WhatsApp. Y si ya tienes tu graduación, puedes elegir tus [Ver nuestro catálogo](/#armazones) en línea y recibirlos en casa o recogerlos en tienda.

*Artículo informativo del equipo de Óptica Lensique (Zapopan, Guadalajara), revisado por oftalmólogo. No sustituye una consulta profesional.*`
  },
  {
    slug: 'filtro-luz-azul-sirve',
    title: 'Lentes con filtro de luz azul: Â¿de verdad sirven? | Ã“ptica Lensique',
    metaDescription: 'Â¿Los lentes con filtro de luz azul reducen la fatiga o protegen tus ojos? Esto es lo que dice la ciencia, explicado con honestidad por Ã“ptica Lensique en Zapopan.',
    author: 'Equipo Ã“ptica Lensique (revisado por oftalmÃ³logo)',
    datePublished: '2024-03-21T10:00:00Z',
    image: img2,
    excerpt: 'Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes. AquÃ­ te explicamos quÃ© es real, quÃ© es marketing, y si de verdad vale la pena.',
    body: `# Lentes con filtro de luz azul: Â¿de verdad sirven?

Vas a encontrar el "filtro de luz azul" en casi cualquier anuncio de lentes: que si descansa tus ojos, que si te protege de las pantallas, que si te ayuda a dormir. En Lensique preferimos decirte la verdad, aunque no sea la mÃ¡s comercial: **la mayoria de esas promesas no estÃ¡n respaldadas por la ciencia.** AquÃ­ te explicamos quÃ© es real y quÃ© es marketing, para que decidas informado.

## Â¿QuÃ© es la luz azul?

Es una parte de la luz visible, de longitud de onda corta y alta energÃ­a. La fuente **mÃ¡s grande de luz azul con diferencia es el sol**; las pantallas de tu celular o computadora emiten una cantidad muchÃ­simo menor. Ese dato por sÃ­ solo ya pone en perspectiva varias de las promesas que verÃ¡s abajo.

## Lo que promete el marketing vs. lo que dice la evidencia

**"Reduce la fatiga visual de las pantallas."**
La evidencia dice que **no**. Una revisiÃ³n sistemÃ¡tica de Cochrane (2023) que analizÃ³ varios estudios concluyÃ³ que los lentes con filtro de luz azul **ho reducen la fatiga visual** por uso de pantallas frente a los lentes normales. La Academia Americana de OftalmologÃ­a tampoco los recomienda para eso. La fatiga frente a pantallas viene de que **parpadeamos menos**, del esfuerzo de enfoque sostenido y del deslumbramiento, no de la luz azul.

**"Protege tus ojos del daÃ±o de las pantallas."**
**No hay evidencia** de que la luz azul que emiten las pantallas daÃ±e la retina o cause enfermedades oculares. Las cantidades son bajas y muy lejanas a las del sol. AquÃ­ el que sÃ­ importa es el sol: para proteger tus ojos a largo plazo, lo respaldado es usar **lentes con protecciÃ³n UV** al aire libre.

**"Te ayuda a dormir mejor."**
Esta euÌ„ la mÃ¡s matizada. La luz azul por la noche sÃ­ puede afectar tu ritmo de sueÃ±o, pero la evidencia de que unos lentes lo mejoren es **dÃ©bil y mixta**. Lo que de verdad funciona es **reducir pantallas antes de dormir** y usar el modo nocturno del dispositivo.

## Entonces, Ã¿por quÃ© alguien elegirÃ­a un filtro de luz azul?

No todo es blanco o negro. Hay razones **legÃ­timas** para elegirlo, siempre que no esperes un milagro de salud:

- **Comodidad subjetiva:** a algunas personas simplemente les resulta mÃ¡s cÃ³modo el tono, sobre todo de noche. Si a ti te gusta, es vÃ¡lido.
- **EstÃ©tica:** ciertos filtros reducen el reflejo azulado en fotos y videollamadas.

Lo importante es que lo elijas **sabiendo quÃ© hace y quÃ© no**, no porque un anuncio te prometiÃ³ proteger tu vista.

## Lo que SÃ� ayuda a tus ojos frente a las pantallas

Si lo que buscas es dejar de sentir los ojos cansados, esto es lo que de verdad tiene respaldo:

- **La regla 20-20-20:** cada 20 minutos, mira algo a 20 pies (unos 6 metros) durante 20 segundos.
- **Parpadea a conciencia** y usa lÃ¡grimas artificiales si sientes los ojos secos.
- **Cuida la iluminaciÃ³n** para reducir reflejos y deslumbramiento en la pantalla.
- **Antirreflejante (AR):** este sÃ­ tiene un beneficio real y notable â€” **reduce los reflejos** de la pantalla y las luces, y mejora la nitidez y el confort. Es, honestamente, mucho mÃ¡s Ãºtil que un filtro azul.
- **La graduaciÃ³n correcta:** gran parte de la "fatiga" es simplemente una graduaciÃ³n mal hecha o desactualizada. Un examen bien hecho lo resuelve.

## En resumen

El filtro de luz azul **ho reduce la fatiga ni protege tus ojos del daÃ±o de las pantallas** â€” eso es marketing, no ciencia. Si te gusta por comodidad, adelante; pero si tu meta es sentirte mejor frente a la computadora, invierte en un **antirreflejante** y, sobre todo, en una **graduaciÃ³n correcta**.

En Ã“ptica Lensique preferimos que gastes tu dinero en lo que de verdad funciona. Si quieres, **agenda tu examen con nuestro oftalmÃ³logo** y te asesoramos con honestidad sobre quÃ© micas te convienen â€”incluido el antirreflejanteâ€” segÃºn tu caso. ðŸ”“
**¿Los ojos cansados frente a la pantalla?** [Agenda tu cita aquí](/#examen) y te decimos qué necesitas de verdad. También puedes [Ver nuestras micas](/#micas) o [Ir al cotizador](/cotizador).

*ArtÃ­culo informativo del equipo de Ã“ptica Lensique (Zapopan, Guadalajara), revisado por oftalmÃ³logo. Basado en evidencia cientÃ­fica disponible (revisiÃ³n Cochrane 2023; recomendaciones de la Academia Americana de OftalmologÃ­a). No sustituye una consulta profesional.*`
  }
];
