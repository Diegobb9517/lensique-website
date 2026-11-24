import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react';
import './QuickBookingModal.css';

interface QuickBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: string;
  source?: string;
}

const SERVICES = [
  'Examen de la vista',
  'Lentes nuevos',
  'Lentes de contacto'
];

const TIMINGS = [
  'Hoy',
  'Mañana',
  'Esta semana',
  'Fin de semana'
];

export default function QuickBookingModal({
  isOpen,
  onClose,
  initialService = 'Examen de la vista',
  source = 'unknown'
}: QuickBookingModalProps) {
  const [service, setService] = useState<string>(initialService);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [timing, setTiming] = useState<string>('Hoy');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Por favor ingresa tu nombre.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Por favor ingresa tu WhatsApp a 10 dígitos.');
      return;
    }

    setError('');

    // Disparar evento de analítica GA4
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'agendar_cita', {
        service,
        timing,
        source,
        pagina: window.location.pathname
      });
      (window as any).gtag('event', 'cita_confirmada', {
        service,
        timing,
        source,
        pagina: window.location.pathname
      });
    }

    // Meta Pixel Lead
    import('../lib/analytics').then(({ trackLead }) => trackLead());

    // Mensaje de WhatsApp pre-llenado al número de la óptica
    const msg = [
      '¡Hola Óptica Lensique! 👋',
      'Me gustaría agendar un horario para visitarlos:',
      '',
      `• ¿Qué necesito?: ${service}`,
      `• Nombre: ${name.trim()}`,
      `• WhatsApp: ${cleanPhone}`,
      `• ¿Cuándo?: ${timing}`,
      '',
      '¿Qué horarios tienen disponibles?'
    ].join('\n');

    const whatsappUrl = `https://wa.me/523316929111?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  return (
    <div className="quick-booking-overlay" onClick={onClose}>
      <div 
        className="quick-booking-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button 
          className="quick-booking-close" 
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          <X size={20} />
        </button>

        <div className="quick-booking-header">
          <div className="quick-booking-badge">
            <Calendar size={14} />
            <span>Atención en Zapopan</span>
          </div>
          <h2 className="quick-booking-title">Agenda tu cita</h2>
          <p className="quick-booking-subtitle">
            Déjanos tus datos y te confirmamos tu horario por WhatsApp.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="quick-booking-form">
          {/* 1. ¿Qué necesitas? */}
          <div className="qb-field-group">
            <label className="qb-label">1. ¿Qué necesitas?</label>
            <div className="qb-pills-grid">
              {SERVICES.map((item) => {
                const isSelected = service === item;
                return (
                  <button
                    key={item}
                    type="button"
                    className={`qb-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => { setService(item); setError(''); }}
                  >
                    {isSelected && <CheckCircle2 size={15} className="qb-pill-icon" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Tu nombre */}
          <div className="qb-field-group">
            <label className="qb-label" htmlFor="qb-name-input">2. Tu nombre completo</label>
            <input
              id="qb-name-input"
              type="text"
              className="qb-input"
              placeholder="Ej. Sofía Mendoza"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              autoComplete="name"
            />
          </div>

          {/* 3. WhatsApp (10 dígitos) */}
          <div className="qb-field-group">
            <label className="qb-label" htmlFor="qb-phone-input">3. Tu WhatsApp (10 dígitos)</label>
            <div className="qb-phone-wrap">
              <span className="qb-phone-prefix">🇲🇽 +52</span>
              <input
                id="qb-phone-input"
                type="tel"
                className="qb-input qb-phone-input"
                placeholder="33 1234 5678"
                maxLength={14}
                value={phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d\s]/g, '');
                  setPhone(val);
                  setError('');
                }}
                autoComplete="tel"
              />
            </div>
          </div>

          {/* 4. ¿Cuándo te gustaría? */}
          <div className="qb-field-group">
            <label className="qb-label">4. ¿Cuándo prefieres venir?</label>
            <div className="qb-pills-grid qb-pills-timing">
              {TIMINGS.map((item) => {
                const isSelected = timing === item;
                return (
                  <button
                    key={item}
                    type="button"
                    className={`qb-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => { setTiming(item); setError(''); }}
                  >
                    {isSelected && <CheckCircle2 size={15} className="qb-pill-icon" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="qb-error-msg">
              {error}
            </div>
          )}

          {/* Botón de confirmación */}
          <button type="submit" className="qb-submit-btn">
            <MessageCircle size={19} />
            <span>Agendar tu horario por WhatsApp</span>
          </button>

          <div className="qb-footer-note">
            <span>📍 Av. Guadalupe 1296, Zapopan · Sin compromiso</span>
          </div>
        </form>
      </div>
    </div>
  );
}
