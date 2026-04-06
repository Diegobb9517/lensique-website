import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Menu, X, MapPin, 
  MessageCircle, Eye, Stethoscope, RefreshCcw, Layers, Glasses,
  Calendar, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
import logo from './assets/logo.png';
import heroImg from './assets/clinic-room.jpg';
import monofocalImg from './assets/monofocal.png';
import progressiveImg from './assets/progressive.png';
import blueFilterImg from './assets/blue-filter.png';
import photochromicImg from './assets/photochromic.png';
import flatTopImg from './assets/bifocal-flat-top.png';
import invisibleImg from './assets/bifocal-invisible.png';
// Unused local images removed
import './App.css';

const API_BASE = 'https://lensique-pos.onrender.com';

const resolveImageUrl = (url: string, fallback: string | undefined) => {
  if (!url || url === 'undefined' || url === 'null' || url === '') return fallback || '';
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url}`;
};

// Catalog will be fetched from API


function FullCatalog({ isOpen, onClose, onAgendar, catalogData, initialFilter = 'Todas' }: { isOpen: boolean, onClose: () => void, onAgendar: (model: string) => void, catalogData: any[], initialFilter?: string }) {

  const [filter, setFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');

  const availableBrands = Array.from(new Set((catalogData || []).map(p => p.brand || 'Varios')));
  const [selectedBrand, setSelectedBrand] = useState(availableBrands[0] || 'Arnette');

  useEffect(() => {
    if (isOpen) {
      setFilter(initialFilter);
    }
  }, [isOpen, initialFilter]);

  // Update selectedBrand if it becomes invalid (e.g. data changes)
  useEffect(() => {
    if (availableBrands.length > 0 && !availableBrands.includes(selectedBrand)) {
      setSelectedBrand(availableBrands[0]);
    }
  }, [availableBrands]);

  const filteredProducts = (catalogData || []).map(p => ({
    ...p,
    image: resolveImageUrl(p.image_url, p.image),
    model: p.sku 
  })).filter(p => {
    const matchesFilter = filter === 'Todas' || (p.category || '').toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = (p.brand || 'Varios') === selectedBrand;
    return matchesFilter && matchesSearch && matchesBrand;
  });


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="full-catalog-view"
        >
          <div className="catalog-header">
            <button className="catalog-back" onClick={onClose}>
              <ChevronLeft size={24} /> Volver
            </button>
            <div className="catalog-brand-title">
              <h2>{selectedBrand}</h2>
              <span>Explora la colección completa</span>
            </div>
            <div className="catalog-search">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder="Buscar modelo o código..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="catalog-content">
            <div className="catalog-sidebar">
              <h3>Marca</h3>
              <div className="filter-list" style={{ marginBottom: '30px' }}>
                {availableBrands.map(b => (
                  <button 
                    key={b} 
                    className={`filter-btn ${selectedBrand === b ? 'active' : ''}`}
                    onClick={() => setSelectedBrand(b)}
                  >
                    {b}
                  </button>
                ))}
              </div>

              <h3>Categoría</h3>
              <div className="filter-list">
                {['Todas', 'Sol', 'Vista', 'Lentes de Contacto'].map(f => (
                  <button 
                    key={f} 
                    className={`filter-btn ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div className="sidebar-promo">
                <h4>Agendar Examen</h4>
                <p>¿No conoces tu graduación? Nosotros te ayudamos.</p>
                <button className="btn btn-outline small" onClick={() => { onClose(); onAgendar(''); }}>
                  Agendar Cita
                </button>
              </div>
            </div>

            <div className="catalog-products">
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id}
                    className="product-card"
                  >
                    <div className="product-img-box">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/400x400?text=Sin+Imagen';
                        }}
                      />
                      <div className="product-overlay">
                        <button className="btn btn-primary small" onClick={() => onAgendar(`${product.brand} ${product.model}`)}>
                          Agendar
                        </button>
                      </div>
                    </div>
                    <div className="product-info">
                      <span className="product-tag">{product.category}</span>
                      <h3>{product.name}</h3>
                      <p className="product-code">{product.model}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              {filteredProducts.length === 0 && (
                <div className="no-results">
                  <p>No encontramos modelos que coincidan con tu búsqueda.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>({
    hero_title: 'La perfección en tu mirada.',
    hero_subtitle: 'Diseño minimalista y tecnología óptica de vanguardia.',
    hero_eyebrow: 'Lensique Premium',
    about_title: 'Nuestro Compromiso',
    about_text: 'En Óptica Lensique combinamos precisión técnica con estilo vanguardista.',
    nav_links: JSON.stringify([
      { name: 'Catálogo', href: '#armazones' },
      { name: 'Servicios', href: '#servicios' },
      { name: 'Examen', href: '#servicios' },
      { name: 'Micas', href: '#micas' },
      { name: 'Nosotros', href: '#nosotros' }
    ]),
    category_bricks: JSON.stringify([
      { id: 'm1', title: 'Monofocales', description: 'Visión nítida en una sola distancia.', image: monofocalImg },
      { id: 'm2', title: 'Progresivos', description: 'Visión fluida en todas las distancias.', image: progressiveImg },
      { id: 'm3', title: 'Fotocromáticos', description: 'Lentes que se adaptan a la luz solar.', image: photochromicImg },
      { id: 'm4', title: 'Luz Azul', description: 'Protección para pantallas digitales.', image: blueFilterImg },
      { id: 'm5', title: 'Flat Top', description: 'Bifocal clásico con segmento definido.', image: flatTopImg },
      { id: 'm6', title: 'Invisible', description: 'Bifocal estético sin líneas visibles.', image: invisibleImg }
    ]),
    featured_products: JSON.stringify([
      { id: 1, name: 'Turbine', category: 'Lente de Sol', image: 'https://visual-click.com/cdn/shop/files/0AN4347U__27581W.jpg?v=1773129646&width=1500' },
      { id: 2, name: 'Maybe Mae', category: 'Armazón Vista', image: 'https://visual-click.com/cdn/shop/files/0AN6136__760.jpg?v=1773129687&width=1500' },
      { id: 3, name: 'Baker', category: 'Armazón Vista', image: 'https://visual-click.com/cdn/shop/files/0AN7241U__2900.jpg?v=1773129723&width=1500' },
      { id: 4, name: 'Laflor', category: 'Armazón Vista', image: 'https://visual-click.com/cdn/shop/files/0AN7246U__2758.jpg?v=1773129715&width=1500' }
    ]),
    featured_contact_lenses: JSON.stringify([]),
    full_catalog: JSON.stringify([])
  });

  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [catalogInitialFilter, setCatalogInitialFilter] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (isBookingOpen && !selectedDate) {
      const today = new Date();
      today.setHours(0,0,0,0);
      setSelectedDate(today);
    }
  }, [isBookingOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    const fetchContent = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s for live API

      try {
        const res = await fetch(`${API_BASE}/api/website/content`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn('API fallback:', err);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchContent();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calendar Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
  };

  const formatWhatsAppMessage = () => {
    if (!selectedDate || !selectedTime) return '';
    const dateStr = selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' });
    const productMention = selectedProduct ? ` por el modelo ${selectedProduct}` : '';
    return `Hola Lensique! Me gustaría agendar una cita${productMention} para el ${dateStr} a las ${selectedTime}.`;
  };

  const handleOpenBooking = (productName?: string) => {
    setSelectedProduct(productName || null);
    setIsBookingOpen(true);
  };

  const handleBookingConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;
    const message = formatWhatsAppMessage();
    const phone = settings.contact_whatsapp || '523316929111';
    const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    setIsBookingOpen(false);
  };

  const sliderRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 400;
      sliderRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const contactSliderRef = useRef<HTMLDivElement>(null);
  const scrollContacts = (direction: 'left' | 'right') => {
    if (contactSliderRef.current) {
      const scrollAmount = 400;
      contactSliderRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  const timeSlots = [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ];

  return (
    <div className="app-container">
      {/* Full Catalog View */}
      <FullCatalog 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        catalogData={settings.full_catalog_data || []}
        initialFilter={catalogInitialFilter}
        onAgendar={(prod) => {
          setIsCatalogOpen(false);
          handleOpenBooking(prod);
        }} 
      />


      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingOpen && (
          <div className="modal-overlay" onClick={() => setIsBookingOpen(false)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="booking-modal"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setIsBookingOpen(false)}>
                <X size={20} />
              </button>

              <div className="modal-header">
                <Calendar className="modal-icon" style={{ stroke: 'var(--accent)' }} />
                <h2>Agendar tu cita</h2>
                <p>Selecciona el día y hora que mejor te acomode.</p>
              </div>

              <div className="calendar-container">
                <div className="calendar-nav">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                    <ChevronLeft size={20} />
                  </button>
                  <h3 style={{ textTransform: 'capitalize' }}>
                    {currentMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })}
                  </h3>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                    <ChevronRight size={20} />
                  </button>
                </div>
                
                <div className="calendar-grid">
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <div key={`weekday-${d}-${i}`} className="calendar-day-label">{d}</div>
                  ))}
                  {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                    <div key={`pad-${i}`} className="calendar-day empty"></div>
                  ))}
                  {getDaysInMonth(currentMonth).map(date => {
                    const isSelected = selectedDate?.toDateString() === date.toDateString();
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const isToday = date.toDateString() === today.toDateString();
                    const isPast = date < today;
                    
                    return (
                      <button 
                        key={`day-${date.toISOString()}`}
                        className={`calendar-day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''} ${isToday && !isSelected ? 'is-today' : ''}`}
                        disabled={isPast}
                        onClick={() => setSelectedDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="time-selection"
                >
                  <div className="time-header">
                    <Clock size={16} />
                    <span>Horarios disponibles</span>
                  </div>
                  <div className="time-grid">
                    {timeSlots.map(time => (
                      <button 
                        key={`time-${time}`}
                        className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <div className="modal-footer">
                <button 
                  className={`btn btn-primary full-width ${(!selectedDate || !selectedTime) ? 'disabled' : ''}`}
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleBookingConfirm}
                >
                  Confirmar y enviar WhatsApp
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-content">
          <div className="logo">
            <img src={logo} alt="Lensique" className="logo-img" />
          </div>

          <div className="nav-links">
            {JSON.parse(settings.nav_links || '[]').map((link: any, i: number) => (
              <a 
                key={`nav-${i}-${link.name}`} 
                href={link.href} 
                className="nav-link"
                onClick={(e) => {
                  if (link.name === 'Catálogo') {
                    e.preventDefault();
                    setIsCatalogOpen(true);
                  }
                }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="nav-actions">
            <button className="nav-icon-btn"><Search size={20} /></button>
            <button className="nav-icon-btn mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <button 
              className="btn btn-primary d-none-mobile" 
              style={{ marginLeft: '10px' }}
              onClick={() => setIsBookingOpen(true)}
            >
              Agendar
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mobile-menu"
          >
            {JSON.parse(settings.nav_links || '[]').map((link: any, i: number) => (
              <a key={`mob-${i}-${link.name}`} href={link.href} className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section className="hero">
          <div className="hero-grid">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="hero-text-content"
            >
              <span className="hero-eyebrow">{settings.hero_eyebrow}</span>
              <h1 className="hero-title">{settings.hero_title}</h1>
              <p className="hero-subheading">{settings.hero_subtitle}</p>
              <div className="hero-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={() => setIsBookingOpen(true)}
                  style={{ position: 'relative', zIndex: 20 }}
                >
                  Agendar Cita
                </button>
                <button className="btn btn-outline" onClick={() => setIsCatalogOpen(true)}>
                  Ver Catálogo
                </button>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="hero-visual"
            >
              <img 
                src={resolveImageUrl(settings.hero_image_url, heroImg)} 
                className="hero-main-img" 
                alt="Clinic"
                onError={(e: any) => {
                  e.target.onerror = null;
                  e.target.src = heroImg;
                }}
              />
              <div className="hero-blur-backdrop"></div>
            </motion.div>
          </div>
        </section>

        <section id="populares" className="popular-carousel-section">
          <div className="section-header-flex">
            <div className="section-header-left">
              <span className="hero-eyebrow">Lo más buscado</span>
              <h2 className="section-title">Nuestros más populares.</h2>
            </div>
            <div className="slider-controls">
              <button className="slider-btn" onClick={() => scrollCarousel('left')} aria-label="Anterior">
                <ChevronLeft size={24} />
              </button>
              <button className="slider-btn" onClick={() => scrollCarousel('right')} aria-label="Siguiente">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <div className="comparison-slider" ref={sliderRef}>
            {(Array.isArray(settings.featured_products) ? settings.featured_products : JSON.parse(settings.featured_products || '[]')).map((product: any, idx: number) => (
              <motion.div 
                key={`popular-${idx}-${product.id}`}
                className="comparison-card"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="comp-img-box">
                  <img 
                    src={resolveImageUrl(product.image_url, product.image)} 
                    alt={product.name} 
                    className="comp-img" 
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = product.image;
                    }}
                  />
                </div>
                <div className="comp-info">
                  <span className="comp-tag">{product.category}</span>
                  <h3>{product.name}</h3>
                  <button className="btn btn-outline small" onClick={() => handleOpenBooking(`${product.brand} ${product.name}`)}>
                    Ver Detalles
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="servicios" className="pro-services-section">
          <div className="section-header">
            <span className="hero-eyebrow">Servicios Profesionales</span>
            <h2 className="section-title">Cuidamos tu salud visual.</h2>
            <p className="section-subtitle">Atención médica especializada con tecnología de última generación.</p>
          </div>
          <div className="pro-services-grid">
            {[
              { id: 's1', title: 'Examen de la Vista', desc: 'Tecnología computarizada para una graduación exacta.', icon: <Eye size={32} />, cta: 'Agendar ahora', action: () => handleOpenBooking('Examen de la Vista') },
              { id: 's2', title: 'Consulta Oftalmológica', desc: 'Atención médica especializada para tu salud ocular.', icon: <Stethoscope size={32} />, cta: 'Agendar ahora', action: () => handleOpenBooking('Consulta Oftalmológica') },
              { id: 's3', title: 'Actualización de Micas', desc: 'Renueva tus lentes actuales con nuestra última tecnología.', icon: <RefreshCcw size={32} />, cta: 'Ver tecnologías', action: () => { window.location.hash = 'micas'; } },
              { id: 's4', title: 'Lentes de Contacto', desc: 'Adaptación y venta de las mejores marcas del mercado.', icon: <Layers size={32} />, cta: 'Ver catálogo', action: () => { setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); } },
              { id: 's5', title: 'Armazones', desc: 'Selección curada de diseños internacionales.', icon: <Glasses size={32} />, cta: 'Ver catálogo', action: () => { setCatalogInitialFilter('Todas'); setIsCatalogOpen(true); } }
            ].map((service) => (
              <motion.div 
                key={service.id}
                className="pro-service-card"
                whileHover={{ y: -10 }}
                onClick={service.action}
              >
                <div className="pro-service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
                <span className="pro-service-link">{service.cta} →</span>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="micas" className="services-section">
          <div className="section-header-left">
            <span className="hero-eyebrow">Tecnología en Lentes</span>
            <h2 className="section-title">La mejor solución para tus ojos.</h2>
            <p className="section-subtitle">Micas de alta precisión adaptadas a tu estilo de vida.</p>
          </div>
          <div className="bento-container compact-grid">
            {JSON.parse(settings.category_bricks || '[]').map((brick: any, idx: number) => (
              <motion.div 
                key={`brick-fix-${idx}-${brick.id}`}
                className="bento-card"
              >
                <div className="bento-img-wrapper">
                  <img 
                    src={resolveImageUrl(brick.image_url, brick.image)} 
                    alt={brick.title} 
                    className="bento-img" 
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = brick.image;
                    }}
                  />
                </div>
                <div className="bento-content">
                  <h3>{brick.title}</h3>
                  <p>{brick.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="armazones" className="comparison-section">
          <div className="section-header-flex">
            <div className="section-header">
              <h2 className="section-title">Diseños que inspiran.</h2>
              <p className="section-subtitle">Exclusividad y precisión en cada detalle.</p>
            </div>
            <div className="slider-controls">
              <button className="slider-btn" onClick={() => scrollCarousel('left')} aria-label="Anterior">
                <ChevronLeft size={24} />
              </button>
              <button className="slider-btn" onClick={() => scrollCarousel('right')} aria-label="Siguiente">
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
          
          <div className="comparison-slider" ref={sliderRef}>
            {(Array.isArray(settings.featured_products) ? settings.featured_products : JSON.parse(settings.featured_products || '[]')).map((product: any, idx: number) => (
              <div className="comparison-card" key={`prod-fix-${idx}-${product.id}`}>
                <div className="comp-img-box">
                  <img 
                    src={resolveImageUrl(product.image_url, product.image)} 
                    alt={product.name} 
                    className="comp-img" 
                    onError={(e: any) => {
                      e.target.onerror = null;
                      e.target.src = product.image;
                    }}
                  />
                </div>
                <div className="comp-info">
                  <span className="comp-tag">{product.category}</span>
                  <h3>{product.name}</h3>
                  <button className="btn btn-outline small" onClick={() => handleOpenBooking(`${product.brand} ${product.name}`)}>
                    Agendar Cita
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="nosotros" className="about-section">
          <div className="about-content">
            <span className="hero-eyebrow">Nosotros</span>
            <h2 className="section-title">{settings.about_title}</h2>
            <p className="about-text">{settings.about_text}</p>
          </div>
        </section>

        {settings.featured_contact_lenses && (Array.isArray(settings.featured_contact_lenses) ? settings.featured_contact_lenses.length > 0 : JSON.parse(settings.featured_contact_lenses || '[]').length > 0) && (
          <section id="lentes-contacto" className="contact-lenses-section">
            <div className="section-header-flex">
              <div className="section-header">
                <h2 className="section-title">Claridad sin límites.</h2>
                <p className="section-subtitle">Lentes de contacto de última generación.</p>
              </div>
              <div className="slider-controls">
                <button className="slider-btn" onClick={() => scrollContacts('left')} aria-label="Anterior">
                  <ChevronLeft size={24} />
                </button>
                <button className="slider-btn" onClick={() => scrollContacts('right')} aria-label="Siguiente">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
            
            <div className="comparison-slider contact-slider" ref={contactSliderRef}>
              {(Array.isArray(settings.featured_contact_lenses) ? settings.featured_contact_lenses : JSON.parse(settings.featured_contact_lenses || '[]')).map((product: any, idx: number) => (
                <div className="comparison-card contact-card" key={`lc-fix-${idx}-${product.id}`}>
                  <div className="comp-img-box">
                    <img 
                      src={resolveImageUrl(product.image_url, product.image)} 
                      alt={product.name} 
                      className="comp-img" 
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src = product.image;
                      }}
                    />
                  </div>
                  <div className="comp-info">
                    <span className="comp-tag lc-tag">{product.brand}</span>
                    <h3>{product.name}</h3>
                    <button className="btn btn-outline lc-btn small" onClick={() => handleOpenBooking(`${product.brand} ${product.name}`)}>
                      Agendar Cita
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contacto" className="location-section">
          <div className="location-grid">
            <div className="location-info">
              <span className="hero-eyebrow">Ubicación</span>
              <h2 className="section-title">Visítanos hoy mismo.</h2>
              <div className="info-item">
                <div className="info-icon"><MapPin /></div>
                <div>
                  <h4>Dirección</h4>
                  <p>{settings.contact_location || 'Av. Guadalupe 1296, Jardines de San Ignacio, 45040 Zapopan, Jal.'}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MessageCircle /></div>
                <div>
                  <h4>WhatsApp</h4>
                  <p>{settings.contact_whatsapp || '+52 33 1692 9111'}</p>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => setIsBookingOpen(true)}
                style={{ marginTop: '20px' }}
              >
                Agendar Cita
              </button>
            </div>
            <div className="location-visual map-container">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3733.3776262453664!2d-103.4009712850734!3d20.65431698620248!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8428ae7d4a46a489%3A0x6b8f75c6c06b29f!2sAv.%20Guadalupe%201296%2C%20Chapalita%2C%2044500%20Guadalajara%2C%20Jal.%2C%20Mexico!5e0!3m2!1sen!2sus!4v1711949100000!5m2!1sen!2sus"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="location-map-frame"
              ></iframe>
              <div className="map-overlay-badge">
                Jardines de San Ignacio
              </div>
            </div>
          </div>
        </section>

      </main>

      <a 
        href={`https://wa.me/${(settings.contact_whatsapp || '523316929111').replace(/\D/g, '')}`} 
        className="whatsapp-float"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 448 512" width="32" height="32" className="wa-svg">
          <path fill="#25D366" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.7 17.4 69.4 26.5 106.3 26.5h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.3-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.4-16.4-14.7-27.5-32.8-30.7-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.5 5.5-9.2 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-top">
            <div className="footer-logo">
              <img src={logo} alt="Lensique" className="footer-logo-img" />
            </div>
            <div className="footer-links-grid">
              <div className="footer-col">
                <h4>Servicios</h4>
                <a href="#micas">Micas</a>
                <a href="#armazones">Armazones</a>
                <a href="#examen">Examen</a>
              </div>
              <div className="footer-col">
                <h4>Empresa</h4>
                <a href="#nosotros">Nosotros</a>
                <a href="#sucursales">Sucursales</a>
              </div>
              <div className="footer-col">
                <h4>Contacto</h4>
                <a href="mailto:hola@lensique.com.mx">hola@lensique.com.mx</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Óptica Lensique. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
