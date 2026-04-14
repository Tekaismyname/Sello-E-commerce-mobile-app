const fs = require('fs');
let svg = fs.readFileSync('c:/Users/huynh/OneDrive/Desktop/Sello-e-commerce-app/SVG/Product-detail.svg', 'utf8');

// remove images
svg = svg.replace(/<image[\s\S]*?>/g, '');

// truncate path d attributes
svg = svg.replace(/d="([^"]{100,})"/g, 'd="..."');

fs.writeFileSync('c:/Users/huynh/OneDrive/Desktop/Sello-e-commerce-app/SVG/Product-detail-small.svg', svg);
console.log('Done trimming SVG.');