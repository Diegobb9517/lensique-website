const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// We replace the entire wp-mica-lifestyle-card section with the new grid and card styles.
const regex = /\.wp-mica-lifestyle-card \{[\s\S]*?(?=\.slider-arrow-btn \{)/;

const newCss = `.wp-micas-lifestyle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}
@media (max-width: 1023px) {
  .wp-micas-lifestyle-grid {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    gap: 16px;
    padding-bottom: 16px;
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .wp-micas-lifestyle-grid::-webkit-scrollbar {
    display: none;
  }
}

.wp-mica-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}
@media (max-width: 1023px) {
  .wp-mica-wrapper {
    min-width: 260px;
    flex-shrink: 0;
    scroll-snap-align: start;
  }
}

.wp-mica-lifestyle-card {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  background: #f8fafc;
  display: block;
}

.wp-mica-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.wp-mica-lifestyle-card:hover .wp-mica-bg {
  transform: scale(1.05);
}

.wp-mica-action-pill {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #ffffff;
  color: #1d1d1f;
  padding: 12px 24px;
  border-radius: 999px;
  font-weight: 500;
  font-family: 'Playfair Display', serif;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
  white-space: nowrap;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 2;
}

.wp-mica-lifestyle-card:hover .wp-mica-action-pill {
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.wp-mica-desc-outside {
  font-size: 14px;
  color: #64748b;
  text-align: center;
  margin: 0;
  line-height: 1.4;
  padding: 0 8px;
}

`;

css = css.replace(regex, newCss);

// Also remove .wp-mica-overlay, .wp-mica-text-content, .wp-mica-title, .wp-mica-desc, .wp-mica-action from old css
const overlayRegex = /\.wp-mica-overlay \{[\s\S]*?\}\s*/;
css = css.replace(overlayRegex, '');

fs.writeFileSync('src/App.css', css);
console.log('done CSS');
