const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.tsx', 'utf-8');
content = content.replace(/text-slate-500/g, 'text-slate-400');
fs.writeFileSync('src/pages/Home.tsx', content);
console.log('Replaced text-slate-500 with text-slate-400');
