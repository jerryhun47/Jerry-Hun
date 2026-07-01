const fs = require('fs');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/\/logo\.png/g, '/logo.webp');
  content = content.replace(/\/premium-tools\.jpg/g, '/premium-tools.webp');
  fs.writeFileSync(filePath, content);
}

['src/pages/Home.tsx', 'src/components/Layout.tsx', 'src/components/BackgroundEffects.tsx', 'index.html'].forEach(replaceInFile);

console.log('Replaced png and jpg extensions with webp.');
