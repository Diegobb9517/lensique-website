import React from 'react';

interface RxGuideProps {
  isToric?: boolean;
  isMultifocal?: boolean;
}

export const RxGuide: React.FC<RxGuideProps> = ({ isToric, isMultifocal }) => {
  return (
    <div style={{ margin: '8px 0 4px', padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
      <div style={{ fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>
        <p style={{ margin: '0 0 16px 0', fontSize: '13px' }}>
          Toma la caja de tus lentes de contacto actuales o tu receta médica. Busca los siguientes valores para asegurarte de pedir la graduación correcta:
        </p>

        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, minWidth: '85px', textAlign: 'center' }}>
              PWR / SPH
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Esfera / Poder</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Es tu graduación principal. Un signo negativo (-) indica miopía y uno positivo (+) hipermetropía.</div>
            </div>
          </div>

          {isToric && (
            <>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, minWidth: '85px', textAlign: 'center' }}>
                  CYL
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Cilindro</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Indica el grado de astigmatismo. Siempre es un valor con signo negativo (ej. -1.25).</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, minWidth: '85px', textAlign: 'center' }}>
                  AXIS / AX
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Eje</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>La dirección de tu astigmatismo. Es un número entre 0 y 180 (ej. 90° o 180°).</div>
                </div>
              </div>
            </>
          )}

          {isMultifocal && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, minWidth: '85px', textAlign: 'center' }}>
                ADD
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Adición</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>El poder extra para enfocar de cerca (presbicia). Puede venir como un número (ej. +2.00) o letras (High, Low).</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, minWidth: '85px', textAlign: 'center' }}>
              BC / DIA
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>Curva Base y Diámetro</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Son las medidas físicas del lente. Generalmente vienen fijas por el fabricante y no las necesitas elegir.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
