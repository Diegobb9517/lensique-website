const fs = require('fs');
let css = fs.readFileSync('src/App.css', 'utf8');

// 1. product-detail-image
css += `
/* Product Detail E-commerce Pattern Redesign */
.product-detail-image {
  object-fit: contain;
  min-height: 480px;
  background-color: #f7f7f7;
  width: 100%;
}
@media (max-width: 768px) {
  .product-detail-image {
    min-height: 320px;
  }
}

.product-benefit-pill {
  display: inline-block;
  background-color: #dcfce7;
  color: #166534;
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  margin-right: 8px;
  margin-bottom: 8px;
  line-height: 1.4;
}
.product-benefit-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.product-trust-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 16px;
  font-size: 13px;
  color: #64748b;
  flex-wrap: wrap;
  gap: 12px;
}
.product-trust-item {
  display: flex;
  align-items: center;
  gap: 6px;
}
.product-trust-item svg {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.product-detail-price {
  font-family: 'Inter', sans-serif;
  font-size: 22px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 16px;
  font-variant-numeric: lining-nums tabular-nums;
}

.cl-qty-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.cl-qty-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px;
}
.cl-qty-btn {
  background: #f1f5f9;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #334155;
  font-weight: 600;
}
.cl-qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cl-qty-value {
  width: 24px;
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
}
`;

fs.writeFileSync('src/App.css', css);
console.log('Updated App.css');
