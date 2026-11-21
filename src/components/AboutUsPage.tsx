import React from 'react';
import { MapPin, Clock, ShieldCheck, Eye, Sparkles, ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import './AboutUsPage.css';

import clinicWideImg from '../assets/DSC00118.jpg';
import clinicRoomImg from '../assets/clinic-room.jpg';
import cv7600Img from '../assets/cv-7600.jpg';
import micasImg from '../assets/DSC09710.jpg';
import editorialCarrera from '../assets/editorial-carrera.jpg';

interface AboutUsPageProps {
  onOpenBooking: (serviceName?: string) => void;
  onOpenCatalog: (filter?: string) => void;
  contactWhatsapp?: string;
  contactLocation?: string;
  aboutTitle?: string;
  aboutText?: string;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({
  onOpenBooking,
  onOpenCatalog,
  contactWhatsapp = '523316929111',
  contactLocation = 'Av. Guadalupe 1296, Jardines de San Ignacio, 45040 Zapopan, Jal.',
  aboutTitle = 'Nuestra Pasión es tu Visión',
  aboutText = 'En Óptica Lensique combinamos la precisión técnica de la salud visual con una curaduría de armazones de diseño. Nacimos en Zapopan para ofrecerte un espacio moderno, cercano y transparente donde cuidar tus ojos es una experiencia placentera y personalizada.'
}) => {
  const cleanWa = contactWhatsapp.replace(/\D/g, '');
  const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent('Hola, me gustaría conocer más sobre sus servicios en Óptica Lensique.')}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contactLocation)}`;

  return (
    <div className="about-page-wrapper">
      {/* 1. Hero Editorial */}
      <section className="about-hero">
        <div className="about-hero-container">
          <span className="about-hero-badge">
            <Sparkles size={14} /> Conoce Óptica Lensique · Zapopan, Jal.
          </span>
          <h1 className="about-hero-title">{aboutTitle}</h1>
          <p className="about-hero-text">{aboutText}</p>
          <div className="about-hero-actions">
            <button
              type="button"
              className="about-btn-primary"
              onClick={() => onOpenBooking('Examen de la Vista')}
            >
              <Calendar size={17} />
              Agendar examen de vista
            </button>
            <button
              type="button"
              className="about-btn-secondary"
              onClick={() => onOpenCatalog('Todas')}
            >
              Explorar armazones
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {/* 2. Galería de Instalaciones (Tour Visual) */}
      <section className="about-gallery-section">
        <div className="about-section-header">
          <span className="about-section-badge">Instalaciones & Espacio</span>
          <h2 className="about-section-title">Conoce nuestra óptica</h2>
          <p className="about-section-subtitle">
            Un consultorio moderno equipado con tecnología diagnóstica de alta precisión y un showroom pensado para que encuentres tu armazón ideal con calma y buena luz.
          </p>
        </div>

        <div className="about-gallery-grid">
          {/* Foto 1: Consultorio completo / Gabinete clínico (Featured Full Width) */}
          <div className="about-card-featured">
            <div className="about-card-img-wrap">
              <img
                src={clinicWideImg}
                alt="Consultorio clínico y gabinete de optometría de Óptica Lensique en Zapopan"
                className="about-card-img"
                loading="eager"
                decoding="async"
              />
              <div className="about-card-overlay">
                <span className="about-card-tag">Gabinete Clínico Principal</span>
                <h3 className="about-card-title">Consultorio Integral de Salud Visual</h3>
                <p className="about-card-desc">
                  Espacio privado y climatizado para valoraciones optométricas y oftalmológicas profundas, pruebas de agudeza visual, fondo de ojo y adaptación personalizada de lentes.
                </p>
              </div>
            </div>
          </div>

          {/* Foto 2: Estación de Biomicroscopía (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src={clinicRoomImg}
                alt="Equipo de biomicroscopía y lámpara de hendidura en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Diagnóstico Digital</span>
              <h3 className="about-card-title">Biomicroscopía y Foróptero de Precisión</h3>
              <p className="about-card-desc">
                Instrumentación óptica avanzada para examinar la córnea, el cristalino y determinar tu graduación exacta con la máxima nitidez.
              </p>
            </div>
          </div>

          {/* Foto 3: Boutique de armazones (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src="/images/about-bg.jpg"
                alt="Boutique de armazones y probadores de Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Showroom de Diseño</span>
              <h3 className="about-card-title">Boutique de Armazones Exclusivos</h3>
              <p className="about-card-desc">
                Vitrinas con luz natural y espacio abierto para probarte armazones con calma, asesoría de imagen y acompañamiento experto.
              </p>
            </div>
          </div>

          {/* Foto 4: Analizador CV-7600 (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={cv7600Img}
                alt="Autorefractor CV-7600 de alta tecnología en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Tecnología Digital</span>
              <h3 className="about-card-title">Autorefractor CV-7600</h3>
              <p className="about-card-desc">
                Medición automatizada de refracción para graduaciones complejas y astigmatismos exigentes.
              </p>
            </div>
          </div>

          {/* Foto 5: Micas y laboratorio (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={micasImg}
                alt="Laboratorio de micas oftálmicas y tecnología ZEISS"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Micas de Precisión</span>
              <h3 className="about-card-title">Laboratorio y Alianza ZEISS</h3>
              <p className="about-card-desc">
                Montaje milimétrico con tratamientos antirreflejantes DuraVision®, filtro de luz azul y protección UV total.
              </p>
            </div>
          </div>

          {/* Foto 6: Armazones en acetato premium (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={editorialCarrera}
                alt="Curaduría de armazones de acetato y titanio en Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Curaduría de Marcas</span>
              <h3 className="about-card-title">Materiales y Confort</h3>
              <p className="about-card-desc">
                Acetatos italianos, titanio ultraligero y metales hipoalergénicos ajustados a la anatomía de tu rostro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Pilares de Confianza */}
      <section className="about-pillars-section">
        <div className="about-pillars-container">
          <div className="about-section-header" style={{ marginBottom: '40px' }}>
            <span className="about-section-badge">El Estándar Lensique</span>
            <h2 className="about-section-title">Por qué confiar en nosotros</h2>
            <p className="about-section-subtitle">
              Nuestra prioridad es que disfrutes de una visión perfecta con total transparencia, respaldo profesional y garantía real.
            </p>
          </div>

          <div className="about-pillars-grid">
            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <Eye size={24} />
              </div>
              <h3 className="about-pillar-title">Examen Clínico Exhaustivo</h3>
              <p className="about-pillar-text">
                Evaluaciones visuales completas con equipo digital de vanguardia. Cuidamos no solo cuánto ves, sino la salud integral de tus ojos y tu confort diario.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <ShieldCheck size={24} />
              </div>
              <h3 className="about-pillar-title">Garantía Real de Adaptación</h3>
              <p className="about-pillar-text">
                Si sientes cualquier incomodidad con tu nueva graduación o tus lentes progresivos, te acompañamos y ajustamos tus micas hasta que quedes 100% satisfecho.
              </p>
            </div>

            <div className="about-pillar-card">
              <div className="about-pillar-icon">
                <Sparkles size={24} />
              </div>
              <h3 className="about-pillar-title">Asesoría de Imagen y Estilo</h3>
              <p className="about-pillar-text">
                Te ayudamos a elegir el armazón ideal tomando en cuenta la forma de tu cara, tu puente nasal, tu tipo de mica y tus actividades diarias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Tarjeta de Ubicación y Visita */}
      <section className="about-location-section">
        <div className="about-location-card">
          <div className="about-location-info">
            <h2>Visítanos en Zapopan</h2>
            <p>
              Ven a conocer nuestra boutique, pruébate armazones sin prisas y realiza tu examen de la vista en un ambiente relajado y profesional.
            </p>

            <div className="about-location-items">
              <div className="about-loc-item">
                <MapPin size={20} />
                <div>
                  <strong>Ubicación</strong>
                  {contactLocation}
                </div>
              </div>
              <div className="about-loc-item">
                <Clock size={20} />
                <div>
                  <strong>Horario de atención</strong>
                  Lunes a Viernes: 10:00 a 19:30 hrs<br />
                  Sábados: 10:00 a 18:00 hrs
                </div>
              </div>
            </div>

            <div className="about-location-actions">
              <button
                type="button"
                className="about-btn-white"
                onClick={() => onOpenBooking('Examen de la Vista')}
              >
                <Calendar size={16} />
                Agendar cita
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn-wa"
              >
                <MessageCircle size={16} />
                Escribir por WhatsApp
              </a>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="about-btn-white"
                style={{ background: 'transparent', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
              >
                <MapPin size={16} />
                Ver en Google Maps
              </a>
            </div>
          </div>

          <div className="about-location-map">
            <iframe
              title="Ubicación Óptica Lensique en Zapopan"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.284305786377!2d-103.40742122475355!3d20.65803278090001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ad02cb11b1db%3A0xe74adfcbe3f345c5!2sAv.%20Guadalupe%201296%2C%20Jardines%20de%20San%20Ignacio%2C%2045040%20Zapopan%2C%20Jal.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
