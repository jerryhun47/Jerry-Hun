import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import BackgroundEffects from './BackgroundEffects';
import ParticleSystem from './ParticleSystem';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools Store', path: '/tools' },
    { name: 'Courses', path: '/courses' },
  ];

  const { scrollY } = useScroll();
  const navTextOpacity = useTransform(scrollY, [150, 250], [0, 1]);
  const headerLogoOpacity = useTransform(scrollY, [290, 300], [0, 1]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-300 relative z-0">
      <BackgroundEffects />
      <ParticleSystem />
      <nav className="fixed top-0 w-full z-50 glass-effect bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Left: Hamburger menu and Logo */}
            <div className="flex flex-1 justify-start items-center gap-2 sm:gap-4 z-50">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/10 shrink-0">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link to="/" className="flex items-center group pointer-events-auto shrink-0">
                  <motion.div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/logo.png" alt="Jerry Automation Logo" className="w-full h-full object-contain" />
                  </motion.div>
                  <motion.span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-slate-200 transition-colors ml-2 shrink-0 whitespace-nowrap">
                    Jerry <span className="text-red-500 font-extrabold hidden sm:inline">Automation</span>
                  </motion.span>
              </Link>
            </div>

            {/* Right: Buy Tools Button */}
            <div className="flex-1 flex justify-end z-50">
              <Link to="/tools" className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-sm rounded-full font-medium transition-all shadow-lg shadow-red-500/30 shrink-0">
                Buy Tools
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile / Global Menu Overlay */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 p-4 space-y-4 shadow-xl z-40">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block font-medium px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === link.path ? 'bg-red-500/10 text-red-500' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      <footer className="bg-black/90 backdrop-blur-md border-t border-slate-900 text-slate-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group inline-flex">
              <div className="bg-white p-1 rounded-lg group-hover:bg-slate-200 transition-colors w-10 h-10 flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="Jerry Automation Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight group-hover:text-slate-200 transition-colors">Jerry <span className="text-red-500 font-extrabold">Automation</span></span>
            </Link>
            <p className="mb-4">Pakistan's #1 YouTube Automation platform. Start your passive income journey today.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-red-400 transition-colors">Home</Link></li>
              <li><Link to="/tools" className="hover:text-red-400 transition-colors">Tools Store</Link></li>
              <li><Link to="/admin/login" className="hover:text-red-400 transition-colors text-xs opacity-50">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Newsletter</h4>
            <p className="mb-4 text-sm">Get daily YouTube automation tips in your inbox.</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-1 focus:ring-red-500 placeholder:text-slate-500 transition-all" />
              <button className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-r-lg transition-colors font-medium cursor-pointer">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-sm flex flex-col md:flex-row justify-between items-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Jerry Automation. All rights reserved.</p>
            <Link to="/admin/login" className="hover:text-red-400 mt-4 md:mt-0 transition-colors">Admin Login</Link>
        </div>
      </footer>
    </div>
  );
}
