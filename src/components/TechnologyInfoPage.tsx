import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Calendar } from 'lucide-react';
import monofocalImg from '../assets/monofocal.png';
import flattopImg from '../assets/bifocal-flat-top.png';
import invisibleImg from '../assets/bifocal-invisible.png';
import progressiveImg from '../assets/progressive.png';
import blueFilterImg from '../assets/blue-filter.png';
import photochromicImg from '../assets/photochromic.png';
import arImg from '../assets/cv-7600.jpg'; // Using clinic equipment as placeholder for AR/Custom
import customImg from '../assets/DSC09650.jpg'; // Workshop image

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

const TECH_INFO: Record<string, { desc: string, benefits: string[], altImage?: string }> = {
  'Monofocales': {
    desc: 'Visión clara a una sola distancia. Ideales para corregir miopía, hipermetropía o astigmatismo. Nuestras micas monofocales cuentan con diseño delgado y tratamientos de alta calidad para uso diario.',
    benefits: [
      'Visión nítida en toda la superficie de la lente',
      'Diseño ultra delgado y ligero',
      'Tratamiento antirreflejante y protección UV'
    ],
    altImage: monofocalImg
  },
  'Bifocales Flat Top': {
    desc: 'Dos campos de visión en una misma lente, separados por una línea visible. Perfectos para leer y ver de lejos sin tener que cambiar de lentes constantemente.',
    benefits: [
      'Segmento de lectura amplio y definido',
      'Fácil adaptación',
      'Ideal para quienes requieren ver de cerca frecuentemente'
    ],
    altImage: flattopImg
  },
  'Bifocales Invisibles': {
    desc: 'La funcionalidad de un bifocal tradicional, pero sin la línea divisoria visible. Estética superior que mantiene la misma practicidad para visión lejana y cercana.',
    benefits: [
      'Estética mejorada sin línea visible',
      'Visión lejana y cercana en una sola lente',
      'Transición sutil entre zonas de visión'
    ],
    altImage: invisibleImg
  },
  'Progresivos': {
    desc: 'Visión natural a todas las distancias: lejos, intermedio y cerca. Sin líneas visibles, ofrecen la transición más suave y la tecnología más avanzada para la presbicia.',
    benefits: [
      'Visión continua en todas las distancias',
      'Estética perfecta sin divisiones visibles',
      'Adaptación rápida con diseños de última generación'
    ],
    altImage: progressiveImg
  },
  'Fotocromático': {
    desc: 'Micas inteligentes que se oscurecen automáticamente con la luz del sol y se aclaran en interiores. Ofrecen la protección ideal sin necesidad de cambiar de lentes.',
    benefits: [
      'Protección 100% contra los rayos UV',
      'Comodidad visual en cualquier condición de luz',
      'Reducen el deslumbramiento y la fatiga'
    ],
    altImage: photochromicImg
  },
  'Luz azul': {
    desc: 'Protección especializada contra la luz azul nociva emitida por pantallas digitales. Ideal para quienes pasan muchas horas frente a la computadora, tablet o celular.',
    benefits: [
      'Previene la fatiga ocular y el dolor de cabeza',
      'Mejora el ciclo de sueño',
      'Ideal para trabajo de oficina y gamers'
    ],
    altImage: blueFilterImg
  },
  'Trabajos personalizados': {
    desc: 'Realizamos tratamientos y diseños a la medida: entintados sólidos, entintados con degradados y polarizados. Dale un toque único a tu estilo y eleva tu protección visual.',
    benefits: [
      'Entintados de distintos colores y niveles de opacidad',
      'Degradados perfectos para un look moderno',
      'Micas polarizadas para eliminar reflejos extremos del sol'
    ],
    altImage: customImg
  },
  'Antirreflejantes': {
    desc: 'Tratamiento de alta tecnología que elimina los reflejos molestos en la superficie de la lente. Permite que tus ojos sean el centro de atención y brinda una visión excepcionalmente nítida.',
    benefits: [
      'Reduce deslumbramientos al manejar de noche',
      'Estética impecable, la mica parece invisible',
      'Aumenta la claridad y confort visual'
    ],
    altImage: arImg
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
          <div className="tech-hero-img-container" style={{ backgroundColor: '#f0f0f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img 
              src={info.altImage || resolvedImage} 
              alt={tech.title} 
              className="tech-hero-img" 
              style={{ objectFit: info.altImage ? 'contain' : 'cover', padding: info.altImage ? '40px' : '0' }} 
            />
            {!info.altImage && <div className="tech-hero-overlay"></div>}
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
