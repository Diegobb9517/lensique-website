import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Menu, X, MapPin, MessageCircle,
  Calendar, Clock, ChevronLeft, ChevronRight, User, Heart, ShoppingBag,
  Maximize, Camera, Trash2, Sliders, ShieldCheck, Glasses, Sparkles, CreditCard, Stethoscope, AlertTriangle
} from 'lucide-react';
import ProductCarousel from './components/ProductCarousel';
import TechnologyInfoPage from './components/TechnologyInfoPage';
import LensConfiguratorModal from './components/LensConfiguratorModal';
import ContactLensConfiguratorModal from './components/ContactLensConfiguratorModal';
import ServiceDetailsPage from './components/ServiceDetailsPage';
import InfoPage, { type InfoPageData } from './components/InfoPage';
import { type ServiceInfoData } from './components/ServiceInfoModal';
import { ImageWithSkeleton } from './components/ImageWithSkeleton';
import { StyleQuiz } from './components/StyleQuiz';
import { FRAME_GRADUACION_OPTIONS, AR_OPTIONS, PHOTOCHROMIC_OPTIONS, TINTING_OPTIONS, MATERIAL_OPTIONS } from './lib/configuratorConstants';
import logo from './assets/logo.png';
import heroImg from './assets/hero_glasses.png';
import { getInventedName } from './lib/format';
import { ProductCard } from './components/ProductCard';

const formatWhatsappNumber = (waStr: string) => {
  if (!waStr) return '+52 33 1692 9111';
  const clean = waStr.replace(/\D/g, '');
  if (clean.length === 12 && clean.startsWith('52')) {
    return `+${clean.substring(0,2)} ${clean.substring(2,4)} ${clean.substring(4,8)} ${clean.substring(8,12)}`;
  }
  if (clean.length === 10) {
    return `+52 ${clean.substring(0,2)} ${clean.substring(2,6)} ${clean.substring(6,10)}`;
  }
  return waStr;
};

import cv7600Img from './assets/cv-7600.jpg';
import clinicRoomImg from './assets/clinic-room.jpg';
import eyeExamImg1 from './assets/eye_exam_1.jpg';
import eyeExamImg2 from './assets/eye_exam_2.jpg';
import editorialImg1 from './assets/DSC09657.jpg';
import editorialCk from './assets/editorial-ck.jpg';
import editorialCarrera from './assets/editorial-carrera.jpg';
import editorialArmazon from './assets/editorial_armazon.jpg';
import storeInteriorImg from './assets/DSC09639.jpg';
import armazonesServiceImg from './assets/DSC09746.jpg';
import micasImg from './assets/DSC09710.jpg';
import contactLensesImg from './assets/contact_lenses.png';
import lsBluelight from './assets/lifestyle_bluelight.png';
import lsProgressives from './assets/lifestyle_progressives.png';
import lsAntifatigue from './assets/lifestyle_antifatigue.png';
import lsPhotochromic from './assets/lifestyle_photochromic.png';
import lsFlattop from './assets/lifestyle_flattop.png';
import lsInvisible from './assets/lifestyle_invisible.png';
import lsCustom from './assets/lifestyle_custom.png';
import lsAntireflective from './assets/realistic_antireflective.png';
import arnette4373 from './assets/arnette_0AN4373.png';
import styleAviator from './assets/style_aviator.png';
import styleCateye from './assets/style_cateye.png';
import styleRectangular from './assets/style_rectangular.png';
import styleRound from './assets/style_round.png';
import './App.css';

const faceShapeGuide = [
  { 
    id: 'f1',
    glassesShape: 'Rectangulares',
    faceShape: 'Rostros redondos u ovalados',
    description: 'Añaden ángulos y definen tus facciones, alargando visualmente el rostro.',
    image: styleRectangular
  },
  {
    id: 'f2',
    glassesShape: 'Redondos o Pantos',
    faceShape: 'Rostros cuadrados o angulares',
    description: 'Sus curvas suavizan las líneas fuertes de la mandíbula y equilibran las proporciones.',
    image: styleRound
  },
  {
    id: 'f3',
    glassesShape: 'Cat Eye / Mariposa',
    faceShape: 'Rostros diamante o triángulo',
    description: 'Acentúan los pómulos y dirigen la atención hacia la parte superior del rostro.',
    image: styleCateye
  },
  {
    id: 'f4',
    glassesShape: 'Estilo Aviador',
    faceShape: 'Rostros tipo corazón u ovalados',
    description: 'La silueta ancha en la parte inferior equilibra perfectamente una frente amplia.',
    image: styleAviator
  }
];

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3000' : 'https://lensique-pos.onrender.com';

export const resolveImageUrl = (url: string, fallback: string | undefined, width?: number) => {
  const isInvalid = (val: any) => !val || val === 'undefined' || val === 'null' || val === '';
  
  if (isInvalid(url)) {
    return isInvalid(fallback) ? '' : fallback as string;
  }
  
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http')) {
    const cleanUrl = targetUrl.startsWith('/') ? targetUrl : `/${targetUrl}`;
    targetUrl = `${API_BASE}${cleanUrl}`;
  }

  if (targetUrl.includes('lensique-pos.onrender.com')) {
    // Restauramos la calidad original pasando q=100 y omitiendo el redimensionamiento,
    // o simplemente devolvemos la URL original si prefieren 100% fidelidad.
    // Para asegurar 100% de calidad sin pérdida, regresaremos la URL directa del backend por ahora.
    return targetUrl;
  }

  return targetUrl;
};

const safeJsonParse = (str: any, fallback: any = []) => {
  if (!str) return fallback;
  if (typeof str !== 'string') return Array.isArray(str) ? str : fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    console.warn('JSON Parse Error:', e, 'on string:', str);
    return fallback;
  }
};

// Catalog will be fetched from API

export const getContactLensUsage = (name: string) => {
  const n = (name ? name.toString() : '').toUpperCase();
  if (n.includes('1 DAY') || n.includes('DAILY') || n.includes('DIARIO') || n.includes('ONE DAY')) return 'Uso Diario';
  if (n.includes('BIWEEKLY') || n.includes('QUINCENAL') || n.includes('OASYS')) return 'Uso Quincenal';
  if (n.includes('MONTHLY') || n.includes('MENSUAL') || n.includes('ULTRA') || n.includes('AIR OPTIX') || n.includes('BIOFINITY')) return 'Uso Mensual';
  if (n.includes('YEARLY') || n.includes('ANUAL') || n.includes('ANNUAL')) return 'Uso Anual';
  return 'Todos';
};


