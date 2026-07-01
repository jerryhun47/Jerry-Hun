const fs = require('fs');

let layout = fs.readFileSync('src/components/Layout.tsx', 'utf-8');
layout = layout.replace(
  /<img src="\/logo\.webp" alt="Jerry Automation Logo" className="w-full h-full object-contain" \/>/g,
  '<img src="/logo.webp" alt="Jerry Automation Logo" width="40" height="40" className="w-full h-full object-contain" />'
);
fs.writeFileSync('src/components/Layout.tsx', layout);

let bgEffects = fs.readFileSync('src/components/BackgroundEffects.tsx', 'utf-8');
bgEffects = bgEffects.replace(
  /<img src="\/logo\.webp" alt="Background Logo" className="w-\[80%\] h-\[80%\] object-contain" \/>/g,
  '<img src="/logo.webp" alt="Background Logo" width="200" height="200" className="w-[80%] h-[80%] object-contain" />'
);
fs.writeFileSync('src/components/BackgroundEffects.tsx', bgEffects);

console.log('Added width and height to logos');
