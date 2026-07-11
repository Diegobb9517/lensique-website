import React from 'react';

interface RxGuideProps {
  isToric?: boolean;
  isMultifocal?: boolean;
}

export const RxGuide: React.FC<RxGuideProps> = ({ isToric, isMultifocal }) => {
  return (
    <div style={{ margin: '8px 0 4px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#475569', textAlign: 'center' }}>
        Encuentra estos valores a un costado de tu caja o en el empaque individual de tus lentes:
      </p>

      {/* REPLICA DE LA ETIQUETA DE LA CAJA */}
      <div style={{ 
        maxWidth: '300px', 
        margin: '0 auto 16px auto', 
        background: '#ffffff', 
        border: '1px solid #cbd5e1', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Barra decorativa azul */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#2563eb' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px' }}>RX PRESCRIPTION</div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', marginBottom: '4px' }}>
          {/* PWR / SPH */}
          <div style={{ flex: 1, minWidth: '60px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>-2.50</div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>D / SPH</div>
          </div>

          {/* CYL (Only if Toric) */}
          {isToric && (
            <div style={{ flex: 1, minWidth: '60px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>-1.25</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>CYL</div>
            </div>
          )}

          {/* AXIS (Only if Toric) */}
          {isToric && (
            <div style={{ flex: 1, minWidth: '60px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>180</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>AXIS</div>
            </div>
          )}

          {/* ADD (Only if Multifocal) */}
          {isMultifocal && (
            <div style={{ flex: 1, minWidth: '60px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#1e40af' }}>+2.00</div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#3b82f6', marginTop: '2px' }}>ADD</div>
            </div>
          )}
        </div>
      </div>

      {/* LEYENDA (TEXTO EXPLICATIVO) */}
      <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.6', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <div style={{ marginBottom: '8px' }}>
          <b style={{ color: '#1e40af', display: 'inline-block', width: '70px' }}>D / SPH:</b> 
          Esfera o Poder principal (signo <b style={{color:'#0f172a'}}>-</b> es miopía, <b style={{color:'#0f172a'}}>+</b> es hipermetropía).
        </div>
        
        {isToric && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <b style={{ color: '#1e40af', display: 'inline-block', width: '70px' }}>CYL:</b> 
              Cilindro (astigmatismo). Siempre viene con signo negativo.
            </div>
            <div style={{ marginBottom: '8px' }}>
              <b style={{ color: '#1e40af', display: 'inline-block', width: '70px' }}>AXIS:</b> 
              Eje del astigmatismo. Es un número entre 0 y 180°.
            </div>
          </>
        )}

        {isMultifocal && (
          <div style={{ marginBottom: '8px' }}>
            <b style={{ color: '#1e40af', display: 'inline-block', width: '70px' }}>ADD:</b> 
            Adición para ver de cerca (presbicia). Suele ser un valor positivo o letras (High/Low).
          </div>
        )}
        
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
          *Nota: La Curva Base (BC) y Diámetro (DIA) ya vienen preconfigurados por el fabricante.
        </div>
      </div>

    </div>
  );
};
