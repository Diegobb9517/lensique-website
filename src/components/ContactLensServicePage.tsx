import React, { useState, useEffect } from 'react';
import {
  Check,
  X,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Eye,
  Calendar,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  RefreshCw,
  Compass,
  Layers,
  Smile
} from 'lucide-react';
import './ContactLensServicePage.css';
import { getOfficialHdImage, getContactLensBrand } from '../lib/productImages';
import { ProductFallbackCard } from './ProductFallbackCard';

import heroImg from '../assets/contact_lens/hero.jpg';
import washImg from '../assets/contact_lens/wash.jpg';
import fingerImg from '../assets/contact_lens/finger.jpg';
import eyeImg from '../assets/contact_lens/eye.jpg';
import blisterImg from '../assets/contact_lens/blister.jpg';
import solutionImg from '../assets/contact_lens/solution.jpg';

interface ContactLensServicePageProps {
  onNavigateToCatalog: (category?: string) => void;
  onOpenWhatsApp: (message?: string) => void;
  onBookExam: () => void;
  onViewProduct?: (product: any) => void;
  featuredProducts?: any[];
  contactWhatsapp?: string;
}

const FeaturedContactLensCardItem = ({
  product,
  imgUrl,
  onViewProduct
}: {
  product: any;
  imgUrl: string | null;
  onViewProduct?: (p: any) => void;
}) => {
  const [hasError, setHasError] = useState(false);
  const brand = getContactLensBrand(product);

  return (
    <div
      className="wp-product-card"
      onClick={() => onViewProduct && onViewProduct(product)}
      style={{ cursor: 'pointer' }}
    >
      <div
        className="wp-card-img-area"
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
          borderRadius: '12px',
          background: '#f8fafc'
        }}
      >
        {hasError || !imgUrl ? (
          <ProductFallbackCard product={product} variant="compact" />
        ) : (
          <img
            src={imgUrl}
            alt={product.name || 'Lente de contacto'}
            className="wp-card-img"
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '10px' }}
            onError={() => setHasError(true)}
          />
        )}
      </div>
      <div className="wp-card-info" style={{ textAlign: 'center', padding: '12px 6px' }}>
        <p className="wp-card-category" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
          {brand}
        </p>
        <h4 className="wp-product-name" style={{ fontSize: '14px', fontWeight: 600, color: '#16223f', margin: '0 0 6px' }}>
          {product.name}
        </h4>
        <div className="wp-product-price" style={{ fontSize: '15px', fontWeight: 700, color: '#16223f' }}>
          {product.price_incl_tax ? `$${Math.round(product.price_incl_tax).toLocaleString('es-MX')}` : (product.price || '')}
          <small style={{ fontSize: '11px', fontWeight: 400, color: '#64748b', marginLeft: '4px' }}>/ caja</small>
        </div>
      </div>
    </div>
  );
};

