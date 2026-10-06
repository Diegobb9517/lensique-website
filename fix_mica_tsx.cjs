const fs = require('fs');

let appTsx = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<div className="wp-micas-lifestyle-grid" ref=\{micasSliderRef\}>[\s\S]*?<\/div>\s*<\/section>/;

const newHTML = `<div className="wp-micas-lifestyle-grid" ref={micasSliderRef}>
            {safeJsonParse(settings.category_bricks).map((brick: any, idx: number) => (
              <div key={\`mica-ls-\${idx}-\${brick.id}\`} className="wp-mica-wrapper">
                <motion.div 
                  className="wp-mica-lifestyle-card"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  onClick={() => setSelectedTech(brick)}
                >
                  <div 
                    className="wp-mica-bg" 
                    style={{ backgroundImage: \`url(\${resolveImageUrl(brick.image_url, brick.image)})\` }}
                  />
                  <div className="wp-mica-action-pill">{brick.title}</div>
                </motion.div>
                <p className="wp-mica-desc-outside">{brick.description}</p>
              </div>
            ))}
          </div>
        </section>`;

appTsx = appTsx.replace(regex, newHTML);

fs.writeFileSync('src/App.tsx', appTsx);
console.log('done TSX');
