import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { motion, useScroll, useTransform } from 'motion/react';
import BackgroundEffects from './BackgroundEffects';
import ParticleSystem from './ParticleSystem';
import NetworkBackground from './NetworkBackground';
import FrontendAnnouncements from './FrontendAnnouncements';
import AIChatbot from './AIChatbot';

import LiveTracking from './LiveTracking';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    
    // Fetch Global Setting (WhatsApp Number)
    const fetchSettings = async () => {
      try {
        const { getDocs, collection } = await import('firebase/firestore');
        const { db } = await import('../lib/firebase');
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty) {
            setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Tools Store', path: '/tools' },
    { name: 'Courses', path: '/courses' },
    { name: 'Refund', path: '/refund' },
    { name: 'Prompts', path: '/prompts' },
  ];

  const { scrollY } = useScroll();
  const navTextOpacity = useTransform(scrollY, [150, 250], [0, 1]);
  const headerLogoOpacity = useTransform(scrollY, [290, 300], [0, 1]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 font-sans text-slate-300 relative z-0">
      <BackgroundEffects />
      <ParticleSystem />
      <NetworkBackground />
      <nav className="fixed top-0 w-full z-50 glass-effect bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            {/* Left: Hamburger menu and Logo */}
            <div className="flex flex-1 justify-start items-center gap-2 sm:gap-4 z-50">
              <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-white/10 shrink-0">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              <Link to="/" className="flex items-center group pointer-events-auto shrink-0 ml-4">
                  <motion.div className="w-10 h-10 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/logo.png" alt="Jerry Automation Logo" className="w-full h-full object-contain" />
                  </motion.div>
                  <motion.span className="font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-slate-200 transition-colors ml-1 shrink-0 whitespace-nowrap">
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
            <button
              onClick={() => { setIsOpen(false); setIsChatOpen(true); }}
              className="w-full flex items-center justify-start font-medium px-4 py-3 rounded-lg transition-colors text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <MessageCircle size={18} className="mr-2 text-indigo-400" />
               Chat with AI
            </button>
          </div>
        )}
      </nav>

      {/* Global Announcement Bar fixed below Header */}
      <div className="fixed top-16 w-full z-40">
         <FrontendAnnouncements />
      </div>

      <LiveTracking />
      <AIChatbot isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

      <main className="flex-1 relative z-10 pt-24">
        <Outlet />
      </main>

      <footer className="bg-black/90 backdrop-blur-md border-t border-slate-900 text-slate-400 py-12 relative z-10 w-full mt-auto">
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
              <li><Link to="/courses" className="hover:text-red-400 transition-colors">Courses</Link></li>
              <li><Link to="/prompts" className="hover:text-red-400 transition-colors">Prompts</Link></li>
              <li><Link to="/refund" className="hover:text-red-400 transition-colors">Refund</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="hover:text-red-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="hover:text-red-400 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-900 text-center text-sm flex flex-col md:flex-row justify-between items-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} Jerry Automation. All rights reserved.</p>
            <Link to="/admin/login" className="hover:text-red-400 mt-4 md:mt-0 transition-colors">Status Logs</Link>
        </div>
      </footer>
      
      {/* Floating WhatsApp Button */}
      {whatsappNumber && (
        <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-[100] bg-green-500 hover:bg-green-400 text-white p-4 rounded-full shadow-lg shadow-green-500/30 transition-transform hover:scale-110 flex items-center justify-center">
          <MessageCircle size={32} />
        </a>
      )}
    </div>
  );
}
