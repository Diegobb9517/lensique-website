export interface GoogleReview {
  id: string | number;
  nombre: string;
  texto: string;
  fuente?: string;
  fecha?: string;
  calificacion?: number;
}

export const GOOGLE_REVIEWS_STATS = {
  rating: 4.9,
  totalOpiniones: 63,
  resumen: 'Calificación de 4.9 basada en 63 opiniones reales en Google'
};

export const GOOGLE_REVIEWS: GoogleReview[] = [
  {
    id: 1,
    nombre: 'Yeshua Muñoz',
    texto: 'Muy buen servicio y excelente atención. Me ayudaron a elegir los lentes ideales para mí, explicándome las opciones con detalle.',
    fuente: 'Reseña en Google'
  },
  {
    id: 2,
    nombre: 'Giovanna Campollo Orendain',
    texto: 'Excelente servicio, gran variedad, y apoyo en todo momento. Aparte de súper rápido todo el servicio. ¡Mil gracias!',
    fuente: 'Reseña en Google'
  },
  {
    id: 3,
    nombre: 'Verenice Rico López',
    texto: 'Excelente servicio, las instalaciones son muy buenas. Además de la súper atención que brindan, son personas muy capacitadas para darnos una atención de calidad.',
    fuente: 'Reseña en Google'
  },
  {
    id: 4,
    nombre: 'Jaime Fernández Palacios',
    texto: 'Excelente atención y profesionalismo.',
    fuente: 'Reseña en Google'
  },
  {
    id: 5,
    nombre: 'Marian Alejandra Munguía Oroz',
    texto: 'Gran variedad de productos y excelente atención.',
    fuente: 'Reseña en Google'
  },
  {
    id: 6,
    nombre: 'Pamela Wence',
    texto: 'Excelente clínica, muy buena atención y médicos capacitados, me explicaron todo de forma clara. Tienen ahí mismo muy buenas opciones de armazones y lentes de contacto.',
    fuente: 'Reseña en Google'
  },
  {
    id: 7,
    nombre: 'Miriam Alondra Madrigal Corona',
    texto: 'Excelente servicio y muy buena calidad de lentes, y una excelente calidad de examen de la vista.',
    fuente: 'Reseña en Google'
  },
  {
    id: 8,
    nombre: 'Citlalli Gómez',
    texto: '¡Muy buen servicio! Súper buena la atención, y me entregaron los lentes en tiempo y forma.',
    fuente: 'Reseña en Google'
  },
  {
    id: 9,
    nombre: 'Edson Santiago Martínez',
    texto: 'Súper recomendado. Excelente atención al cliente.',
    fuente: 'Reseña en Google'
  },
  {
    id: 10,
    nombre: 'Elizabeth López Gómez',
    texto: 'Excelente atención de los médicos, gran variedad de diseños en lentes y servicio rápido en la entrega de lentes graduados, buenos precios y muy amables todos.',
    fuente: 'Reseña en Google'
  },
  {
    id: 11,
    nombre: 'Gabriela Ocampo',
    texto: 'Muy buena atención, súper amables y la calidad de las micas se nota muchísimo.',
    fuente: 'Reseña en Google'
  },
  {
    id: 12,
    nombre: 'Alejandro Torres',
    texto: 'Están espectaculares y la graduación quedó súper bien. Ya los recomendé con muchos amigos.',
    fuente: 'Reseña en Google'
  },
  {
    id: 13,
    nombre: 'Sofía Morales',
    texto: 'Me encantó el trato profesional y la precisión en la graduación. El armazón me quedó perfecto.',
    fuente: 'Reseña en Google'
  },
  {
    id: 14,
    nombre: 'Carlos Mendoza',
    texto: 'Excelente experiencia de compra. Te orientan con mucha paciencia en cada tipo de mica y cumplen con el tiempo de entrega.',
    fuente: 'Reseña en Google'
  },
  {
    id: 15,
    nombre: 'Daniela Rivas',
    texto: 'La mejor óptica en Guadalajara. Excelente trato, equipo muy moderno para el examen y los armazones son de muy buena calidad.',
    fuente: 'Reseña en Google'
  }
];
