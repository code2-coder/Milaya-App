const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/ShippingAndPackaging.jsx');
let content = fs.readFileSync(file, 'utf8');

// Replace rounded shapes with sharp / slightly rounded shapes
content = content.replace(/rounded-2xl/g, 'rounded-sm');
content = content.replace(/rounded-xl/g, 'rounded-sm');
content = content.replace(/rounded-lg/g, 'rounded-sm');
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
content = content.replace(/shadow-md/g, 'shadow-none');

// Focus states for inputs
content = content.replace(/focus:ring-1/g, 'focus:ring-0');
content = content.replace(/focus:ring-black/g, '');

// Status tags (FREE, Included)
content = content.replace(/text-emerald-700/g, 'text-black');
content = content.replace(/text-emerald-800/g, 'text-black');
content = content.replace(/text-emerald-600/g, 'text-black');
content = content.replace(/bg-emerald-100\/60/g, 'bg-gray-100');
content = content.replace(/bg-emerald-50/g, 'bg-gray-100');
content = content.replace(/border-emerald-100/g, 'border-gray-200');
content = content.replace(/text-amber-700/g, 'text-black');
content = content.replace(/text-amber-600/g, 'text-black');
content = content.replace(/text-amber-900\/80/g, 'text-black');
content = content.replace(/bg-amber-50/g, 'bg-gray-100');
content = content.replace(/to-orange-50/g, 'to-gray-100');
content = content.replace(/border-amber-200\/60/g, 'border-gray-200');
content = content.replace(/border-amber-100/g, 'border-gray-200');

// Radio buttons for payment methods
content = content.replace(/ring-1 ring-\[black\]\/25/g, 'border-black');
content = content.replace(/ring-1 ring-\[black\]\/20/g, 'border-black');

fs.writeFileSync(file, content);
console.log('ShippingAndPackaging.jsx modified successfully!');
