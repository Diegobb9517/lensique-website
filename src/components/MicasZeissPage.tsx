import React, { useState, useEffect, useRef } from 'react';
import './MicasZeissPage.css';

import zeissLogo from '../assets/zeiss_logo.png';
import imgBlueGuard from '../assets/zeiss/blueguard.jpg';
import imgPhotoFusion from '../assets/zeiss/photofusion.jpg';
import imgDuraVision from '../assets/zeiss/duravision.jpg';
import imgSmartLife from '../assets/zeiss/zeiss_smartlife_progresivos.jpg';
import imgUVProtect from '../assets/zeiss/uvprotect.jpg';

interface MicasZeissPageProps {
  onSelectArmazones?: () => void;
}

export const MicasZeissPage: React.FC<MicasZeissPageProps> = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'Micas ZEISS en Zapopan y Guadalajara | Lentes a tu medida · Lensique';
    function handleMsg(e: MessageEvent) {
      if (e.data && e.data.type === 'lensique-cotizador-resize' && typeof e.data.height === 'number') {
        if (e.data.height > 250) {
          setIframeHeight(e.data.height);
        }
      }
    }
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, []);

  const handleIframeLoad = () => {
    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        const modal = doc.querySelector('.modal');
        const h = modal ? Math.ceil(modal.scrollHeight) : Math.ceil(doc.body.scrollHeight);
        if (h > 250) setIframeHeight(h);
      }
    } catch (_) {}
  };

  const scrollToCotizador = () => {
    const el = document.getElementById('cotizador-micas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="micas-zeiss-page">
      <div className="mz-hero">
        <img className="mz-zl" src={zeissLogo} alt="ZEISS" />
        <h1>Micas ZEISS en Zapopan</h1>
        <p>Micas ZEISS con tecnología óptica alemana de precisión en Zapopan y Guadalajara. Tratamientos antirreflejantes, protección contra luz azul y micas progresivas personalizadas para una visión nítida y confortable.</p>
      </div>

      <div className="mz-wrap">
        <div className="mz-lead">
          <div className="mz-k">Tecnología ZEISS</div>
          <h2>Elige la mica según tu día a día</h2>
        </div>

        <div className="mz-grid">
          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgBlueGuard} alt="ZEISS BlueGuard" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS BlueGuard</div>
              <div className="mz-cb">Filtra la luz azul de pantallas; menos fatiga visual.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgPhotoFusion} alt="ZEISS PhotoFusion X" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS PhotoFusion X</div>
              <div className="mz-cb">Fotocromático: se oscurece al sol y se aclara en interiores.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgDuraVision} alt="ZEISS DuraVision" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS DuraVision</div>
              <div className="mz-cb">Antirreflejante premium: más nitidez, menos reflejos, más resistencia.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgSmartLife} alt="ZEISS Progresivo" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Progresivo</div>
              <div className="mz-cb">Visión clara en todo lugar, adaptada a tu edad y tu día digital.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgUVProtect} alt="ZEISS UVProtect" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS UVProtect</div>
              <div className="mz-cb">Protección UV total en lentes transparentes.</div>
            </div>
          </div>
        </div>

        <div className="mz-cta">
          <a
            href="#cotizador-micas"
            onClick={(e) => {
              e.preventDefault();
              scrollToCotizador();
            }}
          >
            Elegir mis micas
          </a>
          <span className="mz-s">Cotiza tus micas en menos de un minuto con tecnología ZEISS.</span>
        </div>

        {/* Sección Educativa SEO: ¿Qué mica necesito? */}
        <section className="mz-guide-section" style={{ marginTop: '50px', paddingTop: '40px', borderTop: '1px solid #e8eaed' }}>
          <div className="mz-lead" style={{ marginBottom: '24px' }}>
            <div className="mz-k">Guía de Elección</div>
            <h2>¿Qué tipo de mica necesito para mis lentes?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', textAlign: 'left' }}>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#16223f', margin: '0 0 8px' }}>Micas Monofocales</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                Corrigen una sola distancia de enfoque: ideales para miopía, astigmatismo o hipermetropía. Proporcionan nitidez completa de lejos o exclusiva para lectura.
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#16223f', margin: '0 0 8px' }}>Micas Progresivas</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                La solución más avanzada para presbicia (vista cansada a partir de los 40 años). Permiten enfocar de lejos, distancia intermedia (computadora) y lectura sin líneas divisorias.
              </p>
            </div>
            <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#16223f', margin: '0 0 8px' }}>Tratamientos Antirreflejantes</h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                ZEISS DuraVision elimina reflejos molestos de luces nocturnas y pantallas, otorga mayor transparencia y facilita la limpieza repeliendo polvo y agua.
              </p>
            </div>
          </div>
        </section>

        {/* Sección Educativa SEO: Micas Progresivas */}
        <section className="mz-progresivos-section" style={{ marginTop: '40px', paddingTop: '30px' }}>
          <div className="mz-lead" style={{ marginBottom: '20px' }}>
            <div className="mz-k">Tecnología Especializada</div>
            <h2>Micas progresivas ZEISS: visión nítida en todas las distancias</h2>
          </div>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, maxWidth: '800px', margin: '0 auto 24px' }}>
            A diferencia de los bifocales tradicionales con línea divisoria visible, las micas progresivas ZEISS SmartLife ofrecen una transición óptica imperceptible y suave entre zonas de visión. En Óptica Lensique en Zapopan, tomamos medidas de centrado y alturas pupilares con precisión digital para asegurar una rápida adaptación y máximo confort visual en tu jornada diaria.
          </p>
        </section>

        <div className="mz-note">
          Imágenes y marca ZEISS usadas con autorización. © Carl Zeiss. Lensique es distribuidor autorizado de lentes oftálmicos Carl Zeiss Vision en México.
        </div>
      </div>

      {/* Cotizador de Micas Restaurado */}
      <section id="cotizador-micas" className="mz-cotizador-section">
        <div className="mz-cotizador-header">
          <div className="mz-k">Cotizador Interactivo</div>
          <h2 className="mz-cotizador-title">Cotiza tus micas en menos de un minuto</h2>
          <p className="mz-cotizador-sub">
            Descubre las opciones de micas monofocales o progresivas con tecnología ZEISS y calcula el costo exacto según tu receta y necesidades.
          </p>
        </div>
        <div 
          className="mz-cotizador-iframe-wrap"
          style={{ height: iframeHeight ? `${iframeHeight}px` : undefined }}
        >
          <iframe 
            ref={iframeRef}
            onLoad={handleIframeLoad}
            src={`/asesor_zeiss.html?v=2.0.0${typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tipo') ? `&initialType=${encodeURIComponent(new URLSearchParams(window.location.search).get('tipo')!)}` : ''}${typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('montaje') ? `&montaje=${encodeURIComponent(new URLSearchParams(window.location.search).get('montaje')!)}` : ''}`}
            title="Asesor Visual ZEISS · Cotizador de Micas"
            className="mz-cotizador-iframe"
          />
        </div>
      </section>
    </div>
  );
};
