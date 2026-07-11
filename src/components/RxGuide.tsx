import React from 'react';

export const RxGuide: React.FC = () => {
  return (
    <div style={{ margin: '8px 0 4px', padding: '16px 16px 14px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#fbfaf8' }}>
      <div style={{ fontFamily: 'Georgia,serif', fontSize: '15px', fontWeight: 600, color: '#1b2436' }}>Cómo leer tu receta</div>
      <div style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 12px' }}>Ejemplo - así se ve una receta de lentes</div>
      
      <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
            Ojo derecho (OD)
          </div>
          <svg viewBox="0 0 120 84" width="100%" style={{ maxWidth: '150px', display: 'block', margin: '0 auto', overflow: 'visible' }}>
            <path d="M8 70 A52 52 0 0 1 112 70" fill="none" stroke="#c9d2e0" strokeWidth="2"/>
            <line x1="8" y1="70" x2="112" y2="70" stroke="#e3e8f0" strokeWidth="1.4"/>
            <line x1="60" y1="70" x2="48.3" y2="19.3" stroke="#2563eb" strokeWidth="2.6" strokeLinecap="round"/>
            <circle cx="60" cy="70" r="2.6" fill="#2563eb"/>
            <text x="60" y="82" textAnchor="middle" fontSize="7.5" fill="#9aa3b2">0-180°</text>
            <text x="46.3" y="15.3" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2563eb" fontFamily="Georgia,serif">103°</text>
          </svg>
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginTop: '8px', background: '#fff' }}>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Esf</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>-0.50</div>
            </div>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Cil</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>-0.75</div>
            </div>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Eje</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>103°</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '4px' }}>
            Ojo izquierdo (OI)
          </div>
          <svg viewBox="0 0 120 84" width="100%" style={{ maxWidth: '150px', display: 'block', margin: '0 auto', overflow: 'visible' }}>
            <path d="M8 70 A52 52 0 0 1 112 70" fill="none" stroke="#c9d2e0" strokeWidth="2"/>
            <line x1="8" y1="70" x2="112" y2="70" stroke="#e3e8f0" strokeWidth="1.4"/>
            <line x1="60" y1="70" x2="61.8" y2="18.0" stroke="#2563eb" strokeWidth="2.6" strokeLinecap="round"/>
            <circle cx="60" cy="70" r="2.6" fill="#2563eb"/>
            <text x="60" y="82" textAnchor="middle" fontSize="7.5" fill="#9aa3b2">0-180°</text>
            <text x="69.8" y="14.0" textAnchor="middle" fontSize="13" fontWeight="700" fill="#2563eb" fontFamily="Georgia,serif">88°</text>
          </svg>
          <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginTop: '8px', background: '#fff' }}>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Esf</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>+1.25</div>
            </div>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Cil</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>-2.00</div>
            </div>
            <div style={{ flex: 1, padding: '7px 2px', textAlign: 'center', borderLeft: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.3px' }}>Eje</div>
              <div style={{ fontSize: '12px', color: '#1b2436', fontWeight: 600, marginTop: '2px' }}>88°</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '13px', fontSize: '11.5px', lineHeight: 1.8, color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '11px' }}>
        <b style={{ color: '#1b2436' }}>Esfera (SPH/PWR)</b> potencia principal: signo - miopía, + hipermetropía.<br/>
        <b style={{ color: '#1b2436' }}>Cilindro (CYL)</b> astigmatismo (si no tiene, elige 0.00).<br/>
        <b style={{ color: '#1b2436' }}>Eje (AXIS)</b> dirección del astigmatismo, de 0 a 180°.<br/>
        <b style={{ color: '#1b2436' }}>Curva Base (BC)</b> curvatura del lente de contacto.<br/>
        <b style={{ color: '#1b2436' }}>Diámetro (DIA)</b> tamaño del lente de contacto.
      </div>
    </div>
  );
};
