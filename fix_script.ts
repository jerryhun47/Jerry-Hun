import * as fs from 'fs';
import * as path from 'path';

function fixFetch() {
  const files = [
    'src/pages/Refund.tsx',
    'src/pages/ToolsStore.tsx',
    'src/pages/admin/Dashboard.tsx',
    'src/components/PaymentModal.tsx',
    'src/components/AdminFeatures.tsx',
    'src/components/AIChatbot.tsx'
  ];

  for (const file of files) {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      if (!content.includes('apiFetch')) {
        content = content.replace(/await fetch\('\/api/g, "await apiFetch('/api");
        content = content.replace(/fetch\('\/api/g, "apiFetch('/api");
        
        let importPath = file.includes('pages/admin') ? '../../lib/api' : file.includes('components') || file.includes('pages') ? '../lib/api' : './lib/api';
        content = `import { apiFetch } from '${importPath}';\n` + content;
        fs.writeFileSync(file, content);
      }
    }
  }
}

function fixOnSnapshotDashboard() {
  const file = 'src/pages/admin/Dashboard.tsx';
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\(snap\) => {([^}]*)}\)\)/g, "(snap) => {$1}, (err) => console.error(err)))");
  fs.writeFileSync(file, content);
}

fixFetch();
fixOnSnapshotDashboard();
console.log("Fixes applied.");
