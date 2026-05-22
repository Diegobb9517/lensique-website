import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';

interface TechnologyInfoPageProps {
  tech: {
    title: string;
    image_url?: string;
    image?: string;
  };
  resolvedImage: string;
  onBack: () => void;
  onBook: () => void;
}

const TECH_INFO: Record<string, { desc: string, benefits: string[] }> = {
  'Monofocales': {
    desc: 'Visión clara a una sola distancia. Ideales para corregir miopía, hipermetropía o astigmatismo. Nuestras micas monofocales cuentan con diseño delgado y tratamientos de alta calidad para uso diario.',
    benefits: [
      'Visión nítida en toda la superficie de la lente',
      'Diseño ultra delgado y ligero',
      'Tratamiento antirreflejante y protección UV'
    ]
  },
  'Bifocales Flat Top': {
    desc: 'Dos campos de visión en una misma lente, separados por una línea visible. Perfectos para leer y ver de lejos sin tener que cambiar de lentes constantemente.',
    benefits: [
      'Segmento de lectura amplio y definido',
      'Fácil adaptación',
      'Ideal para quienes requieren ver de cerca frecuentemente'
    ]
  },
  'Bifocales Invisibles': {
    desc: 'La funcionalidad de un bifocal tradicional, pero sin la línea divisoria visible. Estética superior que mantiene la misma practicidad para visión lejana y cercana.',
    benefits: [
      'Estética mejorada sin línea visible',
      'Visión lejana y cercana en una sola lente',
      'Transición sutil entre zonas de visión'
    ]
  },
  'Progresivos': {
    desc: 'Visión natural a todas las distancias: lejos, intermedio y cerca. Sin líneas visibles, ofrecen la transición más suave y la tecnología más avanzada para la presbicia.',
    benefits: [
      'Visión continua en todas las distancias',
      'Estética perfecta sin divisiones visibles',
      'Adaptación rápida con diseños de última generación'
    ]
  }
};

const defaultInfo = {
  desc: 'Tecnología de vanguardia para brindar la mejor experiencia visual. Materiales premium y recubrimientos especializados para máxima comodidad y protección.',
  benefits: [
    'Alta resistencia y durabilidad',
    'Claridad visual superior',
    'Protección contra rayos UV'
  ]
};

const TechnologyInfoPage: React.FC<TechnologyInfoPageProps> = ({ tech, resolvedImage, onBack, onBook }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Normalizar el título para buscar en el diccionario (ignora mayúsculas/minúsculas y espacios extra)
  const infoKey = Object.keys(TECH_INFO).find(k => k.toLowerCase() === tech.title.toLowerCase()) || '';
  const info = TECH_INFO[infoKey] || defaultInfo;

  return (
    <motion.div 
      className="tech-info-page"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="tech-nav">
        <button onClick={onBack} className="tech-back-btn">
          <ArrowLeft size={24} />
          <span>Volver al inicio</span>
        </button>
      </div>

      <div className="tech-content-wrapper">
        <div className="tech-hero-section">
          <div className="tech-hero-img-container">
            <img src={resolvedImage} alt={tech.title} className="tech-hero-img" />
            <div className="tech-hero-overlay"></div>
          </div>
          
          <div className="tech-info-content">
            <span className="tech-eyebrow">Tecnología Visual</span>
            <h1 className="tech-title">{tech.title}</h1>
            <p className="tech-description">{info.desc}</p>
            
            <div className="tech-benefits">
              <h3 className="tech-benefits-title">Beneficios Principales</h3>
              <ul className="tech-benefits-list">
                {info.benefits.map((benefit, idx) => (
                  <li key={idx} className="tech-benefit-item">
                    <CheckCircle2 className="tech-benefit-icon" size={20} />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="tech-cta-box">
              <p>¿Te gustaría probar o conocer más sobre <strong>{tech.title}</strong>?</p>
              <button onClick={onBook} className="btn btn-primary btn-tech-book">
                <Calendar size={18} style={{ marginRight: '8px' }} />
                Agendar Cita Ahora
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TechnologyInfoPage;
