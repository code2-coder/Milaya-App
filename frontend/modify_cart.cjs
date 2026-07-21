const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/pages/Cart.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace rounded shapes with sharp / slightly rounded shapes
content = content.replace(/rounded-2xl/g, 'rounded-sm');
content = content.replace(/rounded-xl/g, 'rounded-sm');
content = content.replace(/rounded-lg/g, 'rounded-sm');
// content = content.replace(/rounded-full/g, 'rounded-none');
content = content.replace(/rounded-\[2rem\]/g, 'rounded-none');

// Fix border colors and remove soft shadows/colors
content = content.replace(/border-gray-100/g, 'border-gray-200');
content = content.replace(/border-gray-150/g, 'border-gray-200');
content = content.replace(/hover:border-\[black\]\/30/g, 'hover:border-black');
content = content.replace(/hover:border-\[black\]\/40/g, 'hover:border-black');
content = content.replace(/hover:border-\[black\]\/20/g, 'hover:border-black');
content = content.replace(/shadow-\[0_15px_30px_-10px_rgba\(184,147,78,0\.08\)\]/g, 'shadow-none');
content = content.replace(/shadow-\[0_20px_60px_-15px_rgba\(0,0,0,0\.05\)\]/g, 'shadow-none');
content = content.replace(/shadow-sm/g, 'shadow-none');

// Focus states for inputs
content = content.replace(/focus:ring-1/g, 'focus:ring-0');
content = content.replace(/focus:ring-black/g, '');

// Empty state specific colors
content = content.replace(/bg-\[#f3f4f6\]\/20/g, 'bg-gray-100');
content = content.replace(/blur-\[80px\]/g, '');
content = content.replace(/bg-\[black\]\/10/g, 'bg-gray-100');
content = content.replace(/blur-2xl/g, '');

// Status tags (FREE, Included)
content = content.replace(/text-emerald-700/g, 'text-black');
content = content.replace(/bg-emerald-100\/60/g, 'bg-gray-100');
content = content.replace(/text-amber-700/g, 'text-black');

// Main button tweaks
content = content.replace(/hover:-translate-y-0\.5/g, '');
content = content.replace(/border-gray-800/g, 'border-black');

// Radio buttons for payment methods
content = content.replace(/ring-1 ring-black\/20/g, 'border-black');
content = content.replace(/border-gray-250/g, 'border-gray-300');

fs.writeFileSync(file, content);
console.log('Cart.jsx modified successfully!');
