import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Wrench, GraduationCap, MessageCircle, Sparkles } from 'lucide-react';

interface MobileBottomDockProps {
  whatsappNumber: string;
  onOpenChat: () => void;
}

export default function MobileBottomDock({ whatsappNumber, onOpenChat }: MobileBottomDockProps) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      exact: true,
    },
    {
      name: 'Tools',
      path: '/tools',
      icon: Wrench,
      badge: 'HOT',
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: GraduationCap,
    },
    {
      name: 'Prompts',
      path: '/prompts',
      icon: Sparkles,
    },
  ];

  const cleanWhatsApp = whatsappNumber.replace(/[^0-9]/g, '') || '923189418941';

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1 pointer-events-auto">
      <div className="relative bg-slate-950/90 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-1.5 shadow-[0_0_25px_rgba(244,63,94,0.25)] flex items-center justify-around">
        {/* Ambient Top Glow Line */}
        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-rose-500 to-transparent"></div>

        {navItems.map((item) => {
          const isActive = item.exact
            ? currentPath === item.path
            : currentPath.startsWith(item.path);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-rose-400 font-bold bg-rose-500/15 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]' : ''
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-3 px-1 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        {/* WhatsApp Direct Action Button */}
        <a
          href={`https://wa.me/${cleanWhatsApp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-emerald-400 hover:text-emerald-300 transition-all duration-200 active:scale-90 bg-emerald-950/40 border border-emerald-500/30 shadow-[0_0_15px_rgba(34,197,94,0.25)]"
        >
          <MessageCircle size={20} className="scale-105 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-[10px] mt-1 font-semibold text-emerald-300">WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
