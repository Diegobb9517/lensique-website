const fs = require('fs');

let css = fs.readFileSync('src/App.css', 'utf8');

// We replace the entire wp-micas-lifestyle-grid block and add wp-treatments-grid
const regex = /\.wp-micas-lifestyle-grid\s*\{[\s\S]*?\}\s*@media\s*\(\s*max-width:\s*1023px\s*\)\s*\{\s*\.wp-mica-wrapper\s*\{[\s\S]*?\}\s*\}/;

// Wait, the previous block I wrote was:
/*
.wp-micas-lifestyle-grid {
  display: grid; ...
}
@media (max-width: 1023px) {
  .wp-micas-lifestyle-grid { ... }
}
.wp-mica-wrapper { ... }
@media (max-width: 1023px) {
  .wp-mica-wrapper { ... }
}
*/
// It's better to replace from .wp-micas-lifestyle-grid to just before .wp-mica-lifestyle-card

const regex2 = /\.wp-micas-lifestyle-grid\b[\s\S]*?(?=\.wp-mica-lifestyle-card\s*\{)/;

const newCSS = `.wp-micas-lifestyle-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}
.wp-treatments-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  width: 100%;
}
.wp-treatments-grid .wp-mica-lifestyle-card {
  aspect-ratio: 4 / 3;
}

@media (max-width: 1023px) {
  .wp-micas-lifestyle-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .wp-micas-lifestyle-grid,
  .wp-treatments-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

.wp-mica-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}
`;

css = css.replace(regex2, newCSS);

// Remove the old leftover .wp-micas-lifestyle-grid { display: flex ... } block
// that is further up in App.css around line 3081.
const oldGridRegex = /\.wp-micas-lifestyle-grid\s*\{\s*display:\s*flex;[\s\S]*?\.wp-micas-lifestyle-grid::-webkit-scrollbar\s*\{\s*display:\s*none;\s*\}/;
css = css.replace(oldGridRegex, '');

fs.writeFileSync('src/App.css', css);
console.log('done CSS update');
