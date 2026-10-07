import React, { useState } from 'react';
import { X, Eye, Glasses, Droplet, Zap, HeartPulse, ChevronLeft, Check, Square } from 'lucide-react';
import { trackLead } from '../lib/analytics';

export const TRIAGE_OPTIONS = [
  { id: 1, text: "Visión borrosa, de lejos o de cerca", route: "EXAMEN", icon: Eye },
  { id: 2, text: "Revisar mi graduación o lentes nuevos", route: "EXAMEN", icon: Glasses },
  { id: 3, text: "Enrojecimiento, resequedad o irritación", route: "CONSULTA", icon: Droplet },
  { id: 4, text: "Manchas, destellos o dolor en el ojo", route: "CONSULTA_MISMO_DIA", icon: Zap },
  { id: 5, text: "Control por diabetes o hipertensión", route: "CONSULTA", icon: HeartPulse }
];

interface TriageModalProps {
  onClose: () => void;
  onSelectService: (service: string, fromTriage?: boolean, reasons?: string) => void;
}

const trackTriageOption = (opcion: string, ruta: string) => {
  if (typeof window === 'undefined') return;
  if (window.gtag) {
    window.gtag('event', 'triaje_opcion', { opcion, ruta });
  }
  if (window.fbq) {
    window.fbq('trackCustom', 'TriajeOpcion', { opcion, ruta });
  }
};