function FullCatalog({ 
  isOpen, 
  onClose, 
  onViewProduct, 
  onTryOn,
  catalogData, 
  initialFilter = 'Todas',
  onConfigureProduct
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  onViewProduct: (product: any) => void,
  onConfigureProduct: (product: any) => void,
  onTryOn: (product: any) => void,
  catalogData: any[], 
  initialFilter?: string 
}) {

  const [filter, setFilter] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [contactUsageFilter, setContactUsageFilter] = useState('Todos');
  const availableBrands = Array.from(new Set(
    (catalogData || [])
      .filter(p => filter === 'Todas' || (
        filter === 'Armazones' ? !(p.category || 'vista').toLowerCase().includes('contacto') :
        filter === 'Lentes de Contacto' ? (p.category || 'vista').toLowerCase().includes('contacto') :
        (p.category || 'vista').toLowerCase().includes(filter.toLowerCase())
      ))
      .map(p => p.brand || 'Varios')
  )).sort();
  
  const [selectedBrand, setSelectedBrand] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(24);

  useEffect(() => {
    setVisibleCount(24);
  }, [filter, searchQuery, selectedBrand, contactUsageFilter]);

  useEffect(() => {
    if (isOpen) {
      setFilter(initialFilter || 'Todas');
      setSelectedBrand('Todas');
      setContactUsageFilter('Todos');
    }
  }, [isOpen, initialFilter]);

  // Update selectedBrand if it becomes invalid (e.g. data changes)
  useEffect(() => {
    if (selectedBrand !== 'Todas' && availableBrands.length > 0 && !availableBrands.includes(selectedBrand)) {
      setSelectedBrand('Todas');
    }
  }, [availableBrands, selectedBrand]);

  const filteredProducts = (catalogData || []).map(p => ({
    ...p,
    image: resolveImageUrl(p.image_url, p.image),
    model: p.sku 
  })).filter(p => {
    const searchLower = searchQuery.toLowerCase();
    const nameLower = (p.name || '').toLowerCase();
    const brandLower = (p.brand || '').toLowerCase();
    const modelLower = (p.model || '').toLowerCase();
    
    const matchesSearch = searchQuery === '' || 
                         nameLower.includes(searchLower) || 
                         brandLower.includes(searchLower) ||
                         modelLower.includes(searchLower);

    // If searching, we relax the brand/category requirement unless they specifically filter
    const matchesBrand = searchQuery !== '' || selectedBrand === 'Todas' || (p.brand || 'Varios') === selectedBrand;
    const matchesCategory = searchQuery !== '' || filter === 'Todas' || (
      filter === 'Armazones' ? !(p.category || 'vista').toLowerCase().includes('contacto') :
      filter === 'Lentes de Contacto' ? ((p.category || 'vista').toLowerCase().includes('contacto') && (contactUsageFilter === 'Todos' || getContactLensUsage(p.name) === contactUsageFilter)) :
      (p.category || 'vista').toLowerCase().includes(filter.toLowerCase())
    );
    
    return matchesSearch && matchesBrand && matchesCategory;
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
          {/* Top bar: solo logo */}
          <div className="catalog-topbar">
            <img src={logo} alt="Lensique" className="catalog-header-logo" />
          </div>

          {/* Second bar: Volver + Buscar */}
          <div className="catalog-header">
            <div className="catalog-header-left">
              <button className="catalog-back" onClick={onClose}>
                <ChevronLeft size={20} /> Volver
              </button>
            </div>

            <div className="catalog-header-right">
              <div className="catalog-search">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Buscar modelo..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="catalog-filters-top" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '16px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
              <div className="filter-pills">
                {['Todas', 'Armazones', 'Lentes de Contacto'].map(f => (
                  <button 
                    key={f} 
                    className={`filter-pill ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
              
              <div className="filter-group" style={{ margin: 0 }}>
                <select 
                  className="brand-select"
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                >
                  <option value="Todas">Marcas</option>
                  {availableBrands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {filter === 'Lentes de Contacto' && (
                <div className="filter-group" style={{ margin: 0 }}>
                  <select 
                    className="brand-select"
                    value={contactUsageFilter}
                    onChange={(e) => setContactUsageFilter(e.target.value)}
                  >
                    <option value="Todos">Uso</option>
                    {['Uso Diario', 'Uso Quincenal', 'Uso Mensual', 'Uso Anual'].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="catalog-count" style={{ fontSize: '13px', color: '#888', fontWeight: 400, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {filteredProducts.length} modelo{filteredProducts.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="catalog-content">
            <div className="catalog-products">
              {(catalogData && catalogData.length > 0) ? (
                <>
                <div className="products-grid">
                  {filteredProducts.slice(0, visibleCount).map(product => (
                    <ProductCard 
                      key={product.id}
                      product={product}
                      fallbackImage={String(product.category).toLowerCase().includes('contacto') ? contactLensesImg : heroImg}
                      onClick={() => {
                        if (String(product.category || '').toLowerCase().includes('contacto')) {
                          onViewProduct(product);
                        } else {
                          onViewProduct(product);
                        }
                      }}
                      onSelectAction={(prod) => {
                        if (String(prod.category || '').toLowerCase().includes('contacto')) {
                          onViewProduct(prod);
                        } else {
                          onConfigureProduct(prod);
                        }
                      }}
                    />
                  ))}
                </div>
                {visibleCount < filteredProducts.length && (
                  <div style={{ textAlign: 'center', marginTop: '40px', paddingBottom: '40px' }}>
                    <button 
                      className="btn btn-wp-secondary" 
                      onClick={() => setVisibleCount(prev => prev + 24)}
                    >
                      Cargar más modelos
                    </button>
                  </div>
                )}
                </>
              ) : (
                <div className="products-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="product-card-editorial skeleton-card">
                      <div className="skeleton-img"></div>
                      <div className="skeleton-text skeleton-title"></div>
                      <div className="skeleton-text skeleton-sub"></div>
                    </div>
                  ))}
                </div>
              )}
              {(catalogData && catalogData.length > 0 && filteredProducts.length === 0) && (
                <div className="no-results">
                  <div className="no-results-icon"><Search size={32} /></div>
                  <h3>No encontramos modelos</h3>
                  <p>Intenta con otra marca o categoría.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VirtualTryOn({ 
  isOpen, 
  onClose, 
  product 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  product: any 
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scale, setScale] = useState(1.0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("No se pudo acceder a la cámara. Por favor permite los permisos.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="vto-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="vto-container">
          <div className="vto-header">
            <h3>Prueba Virtual: {product?.name}</h3>
            <button className="vto-close" onClick={onClose}><X size={24} /></button>
          </div>

          <div className="vto-viewport">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="vto-video"
            />
            
            {/* The Glasses Overlay */}
            <motion.div 
              drag
              dragMomentum={false}
              className="vto-glasses-box"
              style={{ 
                x: positionX, 
                y: positionY, 
                scale: scale,
                cursor: 'grab' 
              }}
            >
              <img 
                src={product?.image} 
                alt="Try on glasses" 
                className="vto-glasses-img"
              />
            </motion.div>

            <div className="vto-hint">
              Arrastra los lentes para ajustarlos a tu rostro
            </div>
          </div>

          <div className="vto-controls">
            <div className="control-group">
              <label><Maximize size={16} /> Tamaño</label>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.01" 
                value={scale} 
                onChange={(e) => setScale(parseFloat(e.target.value))} 
              />
            </div>
            
            <div className="control-group-grid">
              <div className="control-group">
                <label><Sliders size={16} /> Vertical</label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="1" 
                  value={positionY} 
                  onChange={(e) => setPositionY(parseInt(e.target.value))} 
                />
              </div>
              <div className="control-group">
                <label><Sliders size={16} /> Horizontal</label>
                <input 
                  type="range" 
                  min="-200" 
                  max="200" 
                  step="1" 
                  value={positionX} 
                  onChange={(e) => setPositionX(parseInt(e.target.value))} 
                />
              </div>
            </div>

            <div className="vto-actions">
              <button className="btn btn-outline" onClick={() => { setScale(1.0); setPositionX(0); setPositionY(0); }}>
                Resetear
              </button>
              <button className="btn btn-primary" onClick={onClose}>
                Me encantan
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

class ErrorBoundary extends React.Component<any, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '50px', background: 'red', color: 'white' }}>
        <h1>Something went wrong!</h1>
        <pre>{this.state.error?.toString()}</pre>
        <pre>{this.state.error?.stack}</pre>
      </div>;
    }
    return this.props.children;
  }
}

function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

const warrantyData: InfoPageData = {
  title: 'Garantías',
  layout: 'grid',
  sections: [
    {
      heading: 'Garantía de Armazones',
      icon: ShieldCheck,
      content: <p>Nuestros armazones cuentan con 1 año de garantía contra defectos de fabricación. Esto incluye problemas en bisagras, soldaduras y recubrimientos (siempre que no sea por mal uso, caídas o productos químicos).</p>
    },
    {
      heading: 'Garantía de Adaptación',
      icon: Glasses,
      content: <p>Entendemos que adaptarse a una nueva graduación puede tomar tiempo. Si después de 15 días sientes molestias o no logras adaptarte a tus nuevas micas, te ofrecemos una revisión gratuita y, de ser necesario, un cambio de graduación sin costo adicional.</p>
    },
    {
      heading: 'Garantía en Tratamientos',
      icon: Sparkles,
      content: <p>Los tratamientos antirreflejantes y fotocromáticos tienen una garantía de 90 días contra desprendimiento o manchas anormales que no sean causadas por rayones o limpieza inadecuada.</p>
    },
    {
      heading: 'Montaje en Armazones Propios',
      icon: AlertTriangle,
      content: <p>El montaje en armazones proporcionados por el cliente se realiza con el máximo cuidado profesional. No obstante, Óptica Lensique <strong>no asume responsabilidad por daños o roturas</strong> que puedan ocurrir durante el proceso, en particular en armazones usados, desgastados o de material frágil. En caso de daño, se ofrecerá un precio preferencial en un armazón nuevo de nuestro catálogo.</p>
    }
  ]
};

const faqData: InfoPageData = {
  title: 'Preguntas Frecuentes',
  layout: 'grid',
  sections: [
    {
      heading: '¿Cuánto tiempo tardan en entregar mis lentes?',
      icon: Clock,
      content: <p>Para micas monofocales de inventario, el tiempo de entrega es de 2 a 3 días hábiles. Para trabajos de laboratorio (progresivos, altos índices, o tratamientos especiales), el tiempo estimado es de 5 a 7 días hábiles.</p>
    },
    {
      heading: '¿Tienen meses sin intereses?',
      icon: CreditCard,
      content: <p>Sí, contamos con 3 y 6 meses sin intereses pagando con tarjetas de crédito participantes en compras mayores a $2,500 MXN.</p>
    },
    {
      heading: '¿Qué incluye el examen de la vista?',
      icon: Stethoscope,
      content: <p>Nuestro examen visual es completo e incluye: refracción por computadora, agudeza visual, prueba de balance binocular y recomendación personalizada por parte de nuestro Optometrista certificado.</p>
    }
  ]
};

const privacyData: InfoPageData = {
  title: 'Aviso de Privacidad',
  layout: 'standard',
  sections: [
    {
      heading: 'Tratamiento de Datos Personales',
      content: <p>En Óptica Lensique, con domicilio en Av. Guadalupe 1296, Zapopan, Jalisco, somos responsables del uso y protección de sus datos personales. Su información personal (nombre, teléfono, prescripción optométrica) será utilizada para proveer los productos y servicios que ha solicitado, informarle sobre cambios en los mismos y evaluar la calidad del servicio que le brindamos.</p>
    },
    {
      heading: 'Derechos ARCO',
      content: <p>Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones del uso que les damos (Acceso). Asimismo, es su derecho solicitar la corrección de su información personal en caso de que esté desactualizada, sea inexacta o incompleta (Rectificación); que la eliminemos de nuestros registros o bases de datos cuando considere que la misma no está siendo utilizada adecuadamente (Cancelación); así como oponerse al uso de sus datos personales para fines específicos (Oposición). Para ejercer estos derechos, puede contactarnos vía WhatsApp.</p>
    }
  ]
};

const termsData: InfoPageData = {
  title: 'Términos y Condiciones',
  layout: 'standard',
  sections: [
    {
      heading: 'Uso del Sitio',
      content: <p>El contenido de las páginas de este sitio web es para su información y uso general. Está sujeto a cambios sin previo aviso.</p>
    },
    {
      heading: 'Precios y Pagos',
      content: <p>Los precios mostrados están en pesos mexicanos (MXN) e incluyen IVA. Nos reservamos el derecho de modificar los precios en cualquier momento. Las transacciones se completan de forma presencial o a través de enlaces de pago verificados solicitados vía WhatsApp.</p>
    }
  ]
};

const cookiesData: InfoPageData = {
  title: 'Política de Cookies',
  layout: 'standard',
  sections: [
    {
      heading: 'Uso de Cookies',
      content: <p>Este sitio web utiliza cookies para mejorar la experiencia del usuario y analizar el tráfico del sitio. Al navegar por nuestro sitio, usted acepta nuestro uso de cookies de acuerdo con esta política. Utilizamos cookies de Google Analytics y Meta Pixel para medir la efectividad de nuestra publicidad y entender cómo los visitantes interactúan con nuestro sitio web.</p>
    }
  ]
};

function App() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [settings, setSettings] = useState<any>({
    hero_title: 'La perfección en tu mirada.',
    hero_subtitle: 'Diseño minimalista y tecnología óptica de vanguardia.',
    hero_eyebrow: 'Lensique Premium',
    about_title: 'Nuestro Compromiso',
    about_text: 'Lensique nació en Zapopan con una idea simple: comprar lentes no debería ser aburrido, complicado, ni costoso. Nos dimos cuenta de que la gente tenía que elegir entre diseños increíbles a precios inalcanzables, o armazones genéricos de mala calidad. Por eso decidimos cambiar las reglas. Traemos los armazones con más estilo y usamos tecnología de última generación en nuestro consultorio clínico para darte una graduación perfecta. Todo esto con un trato humano, directo y transparente. Porque ver bien y verte bien es tu derecho, no un lujo.',
    nav_links: JSON.stringify([
      { name: 'Catálogo', href: '#armazones' },
      { name: 'Servicios', href: '#servicios' },
      { name: 'Examen', href: '#servicios' },
      { name: 'Micas', href: '#micas' },
      { name: 'Nosotros', href: '#nosotros' }
    ]),
    category_bricks: JSON.stringify([
      { id: 'm1', title: 'Monofocales', description: 'Visión nítida en una sola distancia.', image: lsAntifatigue },
      { id: 'm2', title: 'Bifocales Flat Top', description: 'Bifocal clásico con segmento definido.', image: lsFlattop },
      { id: 'm3', title: 'Bifocales Invisibles', description: 'Bifocal estético sin líneas visibles.', image: lsInvisible },
      { id: 'm4', title: 'Progresivos', description: 'Visión fluida en todas las distancias.', image: lsProgressives },
      { id: 'm5', title: 'Fotocromático', description: 'Lentes que se adaptan a la luz solar.', image: lsPhotochromic },
      { id: 'm6', title: 'Luz azul', description: 'Protección para pantallas digitales.', image: lsBluelight },
      { id: 'm7', title: 'Trabajos personalizados', description: 'Fabricación especial a medida.', image: lsCustom },
      { id: 'm8', title: 'Antirreflejantes', description: 'Tratamientos premium sin deslumbramientos.', image: lsAntireflective }
    ]),
    featured_products: JSON.stringify([]),
    featured_contact_lenses: JSON.stringify([]),
    full_catalog: JSON.stringify([]),
    full_catalog_data: []
  });

  
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedInfoPage, setSelectedInfoPage] = useState<InfoPageData | null>(null);
  const [selectedServiceInfo, setSelectedServiceInfo] = useState<ServiceInfoData | null>(null);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isStyleQuizOpen, setIsStyleQuizOpen] = useState(false);
  const [isTryOnOpen, setIsTryOnOpen] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<any>(null);
  const [catalogInitialFilter, setCatalogInitialFilter] = useState('Todas');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedProductDetail, setSelectedProductDetail] = useState<any | null>(null);
  const [configuratorProduct, setConfiguratorProduct] = useState<any>(null);
  const [contactConfiguratorProduct, setContactConfiguratorProduct] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [bookingName, setBookingName] = useState<string>('');
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
      const timeoutId = setTimeout(() => {
        console.warn('API fetch timed out after 60s - checking if server is waking up...');
        controller.abort();
      }, 60000); 

      try {
        const res = await fetch(`${API_BASE}/api/website/content`, { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();
          setSettings((prev: any) => {
            // Option B: No merge. API is the source of truth.
            const filterCH = (arr: any[]) => arr.filter(p => (p.brand || '').toUpperCase().trim() !== 'CH');
            
            const featuredProducts = filterCH(safeJsonParse(data.featured_products));
            const featuredContact = filterCH(safeJsonParse(data.featured_contact_lenses));
            const catalog = filterCH(safeJsonParse(data.full_catalog_data));
            
            return { 
              ...prev, 
              ...data, 
              featured_products: JSON.stringify(featuredProducts),
              featured_contact_lenses: JSON.stringify(featuredContact),
              full_catalog_data: JSON.stringify(catalog)
            };
          });
        }
      } catch (err: any) {
        if (err.name === 'AbortError') {
          console.error('Fetch aborted: The server took too long to respond (Render sleep?).');
        } else {
          console.error('Error fetching website content:', err);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    fetchContent();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // UseEffect for body scroll lock when any overlay is open
  useEffect(() => {
    if (isBookingOpen || isCatalogOpen || selectedProductDetail || configuratorProduct || contactConfiguratorProduct || isMobileMenuOpen || isTryOnOpen || selectedTech) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isBookingOpen, isCatalogOpen, selectedProductDetail, configuratorProduct, contactConfiguratorProduct, isMobileMenuOpen, isTryOnOpen, selectedTech]);

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
    const nameIntro = bookingName.trim() ? `Soy ${bookingName.trim()}, me` : 'Me';
    return `Hola Lensique! ${nameIntro} gustaría agendar una cita${productMention} para el ${dateStr} a las ${selectedTime}.`;
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
  const contactSliderRef = useRef<HTMLDivElement>(null);
  const micasSliderRef = useRef<HTMLDivElement>(null);
  const scrollMicas = (direction: 'left' | 'right') => {
    if (micasSliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      micasSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollContact = (direction: 'left' | 'right') => {
    if (contactSliderRef.current) {
      const scrollAmount = direction === 'left' ? -304 : 304;
      contactSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollPopulares = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -284 : 284;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const servicesSliderRef = useRef<HTMLDivElement>(null);
  const scrollServicios = (direction: 'left' | 'right') => {
    if (servicesSliderRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      servicesSliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const isEyeExam = !selectedProduct || selectedProduct.toLowerCase().includes('examen');
  const timeSlots = isEyeExam ? [
    '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM'
  ] : [
    '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', 
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  return (
    <div className="app-container">
      <AnimatePresence>
        {selectedTech && (
          <TechnologyInfoPage 
            tech={selectedTech} 
            resolvedImage={resolveImageUrl(selectedTech.image_url, selectedTech.image) || heroImg}
            onBack={() => setSelectedTech(null)} 
            onBook={() => {
              setSelectedTech(null);
              handleOpenBooking(`Consulta ${selectedTech.title}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProductDetail && (
          <motion.div
            className="product-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProductDetail(null)}
          >
            <motion.div
              className="product-detail-modal"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="product-detail-close" onClick={() => setSelectedProductDetail(null)}><X size={20} /></button>

              {/* Left: Image Carousel */}
              <div className="product-detail-img-col">
                <div className="product-detail-img-box w-full max-w-full" style={{ position: 'relative' }}>
                  {(selectedProductDetail.stock != null && selectedProductDetail.stock !== '' && Number(selectedProductDetail.stock) <= 0) && <div className="out-of-stock-badge" style={{ top: '20px', right: '20px' }}>Sobre pedido</div>}
                  {(Array.isArray(selectedProductDetail.images) && selectedProductDetail.images.length > 0) ? (
                    <ProductCarousel 
                      images={selectedProductDetail.images.map((img: any) => ({
                      id: img.id,
                      image_url: resolveImageUrl(img.image_url, undefined)
                    }))}
                    alt={selectedProductDetail.name}
                    hideTryOn={String(selectedProductDetail.category || '').toLowerCase().includes('contacto')}
                  />
                  ) : (
                    <ImageWithSkeleton
                      src={resolveImageUrl(selectedProductDetail.image_url, selectedProductDetail.image, 800) || (String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? contactLensesImg : heroImg)}
                      alt={selectedProductDetail.name}
                      className="product-detail-img smooth-img"
                      onError={(e: any) => { 
                        const target = e.currentTarget;
                        const fallback = String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? contactLensesImg : heroImg;
                        if (!target.src.includes(fallback)) target.src = fallback; 
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Right: Info */}
              <div className="product-detail-info-col">
                <span className="product-detail-category">{selectedProductDetail.brand || selectedProductDetail.category || 'Lensique'}</span>
                <h2 className="product-detail-name">
                  {getInventedName(selectedProductDetail.name, selectedProductDetail.category)}
                </h2>
                <p className="product-detail-desc">
                  {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') 
                    ? `Lentes de Contacto${getContactLensUsage(selectedProductDetail.name) !== 'Todos' ? ` - ${getContactLensUsage(selectedProductDetail.name)}` : ''}` 
                    : (selectedProductDetail.category || 'Armazón Premium')}
                </p>

                <div className="product-detail-divider" />

                <p className="product-detail-note">¿Te interesa este modelo? Agenda una cita con nosotros y te asesoramos en persona.</p>

                <button 
                    className="btn btn-primary full-width product-detail-btn"
                    onClick={() => {
                      const category = String(selectedProductDetail.category || '').toLowerCase();
                      if (category.includes('sol')) {
                        const message = `Hola, me interesa comprar los lentes de sol ${selectedProductDetail.brand || ''} ${selectedProductDetail.model || selectedProductDetail.name}. ¿Me pueden dar más información?`;
                        window.open(`https://wa.me/${(settings.contact_whatsapp || '523316929111').replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
                      } else if (category.includes('contacto')) {
                        setContactConfiguratorProduct(selectedProductDetail);
                      } else {
                        setConfiguratorProduct(selectedProductDetail); 
                      }
                    }}
                  >
                    {String(selectedProductDetail.category || '').toLowerCase().includes('contacto') ? 'Comprar Lentes de Contacto' : (String(selectedProductDetail.category || '').toLowerCase().includes('sol') ? 'Comprar por WhatsApp' : 'Seleccionar micas y comprar')}
                  </button>

                <div className="product-detail-perks">
                  <span>✓ Asesoría personalizada</span>
                  <span>✓ Ajustes de por vida</span>
                  <span>✓ Examen de vista incluido</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Catalog View */}
      {isStyleQuizOpen && (
        <StyleQuiz 
          catalogData={safeJsonParse(settings.full_catalog_data)}
          onClose={() => setIsStyleQuizOpen(false)}
          onViewProduct={(prod) => {
            setIsStyleQuizOpen(false);
            setSelectedProductDetail(prod);
          }}
          onBookAppointment={handleOpenBooking}
        />
      )}

      <FullCatalog 
        isOpen={isCatalogOpen} 
        onClose={() => setIsCatalogOpen(false)} 
        catalogData={safeJsonParse(settings.full_catalog_data)}
        initialFilter={catalogInitialFilter}
        onViewProduct={(prod) => {
          setSelectedProductDetail(prod);
        }}
        onConfigureProduct={(prod) => {
          setConfiguratorProduct(prod);
        }}
        onTryOn={(prod) => {
          setTryOnProduct(prod);
          setIsTryOnOpen(true);
        }}
      />

      <VirtualTryOn 
        isOpen={isTryOnOpen}
        onClose={() => setIsTryOnOpen(false)}
        product={tryOnProduct}
      />

      {contactConfiguratorProduct && (
        <ContactLensConfiguratorModal
          product={contactConfiguratorProduct}
          onClose={() => setContactConfiguratorProduct(null)}
          onComplete={(config) => {
            setContactConfiguratorProduct(null);
            
            const brandText = contactConfiguratorProduct.brand ? ` ${contactConfiguratorProduct.brand}` : '';
            let configText = `¡Hola! Me interesa comprar lentes de contacto: ${contactConfiguratorProduct.name}${brandText}.\n\nEsta es mi receta:\n`;
            
            const formatEye = (eye: any) => {
              let text = `Esfera: ${eye.sph}`;
              if (eye.cyl && eye.axis) text += ` | Cilindro: ${eye.cyl} | Eje: ${eye.axis}`;
              if (eye.add) text += ` | ADD: ${eye.add}`;
              return text;
            };

            const clConfig = config.contactLensConfig;
            if (clConfig.samePrescription) {
              configText += `- Ambos ojos (OD y OS):\n  ${formatEye(clConfig.prescriptionOD)}\n`;
            } else {
              if (clConfig.quantityOD > 0) {
                configText += `- Ojo Derecho (OD):\n  ${formatEye(clConfig.prescriptionOD)}\n`;
              }
              if (clConfig.quantityOS > 0) {
                configText += `- Ojo Izquierdo (OS):\n  ${formatEye(clConfig.prescriptionOS)}\n`;
              }
            }
            configText += `- Curva Base (BC): 8.6\n`;
            configText += `- Diámetro (DIA): 14.5\n`;
            configText += `- Cantidad: ${clConfig.quantityOD} OD / ${clConfig.quantityOS} OS\n`;
            
            if (clConfig.hasPhoto) {
              configText += `\n*Nota: Adjunté foto de mi receta en el sistema.*\n`;
            }
            
            const totalQty = clConfig.quantityOD + clConfig.quantityOS;
            const totalPrice = (contactConfiguratorProduct.price_incl_tax || 0) * (totalQty > 0 ? totalQty : 1);
            configText += `\n*Precio Estimado Total:* $${Math.round(totalPrice).toLocaleString('es-MX')}\n\n¿Me pueden confirmar el pedido y los métodos de pago?`;
            
            const phone = settings.contact_whatsapp || '523316929111';
            const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(configText)}`;
            window.open(url, '_blank');
          }}
        />
      )}

      {configuratorProduct && (
        <LensConfiguratorModal
          product={configuratorProduct}
          onClose={() => setConfiguratorProduct(null)}
          onComplete={(config) => {
            setConfiguratorProduct(null);
            
            const product = config.originalProduct || configuratorProduct;
            let configText = `¡Hola! Me interesa comprar el armazón ${product.name} ${product.brand}.\n\nEsta es mi configuración de micas ZEISS:\n`;
            
            if (config.etiqueta) {
              configText += `• ${config.etiqueta} · índice ${config.indice}\n`;
            }
            
            const pvp = config.pvp || 0;
            const productPrice = product.price_incl_tax || 0;
            const total = pvp + productPrice;

            configText += `• Precio micas (el par): $${Math.round(pvp).toLocaleString('es-MX')}\n`;
            configText += `• Precio armazón: $${Math.round(productPrice).toLocaleString('es-MX')}\n`;

            const formatRx = (eye: any) => {
              if (!eye) return '';
              let txt = `Esf ${eye.esf >= 0 ? '+' : ''}${(eye.esf || 0).toFixed(2)}`;
              if (eye.cil) txt += ` Cil ${(eye.cil).toFixed(2)}`;
              if (eye.eje) txt += ` Eje ${eye.eje}°`;
              if (eye.add) txt += ` Add +${Number(eye.add).toFixed(2)}`;
              return txt;
            };

            if (config.od || config.oi) {
              const odStr = formatRx(config.od);
              const oiStr = formatRx(config.oi);
              if (odStr !== 'Esf +0.00' || oiStr !== 'Esf +0.00' || config.od?.cil || config.oi?.cil) {
                 configText += `\nMi graduación:\n  OD: ${odStr}\n  OI: ${oiStr}\n`;
              }
            }
            
            if (config.pd) {
               if (typeof config.pd === 'object') {
                  configText += `  DI/PD: OD ${config.pd.od || '?'} mm / OI ${config.pd.oi || '?'} mm\n`;
               } else {
                  configText += `  DI/PD: ${config.pd} mm\n`;
               }
            }

            configText += `\n*Precio Estimado Total:* $${Math.round(total).toLocaleString('es-MX')}\n\n¿Me pueden confirmar el pedido y los métodos de pago?`;
            
            const phone = settings.contact_whatsapp || '523316929111';
            const cleanPhone = phone.replace(/\D/g, '');
            const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(configText)}`;
            window.open(url, '_blank');
          }}
        />
      )}


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
                    {timeSlots.map(time => {
                      let isPastTime = false;
                      if (selectedDate && selectedDate.toDateString() === new Date().toDateString()) {
                        const now = new Date();
                        const [timeStr, modifier] = time.split(' ');
                        let [hours, minutes] = timeStr.split(':').map(Number);
                        if (hours === 12) {
                          hours = modifier === 'AM' ? 0 : 12;
                        } else if (modifier === 'PM') {
                          hours += 12;
                        }
                        const slotTime = new Date(selectedDate);
                        slotTime.setHours(hours, minutes, 0, 0);
                        isPastTime = slotTime < now;
                      }
                      return (
                        <button 
                          key={`time-${time}`}
                          className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(time)}
                          disabled={isPastTime}
                          style={{ opacity: isPastTime ? 0.4 : 1, cursor: isPastTime ? 'not-allowed' : 'pointer' }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {selectedDate && selectedTime && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="time-selection"
                  style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}
                >
                  <div className="time-header" style={{ marginBottom: '0.5rem' }}>
                    <User size={16} />
                    <span>Tus datos</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Tu nombre completo" 
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', outline: 'none' }}
                  />
                </motion.div>
              )}

              <div className="modal-footer" style={{ marginTop: '1.5rem' }}>
                <button 
                  className={`btn btn-primary full-width ${(!selectedDate || !selectedTime || !bookingName.trim()) ? 'disabled' : ''}`}
                  disabled={!selectedDate || !selectedTime || !bookingName.trim()}
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
        <div className="nav-top-banner">
          <p>Agenda tu examen de vista hoy. <span style={{ fontWeight: 600 }}>Atención personalizada en Zapopan.</span></p>
        </div>
        <div className="nav-content">
          <div className="nav-left">
            <div className="logo">
              <img src={logo} alt="Lensique" className="logo-img" />
            </div>

            <div className="nav-links d-none-mobile">
              {safeJsonParse(settings.nav_links).map((link: any, i: number) => (
                <a 
                  key={`nav-${i}-${link.name}`} 
                  href={link.href} 
                  className="nav-link"
                  onClick={(e) => {
                    if (link.name === 'Catálogo') {
                      e.preventDefault();
                      setIsCatalogOpen(true);
                    } else if (link.name === 'Examen') {
                      e.preventDefault();
                      handleOpenBooking('Examen de la Vista');
                    }
                  }}
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          <div className="nav-right">


            <button className="nav-icon-btn mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
            {safeJsonParse(settings.nav_links).map((link: any, i: number) => (
              <a 
                key={`mob-${i}-${link.name}`} 
                href={link.href} 
                className="mobile-link" 
                onClick={(e) => {
                  if (link.name === 'Catálogo') {
                    e.preventDefault();
                    setIsCatalogOpen(true);
                  } else if (link.name === 'Examen') {
                    e.preventDefault();
                    handleOpenBooking('Examen de la Vista');
                  }
                  setIsMobileMenuOpen(false);
                }}
              >
                {link.name}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <section className="hero">
          <img 
            src={resolveImageUrl(settings.hero_image_url, heroImg, 1200)} 
            alt="Lensique Eyewear" 
            className="hero-background-img"
            fetchpriority="high"
            onError={(e: any) => {
              e.target.onerror = null;
              e.target.src = heroImg;
            }}
          />
          <div className="hero-content">
            <span className="hero-eyebrow">{settings.hero_eyebrow}</span>
            <h1 className="hero-title">{settings.hero_title}</h1>
            <p className="hero-subheading">{settings.hero_subtitle}</p>
            <div className="hero-actions-left">
              <button 
                className="btn btn-wp-primary" 
                onClick={() => setIsStyleQuizOpen(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={18} /> Encuentra tu estilo ideal
              </button>
              <button className="btn btn-wp-secondary" onClick={() => setIsCatalogOpen(true)}>
                Ver Catálogo
              </button>
            </div>
            <div className="hero-link">
              <a href="#populares" onClick={(e) => { e.preventDefault(); document.getElementById('populares')?.scrollIntoView({behavior: 'smooth'})}}>
                Descubre nuestra colección &gt;
              </a>
            </div>
          </div>
        </section>

        <section className="perks-bar">
          <div className="perk-item">Examen de vista<br/>gratis y profesional</div>
          <div className="perk-separator"></div>
          <div className="perk-item">Servicios de ajuste<br/>y mantenimiento</div>
          <div className="perk-separator"></div>
          <div className="perk-item">Asesoría de imagen<br/>personalizada</div>
          <div className="perk-separator"></div>
          <div className="perk-item">Garantía en adaptación<br/>y defectos</div>
        </section>

        <section id="populares" className="wp-carousel-section">
          <div className="wp-section-header">
            <h2 className="wp-section-title">Nuestros más populares.</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="slider-arrow-btn" aria-label="Desplazar Izquierda" onClick={() => scrollPopulares('left')}><ChevronLeft size={24} /></button>
              <button className="slider-arrow-btn" aria-label="Desplazar Derecha" onClick={() => scrollPopulares('right')}><ChevronRight size={24} /></button>
              <button className="btn-wp-outline" onClick={() => setIsCatalogOpen(true)}>Ver catálogo completo</button>
            </div>
          </div>
          
          <div className="wp-slider" ref={sliderRef}>
            {safeJsonParse(settings.featured_products).slice(0, 8).map((product: any) => (
              <ProductCard 
                key={product.id}
                product={product}
                fallbackImage={heroImg}
                onClick={() => setSelectedProductDetail(product)}
              />
            ))}
          </div>
        </section>

        {/* Editorial Cards Section - Warby Parker Style */}
        <section className="editorial-cards-section">
          <div className="editorial-cards-grid">
            {/* Card izquierda - Calvin Klein */}
            <motion.div
              className="editorial-card editorial-card--tall"
              style={{ backgroundImage: `url(${editorialCk})` }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0 }}
              viewport={{ once: true }}
              onClick={() => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); }}
            >
              <div className="editorial-card-overlay" />
              <div className="editorial-card-content">
                <p className="editorial-card-headline">Encuentra el armazón perfecto para ti.</p>
                <button className="editorial-card-btn">Ver armazones</button>
              </div>
            </motion.div>

            {/* Card central - Carrera, offset hacia abajo */}
            <motion.div
              className="editorial-card editorial-card--offset"
              style={{ backgroundImage: `url(${editorialCarrera})` }}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              viewport={{ once: true }}
              onClick={() => handleOpenBooking()}
            >
              <div className="editorial-card-overlay" />
              <div className="editorial-card-content">
                <p className="editorial-card-headline">Estilo que define tu personalidad.</p>
                <button className="editorial-card-btn" onClick={(e) => { e.stopPropagation(); handleOpenBooking(); }}>Agendar cita</button>
              </div>
            </motion.div>

            {/* Card derecha - Calvin Klein premium */}
            <motion.div
              className="editorial-card editorial-card--tall"
              style={{ backgroundImage: `url(${editorialArmazon})` }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              viewport={{ once: true }}
              onClick={() => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); }}
            >
              <div className="editorial-card-overlay" />
              <div className="editorial-card-content">
                <p className="editorial-card-headline">Armazón con elegancia arquitectónica.</p>
                <button className="editorial-card-btn">Explorar armazón vista</button>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="servicios" className="wp-services-section">
          <div className="wp-section-header">
            <h2 className="wp-section-title">Nuestros servicios visuales.</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="slider-arrow-btn" aria-label="Desplazar Izquierda" onClick={() => scrollServicios('left')}><ChevronLeft size={24} /></button>
              <button className="slider-arrow-btn" aria-label="Desplazar Derecha" onClick={() => scrollServicios('right')}><ChevronRight size={24} /></button>
            </div>
          </div>
          <div className="wp-services-grid" ref={servicesSliderRef}>
            {[
              { 
                id: 's1', 
                title: 'Examen de la vista', 
                img: cv7600Img, 
                action: () => setSelectedServiceInfo({
                  id: 's1',
                  title: 'Examen de la vista',
                  subtitle: 'Diagnóstico visual de alta precisión',
                  description: '<p>Contamos con equipo automatizado de última generación para evaluar tu capacidad visual con exactitud. Nuestras instalaciones están diseñadas para ofrecerte la mayor comodidad durante tu evaluación.</p><ul><li>Revisión refractiva completa</li><li>Toma de agudeza visual</li><li>Diagnóstico personalizado</li></ul>',
                  image: cv7600Img,
                  gallery: [eyeExamImg1, eyeExamImg2],
                  actionText: 'Agendar cita ahora',
                  onAction: () => { setSelectedServiceInfo(null); handleOpenBooking('Examen de la Vista'); }
                }) 
              },
              { 
                id: 's2', 
                title: 'Consulta Médica', 
                img: clinicRoomImg, 
                action: () => setSelectedServiceInfo({
                  id: 's2',
                  title: 'Consulta Médica',
                  subtitle: 'Atención Oftalmológica Especializada',
                  description: '<p>Trabajamos de la mano con la clínica <strong>CIOVA</strong> para ofrecerte consultas oftalmológicas de la más alta calidad.</p><p>Nuestro equipo aliado se encargará de realizar un diagnóstico médico profundo de tu salud visual y ocular.</p>',
                  image: clinicRoomImg,
                  actionText: 'Visitar sitio de CIOVA',
                  onAction: () => window.open('https://ciova.mx/', '_blank')
                }) 
              },
              { 
                id: 's3', 
                title: 'Actualización de micas', 
                img: micasImg, 
                action: () => setSelectedServiceInfo({
                  id: 's3',
                  title: 'Actualización de micas',
                  subtitle: 'Renueva tus lentes conservando tu armazón',
                  description: '<p>Si ya tienes un armazón que te encanta, nosotros nos encargamos de cambiarle las micas con tu nueva graduación o el tratamiento que necesites.</p><p>Es un proceso rápido y seguro para darle una nueva vida a tus lentes favoritos.</p>',
                  image: micasImg,
                  actionText: 'Ver opciones de micas',
                  onAction: () => { setSelectedServiceInfo(null); window.location.hash = 'micas'; }
                }) 
              },
              { id: 's4', title: 'Lentes de contacto', img: contactLensesImg, action: () => { setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); } },
              { id: 's5', title: 'Armazones', img: armazonesServiceImg, action: () => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); } }
            ].map((service) => (
              <motion.div 
                key={service.id}
                className="wp-service-card"
                style={{ backgroundImage: `url(${service.img})` }}
                onClick={service.action}
                whileHover={{ y: -5 }}
              >
                <div className="wp-service-card-overlay"></div>
                <button className="wp-service-pill">
                  {service.title}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Typographic Statement + Lifestyle Banner */}
        <section className="statement-banner-section">
          {/* Part 1: Typographic Statement */}
          <div className="statement-block">
            <span className="statement-eyebrow">Todo lo que tus ojos necesitan</span>
            <p className="statement-headline">
              Agenda un{' '}
              <button className="statement-link" onClick={() => handleOpenBooking('Examen de la Vista')}>
                examen de vista
              </button>
              , pruébate{' '}
              <button className="statement-link" onClick={() => { setCatalogInitialFilter('Todas'); setIsCatalogOpen(true); }}>
                armazones
              </button>
              {' '}y compra{' '}
              <button className="statement-link" onClick={() => { setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); }}>
                lentes de contacto
              </button>
              {'\u2014'}todo en tu óptica de confianza.
            </p>
          </div>

          {/* Part 2: Lifestyle Banner */}
          <motion.div
            className="lifestyle-banner"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="lifestyle-banner-text">
              <h2 className="lifestyle-banner-title">Compra junto a quien más quieres.</h2>
              <p className="lifestyle-banner-desc">
                Encuentra el armazón perfecto para toda la familia. Asesoría personalizada y la mejor selección en Zapopan.
              </p>
              <div className="lifestyle-banner-btns">
                <button className="lifestyle-btn lifestyle-btn--primary" onClick={() => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); }}>
                  Ver armazones
                </button>
                <button className="lifestyle-btn lifestyle-btn--secondary" onClick={() => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); }}>
                  Ver lentes de sol
                </button>
              </div>
              <button className="lifestyle-banner-link" onClick={() => handleOpenBooking()}>
                Agenda tu cita &rsaquo;
              </button>
            </div>
            <div className="lifestyle-banner-img-col">
              <img
                src={storeInteriorImg}
                alt="Óptica Lensique - Atención personalizada"
                className="lifestyle-banner-img"
                loading="lazy"
                decoding="async"
              />
            </div>
          </motion.div>
        </section>

        <section id="micas" className="wp-micas-lifestyle-section">
          <div className="wp-section-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto 40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <h2 className="wp-section-title" style={{ margin: 0 }}>Tecnologías de visión.</h2>
              <a 
                href="/cotizador/" 
                style={{ 
                  backgroundColor: '#1F3864', 
                  color: '#ffffff', 
                  padding: '10px 20px', 
                  borderRadius: '12px', 
                  textDecoration: 'none', 
                  fontWeight: 600,
                  fontSize: '15px',
                  boxShadow: '0 4px 14px rgba(31, 56, 100, 0.2)'
                }}
              >
                Cotiza tus micas en línea
              </a>
            </div>
            <div className="wp-slider-nav" style={{ display: 'flex', gap: '10px' }}>
              <button className="slider-arrow-btn" aria-label="Desplazar Izquierda" onClick={() => scrollMicas('left')}><ChevronLeft size={24} /></button>
              <button className="slider-arrow-btn" aria-label="Desplazar Derecha" onClick={() => scrollMicas('right')}><ChevronRight size={24} /></button>
            </div>
          </div>
          
          <div className="wp-micas-lifestyle-grid" ref={micasSliderRef}>
            {safeJsonParse(settings.category_bricks).map((brick: any, idx: number) => (
              <motion.div 
                key={`mica-ls-${idx}-${brick.id}`}
                className="wp-mica-lifestyle-card"
                style={{ backgroundImage: `url(${resolveImageUrl(brick.image_url, brick.image)})` }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedTech(brick)}
              >
                <div className="wp-mica-ls-overlay"></div>
                <button className="wp-service-pill" onClick={(e) => { e.stopPropagation(); setSelectedTech(brick); }}>
                  {brick.title}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="armazones" className="comparison-section" style={{ backgroundColor: '#fff', padding: '100px 0' }}>
          <div className="section-header" style={{ padding: '0 40px' }}>
            <span className="hero-eyebrow">Diseños que inspiran</span>
            <h2 className="section-title">Encuentra tu estilo ideal.</h2>
            <p className="section-subtitle">Exclusividad y precisión en cada detalle.</p>
          </div>

          <div className="face-guide-grid">
            {faceShapeGuide.map((guide, idx) => (
              <motion.div 
                key={`face-guide-${idx}-${guide.id}`}
                className="face-guide-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="face-guide-img-box">
                  <img src={guide.image} alt={guide.glassesShape} className="face-guide-img" loading="lazy" decoding="async" />
                </div>
                <div className="face-guide-content">
                  <span className="face-guide-tag">Ideal para: {guide.faceShape}</span>
                  <h3 className="face-guide-title">{guide.glassesShape}</h3>
                  <p className="face-guide-desc">{guide.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button 
              className="btn btn-wp-primary" 
              onClick={() => setIsStyleQuizOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 32px', fontSize: '16px' }}
            >
              <Sparkles size={20} /> Hacer el Quiz de Estilo
            </button>
          </div>
        </section>

        <section id="nosotros" className="about-section">
          <div className="about-content">
            <span className="hero-eyebrow">Nosotros</span>
            <h2 className="section-title">{settings.about_title}</h2>
            <p className="about-text">{settings.about_text}</p>
          </div>
        </section>

        {safeJsonParse(settings.featured_contact_lenses).length > 0 && (
          <section id="lentes-contacto" className="wp-carousel-section">
            <div className="wp-section-header">
              <h2 className="wp-section-title">Claridad sin límites.</h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button className="slider-arrow-btn" aria-label="Desplazar Izquierda" onClick={() => scrollContact('left')}><ChevronLeft size={24} /></button>
                <button className="slider-arrow-btn" aria-label="Desplazar Derecha" onClick={() => scrollContact('right')}><ChevronRight size={24} /></button>
                <button className="btn-wp-outline" onClick={() => { setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); }}>
                  Ver todos
                </button>
              </div>
            </div>
            
            <div className="wp-slider" ref={contactSliderRef}>
              {safeJsonParse(settings.full_catalog_data)
                .filter((p: any) => String(p.category || '').toLowerCase().includes('contacto'))
                .slice(0, 6)
                .map((product: any) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    fallbackImage={contactLensesImg}
                    onClick={() => { setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); }}
                  />
              ))}
            </div>
          </section>
        )}

        <section className="reviews-section" style={{ padding: '80px 24px', backgroundColor: '#f8fafc', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <span className="hero-eyebrow">Lo que dicen nuestros clientes</span>
            <h2 className="section-title" style={{ marginBottom: '40px' }}>Tu visión es nuestra prioridad.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {[
                { name: 'María Fernanda G.', review: 'Excelente servicio y atención. El quiz me ayudó a encontrar el armazón perfecto para mi rostro. ¡Mis lentes llegaron impecables!' },
                { name: 'Carlos R.', review: 'Agenda mi cita por WhatsApp y el proceso fue súper rápido. La calidad de las micas es increíble. 100% recomendados.' },
                { name: 'Sofía L.', review: 'Me encantó la variedad de estilos tipo Warby Parker. El equipo de Lensique fue muy profesional durante mi valoración.' }
              ].map((r, i) => (
                <div key={i} style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'left' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#fbbf24' }}>
                    {[...Array(5)].map((_, j) => <svg key={j} width="20" height="20" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>)}
                  </div>
                  <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6', marginBottom: '16px', fontStyle: 'italic' }}>"{r.review}"</p>
                  <p style={{ fontWeight: '600', color: '#1e293b' }}>{r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
                  <p>{formatWhatsappNumber(settings.contact_whatsapp)}</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg></div>
                <div>
                  <h4>Horarios</h4>
                  <p>Lunes a Viernes: 10:00 AM - 7:00 PM<br/>Sábados: 10:00 AM - 2:00 PM</p>
                </div>
              </div>
              <button 
                className="btn btn-primary" 
                onClick={() => handleOpenBooking()}
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

          <ServiceDetailsPage
            isOpen={!!selectedServiceInfo}
            onClose={() => setSelectedServiceInfo(null)}
            service={selectedServiceInfo}
          />

          <InfoPage
            isOpen={!!selectedInfoPage}
            onClose={() => setSelectedInfoPage(null)}
            data={selectedInfoPage}
          />

      </main>

      <a 
        href={`https://wa.me/${(settings.contact_whatsapp || '523316929111').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me interesa agendar una cita.')}`} 
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
          <div className="footer-main-grid">
            <div className="footer-links-wrapper">
              <div className="footer-col">
                <h4>Productos</h4>
                <a href="#armazones" onClick={(e) => { e.preventDefault(); document.getElementById('armazones')?.scrollIntoView({ behavior: 'smooth' }); }}>Lentes oftálmicos</a>
                <a href="#micas" onClick={(e) => { e.preventDefault(); document.getElementById('micas')?.scrollIntoView({ behavior: 'smooth' }); }}>Micas monofocales</a>
                <a href="#micas" onClick={(e) => { e.preventDefault(); document.getElementById('micas')?.scrollIntoView({ behavior: 'smooth' }); }}>Micas progresivas</a>
                <a href="#lentes-contacto" onClick={(e) => { e.preventDefault(); setCatalogInitialFilter('Lentes de Contacto'); setIsCatalogOpen(true); }}>Lentes de contacto</a>
              </div>
              
              <div className="footer-col">
                <h4>Servicios</h4>
                <a href="#examen" onClick={(e) => { e.preventDefault(); handleOpenBooking('Examen de la Vista'); }}>Examen de la vista</a>
                <a href="#consulta" onClick={(e) => { e.preventDefault(); handleOpenBooking('Consulta Oftalmológica'); }}>Consulta Médica</a>
                <a href="#micas" onClick={(e) => { e.preventDefault(); document.getElementById('micas')?.scrollIntoView({ behavior: 'smooth' }); }}>Actualización de micas</a>
                
                <h4 className="mt-8">Tiendas</h4>
                <a href="https://share.google/oJONuX5T6QTj6xwPI" target="_blank" rel="noopener noreferrer">Encuentra una sucursal</a>
              </div>

              <div className="footer-col">
                <h4>Nosotros</h4>
                <a href="#nosotros" onClick={(e) => { e.preventDefault(); document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' }); }}>Nuestra historia</a>
                <a href="https://share.google/oJONuX5T6QTj6xwPI" target="_blank" rel="noopener noreferrer">Reseñas de clientes</a>
                <h4 className="mt-8">Legal</h4>
                <a href="#privacidad" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(privacyData); }}>Aviso de Privacidad</a>
                <a href="#terminos" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(termsData); }}>Términos y Condiciones</a>
                <a href="#cookies" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(cookiesData); }}>Política de Cookies</a>
              </div>

              <div className="footer-col">
                <h4>Soporte</h4>
                <a href="#garantia" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(warrantyData); }}>Garantías</a>
                <a href="#faq" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(faqData); }}>Preguntas Frecuentes</a>
                <a href="#facturacion" onClick={(e) => { e.preventDefault(); alert('Para solicitar tu factura, envíanos tu Constancia de Situación Fiscal (CSF) por WhatsApp.'); window.open(`https://wa.me/${(settings.contact_whatsapp || '523316929111').replace(/\D/g, '')}?text=Hola,%20me%20gustar%C3%ADa%20solicitar%20mi%20factura.%20Aqu%C3%AD%20env%C3%ADo%20mi%20Constancia%20de%20Situaci%C3%B3n%20Fiscal.`, '_blank'); }}>Facturación</a>
              </div>
            </div>

            <div className="footer-support-block">
              <h4 className="support-title">¿Necesitas ayuda?</h4>
              <p className="support-text">
                Estamos aquí para ayudarte. Revisa nuestras preguntas frecuentes o contáctanos directamente.
              </p>
              <div className="support-actions">
                <a href="#faq" className="support-action-item">
                  <div className="support-icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <span>FAQ</span>
                </a>
                <a href={`https://wa.me/${(settings.contact_whatsapp || '523316929111').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="support-action-item">
                  <div className="support-icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  </div>
                  <span>Chat</span>
                </a>
              </div>
              
              <div className="social-icons">
                <a href="https://www.instagram.com/thelensique/" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a href="https://www.facebook.com/profile.php?id=61579352515332" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <span className="footer-region">🇲🇽 México</span>
              <span>&copy; {new Date().getFullYear()} Óptica Lensique.</span>
            </div>
            <div className="footer-bottom-links">
              <a href="#privacidad" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(privacyData); }}>Aviso de Privacidad</a>
              <a href="#terminos" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(termsData); }}>Términos y Condiciones</a>
              <a href="#cookies" onClick={(e) => { e.preventDefault(); setSelectedInfoPage(cookiesData); }}>Política de Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AppWrapper;
