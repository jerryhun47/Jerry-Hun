import React, { useEffect, useState } from 'react';
import { Palette } from 'lucide-react';

const THEMES = [
  { name: 'Red', class: '' }, // Default (Glossy Red)
  { name: 'Blue', class: 'theme-blue' },
  { name: 'Green', class: 'theme-green' },
  { name: 'Purple', class: 'theme-purple' },
  { name: 'Orange', class: 'theme-orange' }
];

export default function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('app-theme') || '';
  });

  useEffect(() => {
    // Remove all theme classes first
    THEMES.forEach(t => {
      if (t.class) {
        document.body.classList.remove(t.class);
      }
    });
    // Add new theme class
    if (currentTheme) {
      document.body.classList.add(currentTheme);
    }
    localStorage.setItem('app-theme', currentTheme);
  }, [currentTheme]);

  return (
    <div className="py-2 px-4 border-t border-slate-800 mt-2">
      <div className="flex items-center text-sm font-medium text-slate-400 mb-3">
        <Palette size={16} className="mr-2" />
        Theme Color
      </div>
      <div className="flex gap-3">
        {THEMES.map((theme) => (
          <button
            key={theme.name}
            title={theme.name}
            onClick={() => setCurrentTheme(theme.class)}
            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
              currentTheme === theme.class ? 'border-white scale-110 shadow-lg' : 'border-transparent'
            }`}
            style={{
              backgroundColor: theme.name === 'Red' ? '#ef4444' : 
                               theme.name === 'Blue' ? '#3b82f6' : 
                               theme.name === 'Green' ? '#22c55e' : 
                               theme.name === 'Purple' ? '#a855f7' : '#f97316'
            }}
          />
        ))}
      </div>
    </div>
  );
}
