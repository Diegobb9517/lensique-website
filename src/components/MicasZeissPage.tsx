import React from 'react';
import './MicasZeissPage.css';

import zeissLogo from '../assets/zeiss_logo.png';
import imgBlueGuard from '../assets/zeiss/blueguard.jpg';
import imgPhotoFusion from '../assets/zeiss/photofusion.jpg';
import imgDuraVision from '../assets/zeiss/duravision.jpg';
import imgSmartLife from '../assets/zeiss/smartlife.jpg';
import imgUVProtect from '../assets/zeiss/uvprotect.jpg';

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
              <img src={imgSmartLife} alt="ZEISS SmartLife" loading="lazy" />
            </div>
            <div className="mz-cbody">
              <div className="mz-ct">ZEISS SmartLife</div>
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
            href="/armazones"
            onClick={(e) => {
              e.preventDefault();
              onSelectArmazones();
            }}
          >
            Elegir mis micas
          </a>
          <span className="mz-s">Todas las compras de armazón incluyen micas con graduación.</span>
        </div>

        <div className="mz-note">
          Imágenes y marca ZEISS usadas con autorización. © Carl Zeiss. Lensique es distribuidor autorizado de lentes oftálmicos Carl Zeiss Vision en México.
        </div>
      </div>
    </div>
  );
};