export const ContactLensServicePage: React.FC<ContactLensServicePageProps> = ({
  onNavigateToCatalog,
  onOpenWhatsApp,
  onBookExam,
  onViewProduct,
  featuredProducts = [],
  contactWhatsapp = '523316929111'
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = 'Lentes de Contacto en Zapopan y Guadalajara | Guía y Compra | Lensique';

    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Descubre cómo usar, ponerte y cuidar tus lentes de contacto en Zapopan y Guadalajara. Guía paso a paso, validación por optometrista y marcas líderes originales.'
      );
    }

    return () => {
      document.title = originalTitle;
      if (metaDesc && originalDesc) {
        metaDesc.setAttribute('content', originalDesc);
      }
    };
  }, []);

  const handleWhatsApp = (text?: string) => {
    const msg = text || 'Hola, tengo dudas sobre lentes de contacto';
    if (onOpenWhatsApp) {
      onOpenWhatsApp(msg);
    } else {
      const cleanPhone = contactWhatsapp.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="cl-page">
      {/* ------------------------------------------------------------------
          Breadcrumb Navigation
          ------------------------------------------------------------------ */}
      <div className="cl-breadcrumb-bar">
        <div className="cl-container">
          <nav className="cl-breadcrumb" aria-label="Ruta de navegación">
            <a href="/" onClick={(e) => { e.preventDefault(); window.location.href = '/'; }}>Inicio</a>
            <span className="cl-breadcrumb-sep">/</span>
            <a href="/#servicios" onClick={(e) => { e.preventDefault(); window.location.href = '/#servicios'; }}>Servicios</a>
            <span className="cl-breadcrumb-sep">/</span>
            <span className="cl-breadcrumb-current">Lentes de contacto</span>
          </nav>
        </div>
      </div>

      {/* ------------------------------------------------------------------
          1. Hero & Intro (Editorial)
          ------------------------------------------------------------------ */}
      <section className="cl-hero">
        <div className="cl-container">
          <div className="cl-badge">
            <Sparkles size={14} color="#2563eb" />
            <span>Servicio Profesional & Guía Práctica</span>
          </div>

          <h1 className="cl-hero-title">Lentes de contacto</h1>
          <p className="cl-hero-subtitle">Visión libre y cómoda</p>

          <p className="cl-hero-intro">
            Los lentes de contacto te dan libertad: ver bien sin que un armazón se interponga, para el deporte, el trabajo o simplemente para verte distinto. Pero no son «una caja que pides y ya» — cada ojo es diferente. Aquí te explicamos cómo usarlos, cómo cuidarlos y cómo elegirlos bien, con la validación de un optometrista de por medio. La idea es que los uses con <strong>seguridad y comodidad</strong>, no a prueba y error.
          </p>

          <div className="cl-hero-actions">
            <button
              className="cl-btn cl-btn-primary"
              onClick={() => onNavigateToCatalog('Lentes de Contacto')}
            >
              <span>Ver lentes de contacto</span>
              <ArrowRight size={16} />
            </button>

            <button
              className="cl-btn cl-btn-secondary"
              onClick={() => handleWhatsApp('Hola, tengo dudas sobre lentes de contacto')}
            >
              <MessageCircle size={16} />
              <span>¿Dudas? Escríbenos por WhatsApp</span>
            </button>

            <button
              className="cl-btn cl-btn-outline"
              onClick={onBookExam}
            >
              <Calendar size={16} />
              <span>Agendar examen de la vista</span>
            </button>
          </div>

          <div className="cl-hero-image-wrap">
            <img
              src={heroImg}
              alt="Lente de contacto transparente con gota de agua sobre superficie cristalina con reflejos limpios"
              className="cl-hero-image"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          2. Guía: Cómo ponerte los lentes de contacto (paso a paso)
          ------------------------------------------------------------------ */}
      <section className="cl-section cl-section-alt" id="como-ponertelos">
        <div className="cl-container">
          <div className="cl-section-header">
            <span className="cl-eyebrow">Paso a paso ilustrado</span>
            <h2 className="cl-section-title">Cómo ponerte los lentes de contacto</h2>
            <p className="cl-section-desc">
              Sigue estos 7 pasos sencillos. Con un poco de práctica, te tomará menos de un minuto cada mañana.
            </p>
          </div>

          {/* Visual Triad Cards */}
          <div className="cl-visual-steps-grid">
            <div className="cl-visual-step-card">
              <div className="cl-visual-step-img-box">
                <img
                  src={washImg}
                  alt="Manos lavándose minuciosamente bajo un chorro de agua limpia antes de manipular lentes de contacto"
                  className="cl-visual-step-img"
                  loading="lazy"
                />
              </div>
              <div className="cl-visual-step-body">
                <span className="cl-visual-step-num">Paso 01 · Higiene previa</span>
                <h3 className="cl-visual-step-heading">Lávate y seca bien las manos</h3>
                <p className="cl-visual-step-text">
                  Usa agua y jabón neutro, y seca bien con una toalla sin pelusa. Es el paso más importante para cuidar tu salud ocular.
                </p>
              </div>
            </div>

            <div className="cl-visual-step-card">
              <div className="cl-visual-step-img-box">
                <img
                  src={fingerImg}
                  alt="Lente de contacto transparente colocado sobre la yema del dedo índice"
                  className="cl-visual-step-img"
                  loading="lazy"
                />
              </div>
              <div className="cl-visual-step-body">
                <span className="cl-visual-step-num">Pasos 02 & 03 · Posición</span>
                <h3 className="cl-visual-step-heading">Revisa forma en la yema</h3>
                <p className="cl-visual-step-text">
                  Pon el lente en la yema del índice y verifica que no esté al revés: debe parecer un tazón con bordes hacia arriba, no un plato abierto.
                </p>
              </div>
            </div>

            <div className="cl-visual-step-card">
              <div className="cl-visual-step-img-box">
                <img
                  src={eyeImg}
                  alt="Acercamiento de colocación suave de lente de contacto transparente en el ojo"
                  className="cl-visual-step-img"
                  loading="lazy"
                />
              </div>
              <div className="cl-visual-step-body">
                <span className="cl-visual-step-num">Pasos 06 & 07 · Colocación</span>
                <h3 className="cl-visual-step-heading">Coloca suave y parpadea</h3>
                <p className="cl-visual-step-text">
                  Acerca el lente despacio hasta tocar el ojo, suelta los párpados con suavidad y parpadea despacio para que se acomode naturalmente.
                </p>
              </div>
            </div>
          </div>

          {/* Complete 7 Steps Timeline Card */}
          <div className="cl-steps-accordion-box">
            <h3 className="cl-steps-list-title">
              <Compass size={22} color="#2563eb" />
              <span>Los 7 pasos en detalle</span>
            </h3>

            <div className="cl-steps-list">
              <div className="cl-step-item">
                <div className="cl-step-badge">1</div>
                <div className="cl-step-content">
                  <strong>Lávate y seca bien las manos</strong> con una toalla sin pelusa. Es el paso más importante para evitar transferir residuos al ojo.
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">2</div>
                <div className="cl-step-content">
                  <strong>Saca el lente</strong> del estuche o blíster con la yema del dedo (nunca con las uñas) y colócalo en la <strong>yema del dedo índice</strong>. Revisa que esté limpio y que no esté roto.
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">3</div>
                <div className="cl-step-content">
                  <strong>Verifica que no esté al revés:</strong> un lente bien orientado parece un <em>tazón perfecto</em> con bordes rectos hacia arriba; si los bordes se abren ligeramente hacia afuera como un <em>plato hondo</em>, está invertido. Voltéalo con suavidad.
                  <div className="cl-step-callout">
                    <span>💡 <strong>Regla rápida:</strong> Si forma una "U" redonda está correcto; si los bordes tienen pestaña hacia afuera en "V", dale la vuelta.</span>
                  </div>
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">4</div>
                <div className="cl-step-content">
                  Con la otra mano (la libre), <strong>sujeta el párpado de arriba</strong> con firmeza desde la base de las pestañas para evitar el reflejo involuntario de parpadear.
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">5</div>
                <div className="cl-step-content">
                  <strong>Baja el párpado de abajo</strong> con el dedo medio de la misma mano que sostiene el lente de contacto.
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">6</div>
                <div className="cl-step-content">
                  <strong>Mira hacia arriba o al frente</strong> y acerca el lente despacio hasta tocar el ojo; suéltalo con suavidad. Sentirás cómo la humedad natural del ojo lo atrae.
                </div>
              </div>

              <div className="cl-step-item">
                <div className="cl-step-badge">7</div>
                <div className="cl-step-content">
                  <strong>Cierra el ojo un momento</strong>, mira en varias direcciones para acomodarlo sobre la córnea, y suelta los párpados despacio. Parpadea suavemente un par de veces. ¡Listo!
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          3. Guía: Cómo quitártelos
          ------------------------------------------------------------------ */}
      <section className="cl-section" id="como-quitartelos">
        <div className="cl-container">
          <div className="cl-section-header">
            <span className="cl-eyebrow">Técnica de retiro</span>
            <h2 className="cl-section-title">Cómo quitártelos</h2>
            <p className="cl-section-desc">
              Retirarlos es un movimiento suave y seguro que no toca la córnea directamente.
            </p>
          </div>

          <div className="cl-remove-grid">
            <div className="cl-remove-card">
              <span className="cl-remove-num">01</span>
              <p className="cl-remove-text">
                <strong>Lávate y seca las manos</strong> otra vez minuciosamente antes de tocar tus ojos.
              </p>
            </div>

            <div className="cl-remove-card">
              <span className="cl-remove-num">02</span>
              <p className="cl-remove-text">
                <strong>Mira hacia arriba</strong> y baja suavemente el párpado inferior con el dedo medio.
              </p>
            </div>

            <div className="cl-remove-card">
              <span className="cl-remove-num">03</span>
              <p className="cl-remove-text">
                Con el índice, <strong>desliza el lente suavemente hacia abajo</strong> hacia la parte blanca del ojo.
              </p>
            </div>

            <div className="cl-remove-card">
              <span className="cl-remove-num">04</span>
              <p className="cl-remove-text">
                <strong>Pellízcalo con cuidado</strong> entre la yema del pulgar y el índice para sacarlo sin usar las uñas.
              </p>
            </div>

            <div className="cl-remove-card">
              <span className="cl-remove-num">05</span>
              <p className="cl-remove-text">
                Si es <strong>mensual</strong>, guárdalo en su estuche con <strong>solución nueva</strong> (no la reuses). Si es <strong>diario</strong>, tíralo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          4. Higiene y cuidado (lo que sí y lo que no)
          ------------------------------------------------------------------ */}
      <section className="cl-section cl-section-alt" id="higiene">
        <div className="cl-container">
          <div className="cl-section-header">
            <span className="cl-eyebrow">Salud e higiene ocular</span>
            <h2 className="cl-section-title">Higiene y cuidado: lo que sí y lo que no</h2>
            <p className="cl-section-desc">
              Los buenos hábitos garantizan ojos sanos, frescos y confortables durante todo el día.
            </p>
          </div>

          <div className="cl-hygiene-split">
            {/* SÍ */}
            <div className="cl-hygiene-card yes">
              <div className="cl-hygiene-header">
                <div className="cl-hygiene-icon-wrap">
                  <Check size={22} strokeWidth={2.8} />
                </div>
                <h3 className="cl-hygiene-title">Lo que Sí debes hacer</h3>
              </div>
              <ul className="cl-hygiene-list">
                <li>
                  <span className="cl-hygiene-bullet">✓</span>
                  <span><strong>Manos limpias y secas siempre</strong> antes de manipular o retirar tus lentes de contacto.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">✓</span>
                  <span>Usa <strong>solo la solución recomendada</strong> para enjuagar y almacenar, y cambia el estuche cada ~3 meses.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">✓</span>
                  <span><strong>Respeta el tiempo de uso:</strong> un lente diario es de un solo día; no lo estires más tiempo.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">✓</span>
                  <span><strong>Quítatelos antes de dormir</strong> (salvo que tu optometrista indique específicamente uso prolongado).</span>
                </li>
              </ul>
            </div>

            {/* NO */}
            <div className="cl-hygiene-card no">
              <div className="cl-hygiene-header">
                <div className="cl-hygiene-icon-wrap">
                  <X size={22} strokeWidth={2.8} />
                </div>
                <h3 className="cl-hygiene-title">Lo que Nunca debes hacer</h3>
              </div>
              <ul className="cl-hygiene-list">
                <li>
                  <span className="cl-hygiene-bullet">❌</span>
                  <span><strong>Nunca uses agua de la llave ni saliva:</strong> contienen microorganismos y amebas que pueden infectar la córnea.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">❌</span>
                  <span><strong>No reutilices un lente diario:</strong> el material pierde su hidratación y retiene bacterias después del primer uso.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">❌</span>
                  <span><strong>No los compartas con nadie:</strong> los lentes de contacto son dispositivos médicos personales e intransferibles.</span>
                </li>
                <li>
                  <span className="cl-hygiene-bullet">❌</span>
                  <span><strong>No te bañes ni nades con ellos puestos:</strong> el agua de regaderas, albercas y jacuzzis expone los ojos a bacterias severas.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="cl-hygiene-image-box">
            <img
              src={solutionImg}
              alt="Frasco de solución desinfectante multipropósito para lentes de contacto junto a estuche esterilizado abierto con tapas L y R"
              className="cl-hygiene-image"
              loading="eager"
            />
            <div className="cl-hygiene-caption">
              <span>💧 Conserva siempre tus lentes en solución multipropósito nueva. Nunca reutilices líquido ni uses agua común.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          5. Señales de alerta (cuándo parar y consultarnos)
          ------------------------------------------------------------------ */}
      <section className="cl-section" style={{ padding: '40px 0' }}>
        <div className="cl-container">
          <div className="cl-alert-card">
            <div className="cl-alert-content">
              <div className="cl-alert-icon-box">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="cl-alert-title">Señales de alerta: cuándo parar y consultarnos</h3>
                <p className="cl-alert-text">
                  Si sientes <strong>dolor, enrojecimiento, ardor, lagrimeo o ves borroso</strong>, retíralos de inmediato y escríbenos. No «aguantes» molestias — los ojos primero.
                </p>
              </div>
            </div>

            <div className="cl-alert-action">
              <button
                className="cl-btn cl-btn-secondary"
                onClick={() => handleWhatsApp('Hola, tengo molestias con mis lentes de contacto y requiero asesoría')}
              >
                <MessageCircle size={16} />
                <span>Consultar por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          6. Tipos que manejamos
          ------------------------------------------------------------------ */}
      <section className="cl-section cl-section-alt" id="tipos">
        <div className="cl-container">
          <div className="cl-section-header">
            <span className="cl-eyebrow">Variedad y tecnología</span>
            <h2 className="cl-section-title">Tipos que manejamos</h2>
            <p className="cl-section-desc">
              Cada estilo de vida y necesidad visual cuenta con una opción de reemplazo y curvatura diseñada para ti.
            </p>
          </div>

          <div className="cl-types-layout">
            <div className="cl-types-visual-wrap">
              <img
                src={blisterImg}
                alt="Blíster sellado de 6 empaques estériles de lentes de contacto sobre fondo blanco minimalista"
                className="cl-types-img"
                loading="eager"
              />
            </div>

            <div className="cl-types-list">
              <div className="cl-type-card">
                <h3 className="cl-type-title">
                  <Clock size={18} color="#2563eb" />
                  <span>Diarios</span>
                </h3>
                <p className="cl-type-desc">
                  Un par nuevo cada día, lo más higiénico y sin limpieza. Ideales para deportistas, viajes o uso ocasional.
                </p>
              </div>

              <div className="cl-type-card">
                <h3 className="cl-type-title">
                  <RefreshCw size={18} color="#2563eb" />
                  <span>Mensuales / quincenales</span>
                </h3>
                <p className="cl-type-desc">
                  Más económicos por día; requieren cuidado y limpieza diaria con solución multipropósito recomendada.
                </p>
              </div>

              <div className="cl-type-card">
                <h3 className="cl-type-title">
                  <Layers size={18} color="#2563eb" />
                  <span>Tóricos (Astigmatismo)</span>
                </h3>
                <p className="cl-type-desc">
                  Diseño de estabilización especial para corregir el astigmatismo, manteniendo el eje visual perfectamente alineado.
                </p>
              </div>

              <div className="cl-type-card">
                <h3 className="cl-type-title">
                  <Eye size={18} color="#2563eb" />
                  <span>Multifocales (Presbicia)</span>
                </h3>
                <p className="cl-type-desc">
                  Permiten enfocar nítidamente de lejos, distancia intermedia y cerca para leer sin anteojos adicionales.
                </p>
              </div>

              <div className="cl-type-card">
                <h3 className="cl-type-title">
                  <Smile size={18} color="#2563eb" />
                  <span>De color / cosméticos</span>
                </h3>
                <p className="cl-type-desc">
                  Realzan o cambian el color de tus ojos con materiales de grado oftálmico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          Garantía Lensique
          ------------------------------------------------------------------ */}
      <section className="cl-section" style={{ padding: '32px 0 40px' }}>
        <div className="cl-container">
          <div className="cl-guarantee-banner">
            <ShieldCheck size={26} color="#16a34a" />
            <p className="cl-guarantee-text">
              <strong>Garantía Lensique:</strong> Venta de cajas selladas originales, validación de receta por optometrista antes de surtir y devolución de cajas selladas hasta 15 días.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          9. Marcas que manejamos
          ------------------------------------------------------------------ */}
      <section className="cl-section">
        <div className="cl-container">
          <div className="cl-section-header" style={{ marginBottom: '24px' }}>
            <span className="cl-eyebrow">Marcas líderes mundiales</span>
            <h2 className="cl-section-title">Marcas de confianza</h2>
            <p className="cl-section-desc">
              Trabajamos únicamente con laboratorios certificados internacionalmente para garantizar máxima permeabilidad al oxígeno.
            </p>
          </div>

          <div className="cl-brands-wrap">
            <span className="cl-brand-chip">Acuvue (Johnson & Johnson)</span>
            <span className="cl-brand-chip">Biofinity (CooperVision)</span>
            <span className="cl-brand-chip">Bausch + Lomb</span>
            <span className="cl-brand-chip">Biotrue</span>
            <span className="cl-brand-chip">Air Optix (Alcon)</span>
            <span className="cl-brand-chip">Clariti 1 Day</span>
            <span className="cl-brand-chip">Dailies Total</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          10. FAQ (Acordeón interactivo)
          ------------------------------------------------------------------ */}
      <section className="cl-section cl-section-alt" id="faq">
        <div className="cl-container-sm">
          <div className="cl-section-header">
            <span className="cl-eyebrow">Dudas frecuentes</span>
            <h2 className="cl-section-title">Preguntas sobre lentes de contacto</h2>
            <p className="cl-section-desc">
              Resolvemos las dudas más habituales sobre uso, seguridad y compra en línea.
            </p>
          </div>

          <div className="cl-faq-list">
            <div className={`cl-faq-item ${openFaqIndex === 0 ? 'open' : ''}`}>
              <button className="cl-faq-btn" onClick={() => toggleFaq(0)} type="button">
                <span>¿Con astigmatismo puedo usar lentes de contacto?</span>
                <ChevronDown size={20} className="cl-faq-chevron" />
              </button>
              {openFaqIndex === 0 && (
                <div className="cl-faq-body">
                  Sí, con lentes tóricos para astigmatismo. Existen diseños de estabilización avanzados que mantienen el eje visual alineado con cada parpadeo, brindando una visión nítida y estable.
                </div>
              )}
            </div>

            <div className={`cl-faq-item ${openFaqIndex === 1 ? 'open' : ''}`}>
              <button className="cl-faq-btn" onClick={() => toggleFaq(1)} type="button">
                <span>¿Son seguros para mis ojos?</span>
                <ChevronDown size={20} className="cl-faq-chevron" />
              </button>
              {openFaqIndex === 1 && (
                <div className="cl-faq-body">
                  Sí, bien usados y con la graduación correcta. Con hábitos de higiene adecuados (lavado de manos, respeto al tiempo de reemplazo y soluciones estériles), el riesgo de infección es mínimo.
                </div>
              )}
            </div>

            <div className={`cl-faq-item ${openFaqIndex === 2 ? 'open' : ''}`}>
              <button className="cl-faq-btn" onClick={() => toggleFaq(2)} type="button">
                <span>¿Puedo comprarlos en línea?</span>
                <ChevronDown size={20} className="cl-faq-chevron" />
              </button>
              {openFaqIndex === 2 && (
                <div className="cl-faq-body">
                  Si ya conoces tu graduación o cuentas con una receta previa, sí, puedes comprarlos directamente en nuestra tienda en línea. Todas las órdenes son validadas por un optometrista antes de surtir cajas selladas originales. Si tienes dudas sobre tu graduación, puedes agendar tu examen visual o escribirnos por WhatsApp.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          11. Catálogo destacado en vivo (si existen productos)
          ------------------------------------------------------------------ */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="cl-section">
          <div className="cl-container">
            <div className="cl-section-header">
              <span className="cl-eyebrow">Modelos disponibles</span>
              <h2 className="cl-section-title">Lentes de contacto destacados</h2>
              <p className="cl-section-desc">
                Cajas selladas originales con respaldo de optometrista y entrega rápida en Zapopan y todo México.
              </p>
            </div>

            <div className="wp-carousel-grid">
              {featuredProducts.slice(0, 8).map((product: any, idx: number) => {
                const hdImage = getOfficialHdImage(product);
                const imgUrl = hdImage || product.image_url || product.image || (product.images && product.images[0]?.image_url);
                return (
                  <FeaturedContactLensCardItem
                    key={`contact-${idx}-${product.id || idx}`}
                    product={product}
                    imgUrl={imgUrl}
                    onViewProduct={onViewProduct}
                  />
                );
              })}
            </div>

            <div style={{ textAlign: 'center', marginTop: '36px' }}>
              <button
                className="cl-btn cl-btn-primary"
                onClick={() => onNavigateToCatalog('Lentes de Contacto')}
              >
                <span>Ver catálogo completo de lentes de contacto</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------------
          12. CTA Final (Apple Style Banner)
          ------------------------------------------------------------------ */}
      <section className="cl-cta-final">
        <div className="cl-container">
          <div className="cl-cta-final-box">
            <h2 className="cl-cta-final-title">Visión libre y cómoda todos los días</h2>
            <p className="cl-cta-final-desc">
              Explora las opciones disponibles en nuestro catálogo o escríbenos directamente por WhatsApp para resolver dudas sobre graduación y validación con nuestro optometrista.
            </p>

            <div className="cl-cta-final-actions">
              <button
                className="cl-btn cl-btn-white"
                onClick={() => onNavigateToCatalog('Lentes de Contacto')}
              >
                <span>Ver lentes de contacto</span>
                <ArrowRight size={16} />
              </button>

              <button
                className="cl-btn cl-btn-secondary"
                onClick={() => handleWhatsApp('Hola, tengo dudas sobre lentes de contacto')}
              >
                <MessageCircle size={16} />
                <span>¿Dudas? Escríbenos por WhatsApp</span>
              </button>

              <button
                className="cl-btn cl-btn-outline"
                style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
                onClick={onBookExam}
              >
                <Calendar size={16} />
                <span>Agendar examen de la vista</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
