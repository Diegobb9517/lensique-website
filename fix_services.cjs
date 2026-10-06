const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="wp-micas-lifestyle-grid" ref=\{servicesSliderRef\}>\s*\{\[\s*\{\s*id: 's1',[\s\S]*?\]\.map\(\(service, idx\) => \(/;

const newBlock = `<div className="wp-micas-lifestyle-grid" ref={servicesSliderRef}>
            {[
              { 
                id: 's1', 
                title: 'Examen de la vista', 
                img: cv7600Img, 
                action: () => setSelectedServiceInfo({
                  id: 's1',
                  title: 'Examen de la vista',
                  subtitle: 'Diagnóstico visual de alta precisión',
                  description: '<p>Tu salud visual en manos de expertos. Nuestro <strong>examen de vista profesional</strong> es realizado directamente por un <strong>oftalmólogo certificado</strong>, garantizando un diagnóstico clínico sumamente preciso y confiable.</p><p>Utilizamos <strong>equipos automatizados de alta gama y última generación</strong> que nos permiten medir tu agudeza visual con exactitud milimétrica. Todo esto en instalaciones modernas diseñadas para ofrecerte la mayor comodidad.</p><ul><li>Evaluación por oftalmólogo certificado</li><li>Tecnología automatizada de precisión</li><li>Diagnóstico clínico y refractivo 100% personalizado</li></ul><p><strong>Actualización de micas:</strong> Si ya tienes un armazón que te encanta, nosotros nos encargamos de cambiarle las micas con tu nueva graduación o el tratamiento que necesites. Es un proceso rápido y seguro para darle una nueva vida a tus lentes favoritos.</p>',
                  image: cv7600Img,
                  actionText: 'Agendar examen',
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
                  actionText: 'Agendar consulta',
                  onAction: () => window.open('https://ciova.mx/', '_blank')
                }) 
              },
              { 
                id: 's4', 
                title: 'Lentes de contacto', 
                img: contactLensesImg, 
                action: () => setSelectedServiceInfo({
                  id: 's4',
                  title: 'Lentes de contacto',
                  subtitle: 'Visión libre y cómoda',
                  description: '<p>Descubre una forma cómoda e invisible de corregir tu visión. Ofrecemos adaptaciones personalizadas para asegurar la mejor opción para tus ojos, ya sea para uso diario, mensual o casos especiales.</p>',
                  image: contactLensesImg,
                  actionText: 'Ver lentes de contacto',
                  onAction: () => { setSelectedServiceInfo(null); setIsContactQuizOpen(true); }
                })
              },
              { 
                id: 's5', 
                title: 'Ajuste y mantenimiento', 
                img: armazonesServiceImg, 
                action: () => setSelectedServiceInfo({
                  id: 's5',
                  title: 'Ajuste y mantenimiento',
                  subtitle: 'Tus lentes siempre como nuevos',
                  description: '<p>Tráenos tus lentes. Nos encargamos de enderezarlos, ajustarlos a tu rostro y darles mantenimiento general para alargar su vida útil y mantener tu comodidad.</p>',
                  image: armazonesServiceImg,
                  actionText: 'Escríbenos por WhatsApp',
                  onAction: () => window.open('https://wa.me/5213329244036', '_blank')
                })
              }
            ].map((service, idx) => (`;

appTsx = appTsx.replace(regex, newBlock);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('App.tsx updated for services');