export const TriageModal: React.FC<TriageModalProps> = ({ onClose, onSelectService }) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showError, setShowError] = useState(false);
  const [finalRoute, setFinalRoute] = useState<string | null>(null);

  const toggleOption = (id: number) => {
    setShowError(false);
    setSelectedIds(prev => {
      let newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return Array.from(newSet);
    });
  };

  const handleContinue = () => {
    if (selectedIds.length === 0) {
      setShowError(true);
      return;
    }
    
    const selectedOptions = TRIAGE_OPTIONS.filter(o => selectedIds.includes(o.id));
    
    let route = 'EXAMEN';
    if (selectedIds.includes(4)) {
      route = 'CONSULTA_MISMO_DIA';
    } else if (selectedIds.includes(3) || selectedIds.includes(5)) {
      route = 'CONSULTA';
    }

    trackTriageOption(selectedIds.join(','), route);
    setFinalRoute(route);
  };

  const handleFinalAction = (serviceName: string) => {
    trackLead();
    const selectedOptions = TRIAGE_OPTIONS.filter(o => selectedIds.includes(o.id));
    const symptomTexts = selectedOptions.map(o => o.text).join(', ');
    onSelectService(serviceName, true, symptomTexts);
    onClose();
  };

  const renderContent = () => {
    if (!finalRoute) {
      return (
        <div className="triage-step-1" style={{ position: 'relative' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>¿Cuál es el motivo de su visita?</h2>
          <p style={{ color: '#4b5563', marginBottom: '20px', textAlign: 'center', fontSize: '0.95rem' }}>
            Seleccione todas las opciones que apliquen. Le indicaremos el tipo de cita adecuado.
          </p>
          <div className="triage-options-list" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            marginBottom: '20px'
          }}>
            {TRIAGE_OPTIONS.map(opt => {
              const isSelected = selectedIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  onClick={() => toggleOption(opt.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '15px 16px',
                    border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    minHeight: '52px'
                  }}
                  onMouseOver={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#f9fafb';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                    }
                  }}
                >
                  <opt.icon size={20} color={isSelected ? "#2563eb" : "#6b7280"} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500, color: '#111827', lineHeight: 1.3, flex: 1 }}>{opt.text}</span>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    border: isSelected ? 'none' : '2px solid #d1d5db',
                    backgroundColor: isSelected ? '#2563eb' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {isSelected && <Check size={16} color="#ffffff" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              onClick={handleContinue}
              style={{
                width: '100%',
                padding: '14px 24px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                opacity: selectedIds.length === 0 ? 0.8 : 1
              }}
            >
              Continuar
            </button>
            {showError && <span style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '8px' }}>Seleccione al menos una opción</span>}
          </div>
        </div>
      );
    }

    const selectedOptions = TRIAGE_OPTIONS.filter(o => selectedIds.includes(o.id));
    const symptomTexts = selectedOptions.map(o => o.text).join(', ');

    if (finalRoute === 'EXAMEN') {
      return (
        <div className="triage-step-2" style={{ textAlign: 'center', paddingTop: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Le recomendamos un examen de la vista</h2>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
            <strong>Motivos indicados:</strong> {symptomTexts}
          </div>
          <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto 24px' }}>
            Lo realiza nuestro oftalmólogo. Con su graduación podrá elegir armazón y micas, o lentes de contacto.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
            <button
              onClick={() => handleFinalAction('Examen de la Vista')}
              style={{
                padding: '14px 24px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              Agendar examen de la vista
            </button>
            <a
              href="https://wa.me/523316929111"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead()}
              style={{
                padding: '14px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'block',
                border: '1px solid #d1d5db',
                minHeight: '48px',
                lineHeight: '20px'
              }}
            >
              Resolver dudas por WhatsApp
            </a>
          </div>
          <button
            onClick={() => setFinalRoute(null)}
            style={{
              marginTop: '24px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={16} /> Seleccionar otra opción
          </button>
        </div>
      );
    }

    if (finalRoute === 'CONSULTA') {
      return (
        <div className="triage-step-2" style={{ textAlign: 'center', paddingTop: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Le recomendamos una consulta médica</h2>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
            <strong>Motivos indicados:</strong> {symptomTexts}
          </div>
          <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto 24px' }}>
            El oftalmólogo valorará su caso y revisará su vista en la misma cita, e indicará el tratamiento o los pasos a seguir.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
            <button
              onClick={() => handleFinalAction('Consulta Médica')}
              style={{
                padding: '14px 24px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              Agendar consulta médica
            </button>
            <a
              href="https://wa.me/523316929111"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead()}
              style={{
                padding: '14px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'block',
                border: '1px solid #d1d5db',
                minHeight: '48px',
                lineHeight: '20px'
              }}
            >
              Resolver dudas por WhatsApp
            </a>
          </div>
          <button
            onClick={() => setFinalRoute(null)}
            style={{
              marginTop: '24px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={16} /> Seleccionar otra opción
          </button>
        </div>
      );
    }

    if (finalRoute === 'CONSULTA_MISMO_DIA') {
      const whatsappMsg = `Buen día. Presento ${symptomTexts.toLowerCase()} y quisiera saber si es posible una consulta el día de hoy.`;
      const whatsappUrl = `https://wa.me/523316929111?text=${encodeURIComponent(whatsappMsg)}`;
      
      return (
        <div className="triage-step-2" style={{ textAlign: 'center', paddingTop: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Le recomendamos una consulta médica</h2>
          <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px', maxWidth: '400px', margin: '0 auto 16px' }}>
            <strong>Motivos indicados:</strong> {symptomTexts}
          </div>
          <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '1rem', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto 24px' }}>
            Ante estos síntomas es posible atenderle el mismo día. Escríbanos y le indicaremos el horario más próximo disponible.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLead()}
              style={{
                padding: '14px 24px',
                backgroundColor: '#000',
                color: '#fff',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'block',
                border: 'none',
                minHeight: '48px',
                lineHeight: '20px'
              }}
            >
              Solicitar cita para hoy por WhatsApp
            </a>
            <button
              onClick={() => handleFinalAction('Consulta Médica')}
              style={{
                padding: '14px 24px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                minHeight: '48px'
              }}
            >
              Agendar consulta médica
            </button>
          </div>
          <button
            onClick={() => setFinalRoute(null)}
            style={{
              marginTop: '24px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <ChevronLeft size={16} /> Seleccionar otra opción
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div id="triage-modal-content" style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '440px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '24px 20px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            color: '#4b5563',
            zIndex: 10
          }}
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
        {renderContent()}
      </div>
    </div>
  );
};
