const fs = require('fs');
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  '              </a>\r\n              ))}\r\n            </div>',
  '              </a>\r\n              ))}\r\n            <a href="/blog" className="nav-link">Blog</a>\r\n            </div>'
);
app = app.replace(
  '              </a>\n              ))}\n            </div>',
  '              </a>\n              ))}\n            <a href="/blog" className="nav-link">Blog</a>\n            </div>'
);

app = app.replace(
  '              </a>\r\n              ))}\r\n            </motion.div>',
  '              </a>\r\n              ))}\r\n            <a href="/blog" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>\r\n            </motion.div>'
);
app = app.replace(
  '              </a>\n              ))}\n            </motion.div>',
  '              </a>\n              ))}\n            <a href="/blog" className="mobile-link" onClick={() => setIsMobileMenuOpen(false)}>Blog</a>\n            </motion.div>'
);

// also let's check footer
app = app.replace(
  '<a href="#lentes-contacto"',
  '<a href="/blog">Blog y Consejos</a>\n                  <a href="#lentes-contacto"'
);

fs.writeFileSync('src/App.tsx', app, 'utf8');
