import React from 'react';
import './MicasZeissPage.css';

import zeissLogo from '../assets/zeiss_logo.png';
import imgBlueGuard from '../assets/premium_bluelight_v2_1785866269289.jpg';
import imgAntireflective from '../assets/premium_antireflective_1785865428939.jpg';
import imgPhotochromic from '../assets/premium_photochromic_1785865389796.jpg';
import imgMonofocal from '../assets/premium_monofocal_1785865329187.jpg';
import imgBifocal from '../assets/premium_bifocal_v2_1785866208612.jpg';
import imgProgressive from '../assets/premium_progressive_v2_1785866839561.jpg';

interface MicasZeissPageProps {
  onSelectArmazones: () => void;
}

export const MicasZeissPage: React.FC<MicasZeissPageProps> = ({ onSelectArmazones }) => {
  return (
    <div className="micas-zeiss-page">
      <div className="mz-hero">
        <img className="mz-zl" src={zeissLogo} alt="ZEISS" />
        <h1>Micas ZEISS</h1>
        <p>Todas nuestras micas son ZEISS: tecnología óptica alemana de precisión, diseñada para cada necesidad de tu vista.</p>
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
              <div className="mz-cb">Filtra la luz azul de pantallas y reduce la fatiga visual.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgAntireflective} alt="ZEISS Antirreflejante" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Antirreflejante</div>
              <div className="mz-cb">Visión limpia, sin reflejos molestos y fácil de limpiar.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgPhotochromic} alt="ZEISS Fotocromáticas (PhotoFusion X)" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Fotocromáticas (PhotoFusion X)</div>
              <div className="mz-cb">Se oscurecen con el sol y se aclaran en interiores.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgMonofocal} alt="ZEISS Monofocal" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Monofocal</div>
              <div className="mz-cb">Graduación precisa para ver de lejos o para leer.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgBifocal} alt="ZEISS Bifocal" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Bifocal</div>
              <div className="mz-cb">Dos campos visuales (lejos y cerca) con división visible.</div>
            </div>
          </div>

          <div className="mz-card">
            <div className="mz-imgwrap">
              <img src={imgProgressive} alt="ZEISS Progresivas" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS Progresivas</div>
              <div className="mz-cb">Transición suave entre lejos, intermedio y cerca, sin líneas.</div>
            </div>
          </div>
        </div>

        <div className="mz-cta">
          <a
            href="/armazones"
            onClick={(e) => {
              e.preventDefault();
              onSelectArmazones();
            }}
          >
            Elegir armazón con micas ZEISS
          </a>
          <span className="mz-s">Todas las compras de armazón incluyen micas con graduación.</span>
        </div>

        <div className="mz-note">
          Lensique es distribuidor autorizado de lentes oftálmicos Carl Zeiss Vision en México.
        </div>
      </div>
    </div>
  );
};
