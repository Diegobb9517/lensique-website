import React, { useState, useEffect } from 'react';
import { 
  Package, Search, Check, Clock, Truck, Store, ExternalLink, 
  MessageCircle, AlertCircle, ArrowLeft, Loader2 
} from 'lucide-react';

interface OrderTrackingProps {
  currentPath: string;
  contactWhatsapp?: string;
  onNavigate?: (path: string) => void;
}

interface TrackingData {
  folio: string;
  customer_first_name: string;
  status: string;
  step: number;
  created_at: string | null;
  in_process_date: string | null;
  ready_date: string | null;
  delivered_date: string | null;
  estimated_delivery_date: string | null;
  delivery_method: string;
  carrier: string | null;
  tracking_guide: string | null;
  items: string[];
  contact_whatsapp?: string;
  public_token?: string;
}

const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://lensique-pos.onrender.com';

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  try {
    let clean = dateStr;
    if (!clean.includes('Z') && !clean.includes('T') && clean.length === 10) {
      clean = `${clean}T12:00:00Z`;
    }
    const d = new Date(clean);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return null;
  }
}

function getCarrierTrackingUrl(carrier: string | null, guide: string | null): string | null {
  if (!guide) return null;
  const cleanGuide = encodeURIComponent(guide.trim());
  const c = (carrier || '').toLowerCase();
  if (c.includes('estafeta')) {
    return `https://www.estafeta.com/Herramientas/Rastreo?rastreo=${cleanGuide}`;
  }
  if (c.includes('dhl')) {
    return `https://www.dhl.com/mx-es/home/rastreo/rastreo-express.html?submit=1&tracking-id=${cleanGuide}`;
  }
  if (c.includes('fedex')) {
    return `https://www.fedex.com/fedextrack/?trknbr=${cleanGuide}`;
  }
  if (c.includes('redpack')) {
    return `https://www.redpack.com.mx/rastreo/?guia=${cleanGuide}`;
  }
  if (c.includes('paquetexpress')) {
    return `https://www.paquetexpress.com.mx/rastreo/${cleanGuide}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(`${carrier || 'paqueteria'} rastreo ${guide}`)}`;
}

export default function OrderTracking({ currentPath, contactWhatsapp, onNavigate }: OrderTrackingProps) {
  const [folio, setFolio] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackingData | null>(null);

  // Set noindex meta tag and document title
  useEffect(() => {
    document.title = 'Seguimiento de Pedido | Óptica Lensique';
    let robotsEl = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!robotsEl) {
      robotsEl = document.createElement('meta');
      robotsEl.setAttribute('name', 'robots');
      document.head.appendChild(robotsEl);
      created = true;
    }
    robotsEl.setAttribute('content', 'noindex, follow');

    return () => {
      if (created && robotsEl && robotsEl.parentNode) {
        robotsEl.parentNode.removeChild(robotsEl);
      }
    };
  }, []);

  // Inspect URL for token /p/:token
  useEffect(() => {
    if (currentPath.startsWith('/p/')) {
      const token = currentPath.replace(/^\/p\//, '').split('/')[0].trim();
      if (token) {
        fetchOrderByToken(token);
      }
    }
  }, [currentPath]);

  const fetchOrderByToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/track/${encodeURIComponent(token.toUpperCase())}`);
      if (res.status === 404) {
        setError('No encontramos ese pedido.');
        setOrder(null);
        return;
      }
      if (res.status === 429) {
        setError('Demasiadas solicitudes. Por favor, intente de nuevo en un minuto.');
        return;
      }
      if (!res.ok) {
        throw new Error('Error al consultar el seguimiento.');
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Ocurrió un error al consultar el pedido. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFolio = folio.trim().toUpperCase();
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    if (!cleanFolio || cleanPhone.length < 10) {
      setError('Por favor ingrese su folio y los 10 dígitos de su teléfono.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/public/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folio: cleanFolio, phone: cleanPhone })
      });

      if (res.status === 404) {
        setError('No encontramos ese pedido.');
        setOrder(null);
        return;
      }
      if (res.status === 429) {
        setError('Demasiadas solicitudes. Por favor, intente de nuevo en un minuto.');
        return;
      }
      if (!res.ok) {
        throw new Error('Error al consultar el seguimiento.');
      }

      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Ocurrió un error al consultar el pedido. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const activeWhatsApp = order?.contact_whatsapp || contactWhatsapp || '523316929111';
  const cleanWA = activeWhatsApp.replace(/\D/g, '');

  const stepsConfig = [
    {
      num: 1,
      title: 'Recibido',
      desc: 'Tu pedido fue registrado en nuestro sistema.',
      date: order?.created_at ? formatDate(order.created_at) : null
    },
    {
      num: 2,
      title: 'En laboratorio',
      desc: 'Tus micas y armazón están en proceso de biselado y montaje.',
      date: order?.in_process_date ? formatDate(order.in_process_date) : null
    },
    {
      num: 3,
      title: 'Listo para entregar',
      desc: order?.delivery_method === 'SHIPPING'
        ? 'Tu paquete está empaquetado y listo para ser enviado.'
        : 'Tus lentes están listos para entrega en nuestra sucursal.',
      date: order?.ready_date ? formatDate(order.ready_date) : null
    },
    {
      num: 4,
      title: 'Entregado',
      desc: 'Tu pedido ha sido entregado exitosamente.',
      date: order?.delivered_date ? formatDate(order.delivered_date) : null
    }
  ];

  return (
    <div style={{ paddingTop: '100px', paddingBottom: '100px', backgroundColor: '#f8fafc', minHeight: '90vh' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 20px' }}>

        {/* Back Link if viewing an order */}
        {order && (
          <button
            onClick={() => {
              setOrder(null);
              setError(null);
              if (currentPath.startsWith('/p/')) {
                window.history.pushState({}, '', '/seguimiento');
                if (onNavigate) onNavigate('/seguimiento');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              padding: '0 0 16px 0',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Consultar otro pedido
          </button>
        )}

        {/* Header Title */}
        <div style={{ textAlign: 'center', marginBottom: order ? '28px' : '36px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            {order ? `Pedido ${order.folio}` : 'Seguimiento de tu Pedido'}
          </h1>
          <p style={{ fontSize: '15px', color: '#64748b', margin: 0 }}>
            {order 
              ? `Hola ${order.customer_first_name}, aquí puedes revisar el avance de tus lentes.`
              : 'Ingresa tu número de folio y tu teléfono celular para consultar el estado en tiempo real.'}
          </p>
        </div>

        {/* Search Form when not showing an order */}
        {!order && (
          <div style={{
            background: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            padding: '32px 28px'
          }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Folio del Pedido
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={folio}
                    onChange={(e) => setFolio(e.target.value.toUpperCase())}
                    placeholder="Ej. SO-0001 o WEB-123456"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '14px 16px',
                      fontSize: '15px',
                      borderRadius: '12px',
                      border: '1px solid #cbd5e1',
                      outline: 'none',
                      textTransform: 'uppercase',
                      fontFamily: 'inherit',
                      color: '#1e293b'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Teléfono celular (10 dígitos)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Ej. 3316929111"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    fontFamily: 'inherit',
                    color: '#1e293b'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#b91c1c',
                  fontSize: '14px'
                }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: '#1b2436',
                  color: '#ffffff',
                  padding: '14px 24px',
                  fontSize: '15px',
                  fontWeight: 600,
                  borderRadius: '12px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background 0.2s ease',
                  marginTop: '8px'
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Consultando...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Consultar pedido
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Order Details & Vertical Timeline View */}
        {order && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Summary Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              padding: '24px 28px'
            }}>
              {/* Product Pills & Delivery Method */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
                {(order.items || []).map((item, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: '#f1f5f9',
                      color: '#334155',
                      fontSize: '12px',
                      fontWeight: 600,
                      padding: '4px 12px',
                      borderRadius: '100px'
                    }}
                  >
                    {item}
                  </span>
                ))}
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: order.delivery_method === 'SHIPPING' ? '#f0fdf4' : '#eff6ff',
                    color: order.delivery_method === 'SHIPPING' ? '#166534' : '#1e40af',
                    fontSize: '12px',
                    fontWeight: 600,
                    padding: '4px 12px',
                    borderRadius: '100px'
                  }}
                >
                  {order.delivery_method === 'SHIPPING' ? (
                    <>
                      <Truck size={13} /> Envío a domicilio
                    </>
                  ) : (
                    <>
                      <Store size={13} /> Recoger en sucursal
                    </>
                  )}
                </span>
              </div>

              {/* Special Status Banners */}
              {order.status === 'Validando tu receta' && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  color: '#92400e',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <strong>Validando tu receta:</strong> Nuestro equipo de optometría está revisando los detalles médicos de tu receta para garantizar la máxima precisión en tu graduación. Te contactaremos si se requiere algún ajuste.
                </div>
              )}

              {order.status === 'Cancelado' && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  color: '#991b1b',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  <strong>Pedido cancelado:</strong> Este pedido ha sido cancelado. Si tienes preguntas o necesitas asistencia con tu reembolso, por favor contáctanos por WhatsApp.
                </div>
              )}

              {/* Estimated Delivery Banner */}
              {order.estimated_delivery_date && order.step < 4 && order.status !== 'Cancelado' && (
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Fecha estimada
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                      Lo esperamos listo el {formatDate(order.estimated_delivery_date)}
                    </div>
                  </div>
                </div>
              )}

              {/* Vertical Timeline */}
              <div style={{ marginTop: '16px', position: 'relative' }}>
                {stepsConfig.map((s, idx) => {
                  const isCompleted = order.step > s.num || (order.step === 4 && s.num === 4);
                  const isCurrent = order.step === s.num && order.step !== 4;
                  const isLast = idx === stepsConfig.length - 1;

                  return (
                    <div 
                      key={s.num} 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '16px', 
                        position: 'relative',
                        paddingBottom: isLast ? '0' : '28px'
                      }}
                    >
                      {/* Vertical line connecting steps */}
                      {!isLast && (
                        <div style={{
                          position: 'absolute',
                          left: '17px',
                          top: '34px',
                          bottom: '0',
                          width: '2px',
                          backgroundColor: isCompleted ? '#10b981' : '#e2e8f0',
                          transition: 'background-color 0.3s ease'
                        }} />
                      )}

                      {/* Step Indicator Circle */}
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 2,
                        backgroundColor: isCompleted 
                          ? '#10b981' 
                          : isCurrent 
                            ? '#1b2436' 
                            : '#f1f5f9',
                        color: isCompleted || isCurrent ? '#ffffff' : '#94a3b8',
                        border: isCurrent ? '3px solid #cbd5e1' : 'none',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(27, 36, 54, 0.1)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isCompleted ? (
                          <Check size={18} strokeWidth={2.5} />
                        ) : (
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>{s.num}</span>
                        )}
                      </div>

                      {/* Step Text Info */}
                      <div style={{ flex: 1, minWidth: 0, paddingTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '4px' }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                            color: isCurrent ? '#0f172a' : isCompleted ? '#334155' : '#94a3b8'
                          }}>
                            {s.title}
                          </span>
                          {s.date && (
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                              {s.date}
                            </span>
                          )}
                        </div>
                        <p style={{
                          fontSize: '13px',
                          color: isCurrent ? '#475569' : '#64748b',
                          margin: '4px 0 0',
                          lineHeight: 1.4
                        }}>
                          {s.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Carrier Shipping Guide Card */}
              {order.delivery_method === 'SHIPPING' && (order.carrier || order.tracking_guide) && (
                <div style={{
                  marginTop: '28px',
                  padding: '16px 20px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Envío por {order.carrier || 'Paquetería'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginTop: '2px', fontFamily: 'monospace' }}>
                      Guía: {order.tracking_guide || 'Pendiente de asignar'}
                    </div>
                  </div>

                  {order.tracking_guide && (
                    <a
                      href={getCarrierTrackingUrl(order.carrier, order.tracking_guide) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#1b2436',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 600,
                        padding: '10px 18px',
                        borderRadius: '10px',
                        textDecoration: 'none'
                      }}
                    >
                      Rastrear en paquetería <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Contact WhatsApp Support Card */}
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
              padding: '24px 28px',
              textAlign: 'center'
            }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>
                ¿Tienes dudas sobre tu pedido?
              </h3>
              <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 18px' }}>
                Nuestro equipo está listo para ayudarte en todo momento.
              </p>
              <a
                href={`https://wa.me/${cleanWA}?text=${encodeURIComponent(`Hola, tengo una duda sobre mi pedido ${order.folio}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#25D366',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 600,
                  padding: '14px 28px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(37, 211, 102, 0.3)'
                }}
              >
                <MessageCircle size={18} /> Escríbenos por WhatsApp
              </a>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
