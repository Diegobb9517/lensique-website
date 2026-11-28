import React, { useEffect } from 'react';
import './ExamenVistaPage.css';
import { 
  Calendar, ShieldCheck, Eye, Clock, MapPin, 
  MessageCircle, CheckCircle2, Award, Stethoscope, 
  Layers, ArrowRight, Glasses, Sparkles 
} from 'lucide-react';

import cv7600Img from '../assets/cv-7600.jpg';
import clinicRoomImg from '../assets/clinic-room.jpg';
import slitLampImg from '../assets/slit_lamp_exam.jpg';

interface ExamenVistaPageProps {
  onOpenBooking: (reason?: string) => void;
  onOpenCatalog?: () => void;
  onOpenCotizador?: () => void;
  contactWhatsapp?: string;
  contactLocation?: string;
}

export const ExamenVistaPage: React.FC<ExamenVistaPageProps> = ({
  onOpenBooking,
  onOpenCatalog,
  onOpenCotizador,
  contactWhatsapp = '+52 33 1692 9111',
  contactLocation = 'Av. Guadalupe 1296, Jardines de San Ignacio, 45040 Zapopan, Jal.'
}) => {
  useEffect(() => {
    document.title = 'Examen de la vista en Zapopan y Guadalajara | Óptica Lensique';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const cleanPhone = (contactWhatsapp || '523316929111').replace(/\D/g, '');

  return (
    <div className="examen-page-wrapper">
      {/* 1. Hero Editorial */}
      <section className="examen-hero">
        <div className="examen-hero-container">
          <div className="examen-hero-badge">
            <Stethoscope size={16} />
            <span>Salud Visual · Zapopan y Guadalajara</span>
          </div>
          <h1 className="examen-hero-title">Examen de la vista en Zapopan</h1>
          <p className="examen-hero-text">
            Evaluación clínica integral realizada por especialista y con respaldo de oftalmólogo en Chapalita. 
            Tecnología diagnóstica digital para determinar tu graduación exacta con absoluta precisión y comodidad.
          </p>
          <div className="examen-hero-actions">
            <button 
              className="examen-btn-primary"
              onClick={() => onOpenBooking('Examen de la Vista')}
            >
              <Calendar size={18} />
              <span>Agendar mi examen</span>
            </button>
            <a 
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent('Hola, me gustaría agendar un examen de la vista en Óptica Lensique')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="examen-btn-secondary"
            >
              <MessageCircle size={18} />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Key Pillars Bar */}
      <div className="examen-pillars-bar">
        <div className="examen-pillars-grid">
          <div className="examen-pillar-item">
            <div className="examen-pillar-icon"><Award size={22} /></div>
            <div>
              <div className="examen-pillar-title">Atención por especialista</div>
              <div className="examen-pillar-desc">Consulta personalizada respaldada por oftalmólogo.</div>
            </div>
          </div>
          <div className="examen-pillar-item">
            <div className="examen-pillar-icon"><Sparkles size={22} /></div>
            <div>
              <div className="examen-pillar-title">Tecnología CV-7600</div>
              <div className="examen-pillar-desc">Foróptero digital para graduaciones exactas sin fatiga.</div>
            </div>
          </div>
          <div className="examen-pillar-item">
            <div className="examen-pillar-icon"><ShieldCheck size={22} /></div>
            <div>
              <div className="examen-pillar-title">Garantía de adaptación</div>
              <div className="examen-pillar-desc">Ajuste fino garantizado para tus nuevas micas o pupilentes.</div>
            </div>
          </div>
          <div className="examen-pillar-item">
            <div className="examen-pillar-icon"><Clock size={22} /></div>
            <div>
              <div className="examen-pillar-title">Rápido y preciso (10-15 min)</div>
              <div className="examen-pillar-desc">Evaluación ágil y exacta con tecnología digital, sin esperas.</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. What includes */}
      <section className="examen-section">
        <div className="examen-section-header">
          <span className="examen-section-eyebrow">Diagnóstico integral</span>
          <h2 className="examen-section-title">¿Qué incluye tu examen de la vista en Lensique?</h2>
          <p className="examen-section-subtitle">
            Un examen visual profesional va mucho más allá de leer letras en una cartilla. 
            Realizamos una valoración clínica completa para cuidar tu salud visual y tu rendimiento diario.
          </p>
        </div>

        <div className="examen-steps-grid">
          <div className="examen-step-card">
            <span className="examen-step-number">Paso 01</span>
            <h3 className="examen-step-title">Refracción digital computarizada</h3>
            <p className="examen-step-desc">
              Medición automatizada de tu sistema óptico para detectar con precisión milimétrica miopía, astigmatismo, hipermetropía o presbicia.
            </p>
          </div>

          <div className="examen-step-card">
            <span className="examen-step-number">Paso 02</span>
            <h3 className="examen-step-title">Graduación con foróptero digital</h3>
            <p className="examen-step-desc">
              Utilizamos el foróptero computarizado CV-7600 para alternar lentes al instante, evitando el cansancio visual y logrando la graduación más nítida.
            </p>
          </div>

          <div className="examen-step-card">
            <span className="examen-step-number">Paso 03</span>
            <h3 className="examen-step-title">Agudeza y balance binocular</h3>
            <p className="examen-step-desc">
              Evaluación de visión lejana, intermedia (computadora) y cercana (lectura/celular), asegurando que ambos ojos trabajen en perfecta armonía.
            </p>
          </div>

          <div className="examen-step-card">
            <span className="examen-step-number">Paso 04</span>
            <h3 className="examen-step-title">Asesoría óptica personalizada</h3>
            <p className="examen-step-desc">
              Te explicamos con honestidad qué tipo de micas (monofocales, progresivos, filtro azul ZEISS BlueGuard o fotocromáticos) se adaptan mejor a tu estilo de vida.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Frequency by Age */}
      <section className="examen-freq-bg">
        <div className="examen-section">
          <div className="examen-section-header">
            <span className="examen-section-eyebrow">Prevención y cuidado</span>
            <h2 className="examen-section-title">¿Cada cuánto debes realizarte un examen de la vista?</h2>
            <p className="examen-section-subtitle">
              La visión cambia de manera gradual. Un chequeo oportuno previene dolores de cabeza, fatiga visual y deterioro no detectado.
            </p>
          </div>

          <div className="examen-freq-grid">
            <div className="examen-freq-card">
              <span className="examen-freq-tag">Niños y Jóvenes (hasta 17 años)</span>
              <h3 className="examen-freq-title">Desarrollo visual y aprendizaje</h3>
              <div className="examen-freq-cadence">Revisión recomendada: Cada año</div>
              <p className="examen-freq-text">
                El 80% de lo que aprende un niño entra por la vista. Un examen anual descarta miopía progresiva, astigmatismo y problemas de enfoque escolar.
              </p>
            </div>

            <div className="examen-freq-card">
              <span className="examen-freq-tag">Adultos (18 a 39 años)</span>
              <h3 className="examen-freq-title">Trabajo digital y pantallas</h3>
              <div className="examen-freq-cadence">Revisión recomendada: Cada 1 a 2 años</div>
              <p className="examen-freq-text">
                Indispensable si trabajas más de 6 horas diarias frente a computadora o celular. Monitoreamos fatiga visual, resequedad y ligeros cambios de graduación.
              </p>
            </div>

            <div className="examen-freq-card">
              <span className="examen-freq-tag">A partir de los 40 años</span>
              <h3 className="examen-freq-title">Presbicia y salud preventiva</h3>
              <div className="examen-freq-cadence">Revisión recomendada: Cada año</div>
              <p className="examen-freq-text">
                A partir de los 40 años disminuye la elasticidad natural del cristalino (dificultad para leer de cerca). Valoramos soluciones progresivas personalizadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Technology & Clinic */}
      <section className="examen-section">
        <div className="examen-section-header">
          <span className="examen-section-eyebrow">Precisión e Innovación</span>
          <h2 className="examen-section-title">Equipo de alta precisión en nuestro consultorio</h2>
          <p className="examen-section-subtitle">
            Combinamos tecnología óptica avanzada con un trato cercano y profesional para garantizar que tu graduación sea exacta desde el primer día.
          </p>
        </div>

        <div className="examen-tech-grid">
          <div className="examen-tech-card">
            <div className="examen-tech-imgwrap">
              <img src={cv7600Img} alt="Foróptero digital CV-7600 en Óptica Lensique" loading="lazy" decoding="async" width="400" height="220" />
            </div>
            <div className="examen-tech-body">
              <h3 className="examen-tech-name">Foróptero digital CV-7600</h3>
              <p className="examen-tech-desc">
                Sistema computarizado de cambio de lentes que permite comparar opciones de graduación en milisegundos, eliminando dudas y fatiga.
              </p>
            </div>
          </div>

          <div className="examen-tech-card">
            <div className="examen-tech-imgwrap">
              <img src={clinicRoomImg} alt="Consultorio optométrico en Zapopan Lensique" loading="lazy" decoding="async" width="400" height="220" />
            </div>
            <div className="examen-tech-body">
              <h3 className="examen-tech-name">Consultorio clínico privado</h3>
              <p className="examen-tech-desc">
                Espacio acogedor y tranquilo en Zapopan, diseñado para que tu consulta sea relajada, sin prisas ni interrupciones.
              </p>
            </div>
          </div>

          <div className="examen-tech-card">
            <div className="examen-tech-imgwrap">
              <img src={slitLampImg} alt="Examen con lámpara de hendidura en Lensique" loading="lazy" decoding="async" width="400" height="220" />
            </div>
            <div className="examen-tech-body">
              <h3 className="examen-tech-name">Biomicroscopía ocular</h3>
              <p className="examen-tech-desc">
                Lámpara de hendidura para inspeccionar con detalle la salud de la córnea, la superficie ocular y la adaptación para lentes de contacto.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Location & Map */}
      <section className="examen-section" style={{ paddingTop: 0 }}>
        <div className="examen-location-card">
          <div className="examen-location-info">
            <span className="examen-section-eyebrow">Ubicación</span>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '30px', color: '#15223e', margin: '0 0 16px' }}>
              Visítanos en Chapalita, Zapopan
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Nuestro consultorio está ubicado en una zona céntrica y accesible de Zapopan, con estacionamiento cercano y fácil acceso.
            </p>

            <div className="examen-loc-item">
              <div className="examen-loc-icon"><MapPin size={20} /></div>
              <div>
                <div className="examen-loc-title">Dirección</div>
                <div className="examen-loc-desc">{contactLocation}</div>
              </div>
            </div>

            <div className="examen-loc-item">
              <div className="examen-loc-icon"><Clock size={20} /></div>
              <div>
                <div className="examen-loc-title">Horarios de atención</div>
                <div className="examen-loc-desc">
                  Lunes a Viernes: 10:00 AM – 8:00 PM<br />
                  Sábados: 10:00 AM – 5:00 PM
                </div>
              </div>
            </div>

            <div className="examen-loc-item">
              <div className="examen-loc-icon"><MessageCircle size={20} /></div>
              <div>
                <div className="examen-loc-title">WhatsApp y Citas</div>
                <div className="examen-loc-desc">{contactWhatsapp}</div>
              </div>
            </div>

            <button 
              className="examen-btn-primary" 
              onClick={() => onOpenBooking('Examen de la Vista')}
              style={{ marginTop: '10px', alignSelf: 'flex-start' }}
            >
              <Calendar size={18} />
              <span>Agendar cita ahora</span>
            </button>
          </div>

          <div className="examen-map-wrap">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.3776262453664!2d-103.4009712850734!3d20.65431698620248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ae7d4a46a489%3A0x6b8f75c6c06b29f!2sAv.%20Guadalupe%201296%2C%20Chapalita%2C%2044500%20Guadalajara%2C%20Jal.%2C%20Mexico!5e0!3m2!1sen!2sus!4v1711949100000!5m2!1sen!2sus"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="examen-map-frame"
              title="Ubicación de Óptica Lensique en Zapopan"
            />
          </div>
        </div>
      </section>

      {/* 7. Cross-linking / Next steps */}
      <section className="examen-section" style={{ paddingTop: 0 }}>
        <div className="examen-section-header" style={{ marginBottom: '32px' }}>
          <span className="examen-section-eyebrow">Complementa tu visita</span>
          <h2 className="examen-section-title">Elige la mejor opción para tu visión</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <Glasses size={28} style={{ color: '#15223e', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#15223e', margin: '0 0 8px' }}>Armazones de diseñador</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, flex: 1, margin: '0 0 20px' }}>
              Encuentra armazones que armonicen con tus facciones y reflejen tu estilo personal.
            </p>
            <a 
              href="/catalogo" 
              onClick={(e) => {
                if (onOpenCatalog) {
                  e.preventDefault();
                  onOpenCatalog();
                }
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0284c7', textDecoration: 'none', fontSize: '14px' }}
            >
              <span>Explorar catálogo</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <Layers size={28} style={{ color: '#15223e', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#15223e', margin: '0 0 8px' }}>Micas ZEISS</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, flex: 1, margin: '0 0 20px' }}>
              Tecnología óptica alemana: antirreflejante DuraVision, filtro azul BlueGuard y progresivos de alta gama.
            </p>
            <a 
              href="/micas" 
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/micas');
                window.dispatchEvent(new PopStateEvent('popstate'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0284c7', textDecoration: 'none', fontSize: '14px' }}
            >
              <span>Conocer micas ZEISS</span>
              <ArrowRight size={16} />
            </a>
          </div>

          <div style={{ background: '#f8fafc', padding: '28px', borderRadius: '18px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <Eye size={28} style={{ color: '#15223e', marginBottom: '14px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#15223e', margin: '0 0 8px' }}>Lentes de contacto</h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, flex: 1, margin: '0 0 20px' }}>
              Marcas líderes originales (Acuvue, Biofinity, Air Optix) con asesoría de adaptación por especialista.
            </p>
            <a 
              href="/lentes-de-contacto" 
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(null, '', '/lentes-de-contacto');
                window.dispatchEvent(new PopStateEvent('popstate'));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0284c7', textDecoration: 'none', fontSize: '14px' }}
            >
              <span>Ver lentes de contacto</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* 8. Final CTA Banner */}
      <div className="examen-cta-banner">
        <h2 className="examen-cta-title">Tu salud visual merece la mejor atención</h2>
        <p className="examen-cta-text">
          Agenda tu examen de la vista hoy mismo en Zapopan. Vive una experiencia clínica confortable y obtén una graduación respaldada por especialistas.
        </p>
        <button 
          className="examen-cta-btn"
          onClick={() => onOpenBooking('Examen de la Vista')}
        >
          <Calendar size={20} />
          <span>Agendar mi cita en Lensique</span>
        </button>
      </div>
    </div>
  );
};

export default ExamenVistaPage;
