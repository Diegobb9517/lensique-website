import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "¿El examen de la vista tiene costo?",
    answer: "No, nuestro examen de la vista es completamente gratis, sin compromiso de compra."
  },
  {
    question: "¿Cuánto tarda mi pedido?",
    answer: "Armazones en stock están listos en 2-3 días. Lentes sobre pedido toman de 1-2 semanas más el tiempo de fabricación de las micas. Los lentes de contacto esféricos tardan 3-5 días y los tóricos 1-2 semanas."
  },
  {
    question: "¿Puedo pagar en línea?",
    answer: "Sí, aceptamos pagos 100% seguros a través de Mercado Pago. Todos los pedidos en línea pasan por una revisión por nuestro optometrista. Si tu receta no procede o hay algún problema, te reembolsamos el 100% inmediatamente."
  },
  {
    question: "¿Hacen envíos?",
    answer: "¡Claro! Puedes recoger gratis en tienda, el envío local (ZMG) tiene un costo de $150 MXN, y el envío nacional $250 MXN. En pedidos mayores a $2,500 MXN el envío es gratis."
  },
  {
    question: "¿Tienen garantía?",
    answer: "Sí, todos nuestros lentes cuentan con garantía de adaptación (si no te acostumbras a la graduación te los cambiamos) y garantía contra defectos de fábrica en micas y armazones."
  },
  {
    question: "¿Aceptan receta de otro lugar?",
    answer: "Sí, aceptamos recetas recientes de otros especialistas. Solo necesitas proporcionarnos los datos al realizar tu pedido."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="faq-section" style={{ padding: '80px 24px', backgroundColor: '#ffffff' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="hero-eyebrow">Dudas comunes</span>
          <h2 className="section-title" style={{ margin: 0 }}>Preguntas Frecuentes</h2>
        </div>
        
        <div className="faq-accordion" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`faq-item ${isOpen ? 'open' : ''}`}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  backgroundColor: isOpen ? '#f8fafc' : '#ffffff',
                  boxShadow: isOpen ? '0 4px 12px rgba(0,0,0,0.03)' : 'none'
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 24px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#1e293b',
                    fontWeight: 600,
                    fontSize: '16px'
                  }}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <div style={{ color: '#64748b', transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                
                <div 
                  className="faq-answer-container"
                  style={{
                    maxHeight: isOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}
                >
                  <div style={{ padding: '0 24px 20px 24px', color: '#475569', fontSize: '15px', lineHeight: '1.6' }}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
