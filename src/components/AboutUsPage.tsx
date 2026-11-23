import React from 'react';
import { MapPin, Clock, ShieldCheck, Eye, Sparkles, ArrowRight, Calendar, MessageCircle } from 'lucide-react';
import './AboutUsPage.css';

import clinicWideImg from '../assets/DSC00118.jpg';
import storeShowroomImg from '../assets/store_showroom.jpg';
import slitLampExamImg from '../assets/slit_lamp_exam.jpg';
import waitingRoomImg from '../assets/waiting_room.jpg';
import framesDisplayImg from '../assets/frames_display.jpg';
import cv7600Img from '../assets/cv7600_phoropter.jpg';
import hallwayGardenImg from '../assets/hallway_garden.jpg';
import storeFacadeImg from '../assets/store_facade.jpg';
import micasImg from '../assets/DSC09710.jpg';

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
  aboutText = 'En Óptica Lensique combinamos el cuidado experto de tu salud visual con una cuidada selección de armazones de diseño. Nacimos en Zapopan para ofrecerte un espacio moderno, cercano y transparente donde cuidar tus ojos sea una experiencia cómoda y personalizada.'
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
          <span className="about-section-badge">Nuestra Casa de Visión</span>
          <h2 className="about-section-title">Conoce nuestros espacios</h2>
          <p className="about-section-subtitle">
            Diseñamos cada rincón pensando en tu comodidad: un consultorio moderno para cuidar tu vista y una boutique donde elegir tus lentes se siente como en casa.
          </p>
        </div>

        <div className="about-gallery-grid">
          {/* Foto 1: Consultorio completo (Featured Full Width) */}
          <div className="about-card-featured">
            <div className="about-card-img-wrap">
              <img
                src={clinicWideImg}
                alt="Consultorio privado y examen de la vista en Óptica Lensique"
                className="about-card-img"
                loading="eager"
                decoding="async"
              />
              <div className="about-card-overlay">
                <span className="about-card-tag">Consultorio Principal</span>
                <h3 className="about-card-title">Tu examen de la vista en un espacio privado y tranquilo</h3>
                <p className="about-card-desc">
                  Un entorno cómodo y equipado con tecnología digital de vanguardia para revisar tu graduación y cuidar la salud de tus ojos sin prisas.
                </p>
              </div>
            </div>
          </div>

          {/* Foto 2: Showroom de armazones (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src={storeShowroomImg}
                alt="Showroom y probadores de armazones en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Boutique & Probadores</span>
              <h3 className="about-card-title">Elige tus armazones con calma y buena luz</h3>
              <p className="about-card-desc">
                Vitrinas abiertas con luz natural, probadores y asesoría personalizada para que encuentres el estilo que mejor va con tu rostro y tu día a día.
              </p>
            </div>
          </div>

          {/* Foto 3: Examen clínico con paciente (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src={slitLampExamImg}
                alt="Revisión visual personalizada con especialista en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Atención Personalizada</span>
              <h3 className="about-card-title">Revisión detallada por optometristas certificados</h3>
              <p className="about-card-desc">
                Nos tomamos el tiempo de evaluar la salud de tus ojos, explicarte cada resultado con total claridad y recomendarte la solución visual ideal para ti.
              </p>
            </div>
          </div>

          {/* Foto 4: Sala de espera (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={waitingRoomImg}
                alt="Sala de espera cómoda en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Recepción</span>
              <h3 className="about-card-title">Una bienvenida cálida y puntual</h3>
              <p className="about-card-desc">
                Una sala cómoda y tranquila pensada para que te relajes mientras te recibimos a la hora acordada, sin largas esperas.
              </p>
            </div>
          </div>

          {/* Foto 5: Detalle de armazones en madera (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={framesDisplayImg}
                alt="Armazones oftálmicos de calidad en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Armazones de Calidad</span>
              <h3 className="about-card-title">Materiales ligeros, duraderos y cómodos</h3>
              <p className="about-card-desc">
                Seleccionamos monturas en acetato pulido, titanio y metales flexibles que no pesan y se adaptan de forma natural a tus facciones.
              </p>
            </div>
          </div>

          {/* Foto 6: Foróptero Digital (Third width) */}
          <div className="about-card-third">
            <div className="about-card-img-wrap">
              <img
                src={cv7600Img}
                alt="Tecnología de graduación digital en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Graduación Digital</span>
              <h3 className="about-card-title">Medición exacta para tu graduación</h3>
              <p className="about-card-desc">
                Tecnología digital que nos permite ajustar tus lentes con máxima nitidez, ideal para graduaciones altas, astigmatismo o progresivos.
              </p>
            </div>
          </div>

          {/* Foto 7: Pasillo con jardín interior (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src={hallwayGardenImg}
                alt="Instalaciones con jardín interior en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Nuestras Instalaciones</span>
              <h3 className="about-card-title">Espacios amplios y con luz natural</h3>
              <p className="about-card-desc">
                Un diseño arquitectónico pensado para brindarte tranquilidad, con áreas verdes interiores que llenan de frescura cada rincón.
              </p>
            </div>
          </div>

          {/* Foto 8: Micas y laboratorio ZEISS (Half width) */}
          <div className="about-card-half">
            <div className="about-card-img-wrap">
              <img
                src={micasImg}
                alt="Laboratorio de micas oftálmicas ZEISS en Óptica Lensique"
                className="about-card-img"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="about-card-body">
              <span className="about-card-tag">Micas Oftálmicas</span>
              <h3 className="about-card-title">Tecnología alemana ZEISS en tus lentes</h3>
              <p className="about-card-desc">
                Montaje de alta precisión con tratamientos antirreflejantes, protección contra luz azul de pantallas y filtro UV total.
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

          <div className="about-location-media">
            <div className="about-location-facade">
              <img
                src={storeFacadeImg}
                alt="Fachada exterior de Óptica Lensique Casa de Visión en Zapopan"
                className="about-facade-img"
                loading="lazy"
                decoding="async"
              />
              <span className="about-facade-tag">Fachada Exterior · Av. Guadalupe 1296</span>
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
        </div>
      </section>
    </div>
  );
};
