const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<section id="servicios" className="wp-services-section">[\s\S]*?<\/section>/;

const newHTML = `<section id="servicios" className="wp-services-section" style={{ padding: '80px 40px', backgroundColor: '#fff' }}>
          <div className="wp-section-header" style={{ marginBottom: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: 'var(--max-width)', margin: '0 auto 48px' }}>
            <h2 className="wp-section-title" style={{ margin: 0, textAlign: 'center', fontFamily: '"Playfair Display", serif' }}>Nuestros servicios visuales</h2>
          </div>
          <div className="wp-micas-lifestyle-grid" ref={servicesSliderRef}>
            {[
              { 
                id: 's1', 
                title: 'Examen de la vista', 
                img: cv7600Img, 
                action: () => setSelectedServiceInfo({
                  id: 's1',
                  title: 'Examen de la vista',
                  subtitle: 'Diagnóstico visual de alta precisión',
                  description: '<p>Tu salud visual en manos de expertos. Nuestro <strong>examen de vista profesional</strong> es realizado directamente por un <strong>oftalmólogo certificado</strong>, garantizando un diagnóstico clínico sumamente preciso y confiable.</p><p>Utilizamos <strong>equipos automatizados de alta gama y última generación</strong> que nos permiten medir tu agudeza visual con exactitud milimétrica. Todo esto en instalaciones modernas diseñadas para ofrecerte la mayor comodidad.</p><ul><li>Evaluación por oftalmólogo certificado</li><li>Tecnología automatizada de precisión</li><li>Diagnóstico clínico y refractivo 100% personalizado</li></ul>',
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
                  onAction: () => { setSelectedServiceInfo(null); window.location.href = '/micas'; }
                }) 
              },
              { id: 's4', title: 'Lentes de contacto', img: contactLensesImg, action: () => setIsContactQuizOpen(true) },
              { id: 's5', title: 'Armazones', img: armazonesServiceImg, action: () => { setCatalogInitialFilter('Armazones'); setIsCatalogOpen(true); } }
            ].map((service, idx) => (
              <div key={service.id} className="wp-mica-wrapper">
                <motion.div 
                  className="wp-mica-lifestyle-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={service.action}
                >
                  <div 
                    className="wp-mica-bg" 
                    style={{ backgroundImage: \`url(\${service.img})\` }}
                  />
                  <div className="wp-mica-action-pill">{service.title}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>`;

appTsx = appTsx.replace(regex, newHTML);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('done Services');
