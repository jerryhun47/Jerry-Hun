import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Eye, X, CheckCircle, Search, PlayCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getCachedPrompts, getInstantPrompts } from '../lib/cacheService';

const PromoProducts = () => (
  <div className="flex flex-col gap-3 mt-4 text-left">
    {/* Veo 3 Ultra */}
    <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
       <div>
         <h4 className="font-bold text-white text-base sm:text-lg">Google Veo 3 Ultra</h4>
         <div className="flex items-center gap-2 mt-1">
           <span className="text-slate-500 line-through text-xs sm:text-sm">PKR 6,000</span>
           <span className="text-red-500 font-bold text-sm sm:text-base">PKR 3,000</span>
           <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 50% OFF</span>
         </div>
       </div>
       <Link to="/tools" className="bg-[#f50505] hover:bg-[#dc0404] text-white font-bold py-2.5 px-5 rounded-xl whitespace-nowrap active:scale-95 transition-all text-sm w-full sm:w-auto text-center shadow-md">
         👉 Buy Now
       </Link>
    </div>
    {/* Super Grok AI */}
    <div className="bg-slate-900 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
       <div>
         <h4 className="font-bold text-white text-base sm:text-lg">Grok AI Pro</h4>
         <div className="flex items-center gap-2 mt-1">
           <span className="text-slate-500 line-through text-xs sm:text-sm">PKR 6,000</span>
           <span className="text-red-500 font-bold text-sm sm:text-base">PKR 3,000</span>
           <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full">🔥 50% OFF</span>
         </div>
       </div>
       <Link to="/tools" className="bg-[#f50505] hover:bg-[#dc0404] text-white font-bold py-2.5 px-5 rounded-xl whitespace-nowrap active:scale-95 transition-all text-sm w-full sm:w-auto text-center shadow-md">
         👉 Buy Now
       </Link>
    </div>
  </div>
);

export default function Prompts() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [prompts, setPrompts] = useState<any[]>(() => getInstantPrompts());
  const [loading, setLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showEntryPromo, setShowEntryPromo] = useState(false);
  const [showCopyPromo, setShowCopyPromo] = useState(false);

  const generateSlug = (title: string) => (title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  useEffect(() => {
    if (!loading && prompts.length > 0 && slug) {
      const p = prompts.find(p => generateSlug(p.title) === slug);
      if (p) {
        setSelectedPrompt(p);
      }
    } else if (!slug) {
      setSelectedPrompt(null);
    }
  }, [slug, prompts, loading]);

  useEffect(() => {
    const fetchPromptsData = async () => {
      try {
        const fetched = await getCachedPrompts();
        setPrompts(fetched);
      } catch (e) {
        // Handled in cache
      } finally {
        setLoading(false);
      }
    };
    fetchPromptsData();

    // Handle Entry Promo
    if (!sessionStorage.getItem('promoShown')) {
      const timer = setTimeout(() => {
        setShowEntryPromo(true);
        sessionStorage.setItem('promoShown', 'true');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (text) {
      navigator.clipboard.writeText(text);
    }
    setCopiedId(id);
    setShowCopyPromo(true);
    
    setTimeout(() => {
       setCopiedId(null);
    }, 2500);
  };

  const filteredPrompts = prompts.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 sm:p-6 lg:px-8 py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3">
             AI <span className="text-rose-500">Prompts</span> Library
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
             Tested, high-converting, and viral AI prompts for YouTube automation & passive growth.
          </p>
          
          <div className="mt-6 max-w-md mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
               type="text" 
               value={searchQuery} 
               onChange={e => setSearchQuery(e.target.value)} 
               placeholder="Search AI prompts..." 
               className="w-full bg-slate-900 border border-slate-800 text-white rounded-full pl-11 pr-4 py-2.5 sm:py-3 focus:border-rose-500 focus:outline-none text-sm shadow-inner transition-colors" 
             />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-slate-900 rounded-2xl p-4 border border-slate-800">
                   <div className="h-44 bg-slate-800 rounded-xl mb-4"></div>
                   <div className="h-5 w-3/4 bg-slate-800 rounded mb-2"></div>
                   <div className="h-4 w-full bg-slate-800 rounded mb-4"></div>
                   <div className="h-9 w-full bg-slate-800 rounded-lg"></div>
                </div>
             ))}
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
               <div 
                 key={prompt.id} 
                 className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg transition-all flex flex-col cursor-pointer group"
                 onClick={() => navigate(`/prompts/${generateSlug(prompt.title)}`)}
               >
                 <div className="relative aspect-video overflow-hidden bg-slate-950">
                    {prompt.imageUrl ? (
                       <img src={prompt.imageUrl} loading="lazy" alt={prompt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-900 font-semibold text-sm">AI Prompt</div>
                    )}
                    {prompt.videoId && (
                       <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                          <div className="bg-rose-600 text-white rounded-full p-2.5 shadow-lg">
                             <PlayCircle size={28} />
                          </div>
                       </div>
                    )}
                 </div>
                 
                 <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{prompt.title}</h3>
                    {prompt.shortDesc && <p className="text-xs sm:text-sm text-slate-400 mb-4 line-clamp-2">{prompt.shortDesc}</p>}
                    
                    <div className="flex flex-wrap gap-1.5 mb-4">
                       <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded">🔥 Viral</span>
                       <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded">💰 High RPM</span>
                       <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-0.5 rounded">🎯 Tested</span>
                    </div>

                    <div className="mt-auto flex flex-col gap-2">
                       <button 
                         onClick={(e) => { e.stopPropagation(); navigate(`/prompts/${generateSlug(prompt.title)}`); }} 
                         className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
                       >
                          <Eye size={16} /> View Prompt
                       </button>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900/60 rounded-2xl border border-slate-800">
             <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Search size={20} />
             </div>
             <h3 className="text-lg font-bold text-white mb-1">No Prompts Found</h3>
             <p className="text-slate-400 text-sm">Try searching with a different keyword.</p>
          </div>
        )}
      </div>

      {/* Detail Modal Popup */}
      <AnimatePresence>
         {selectedPrompt && (
            <div 
               className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
               onClick={() => navigate('/prompts')}
            >
               <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
               >
                  {/* Close button */}
                  <button 
                    onClick={() => navigate('/prompts')} 
                    className="absolute top-3 right-3 z-20 w-9 h-9 bg-slate-950/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-full flex items-center justify-center transition-colors border border-slate-700 shadow-md"
                    title="Close"
                  >
                     <X size={18} />
                  </button>

                  <div className="overflow-y-auto p-0">
                     {/* Video Player or Thumbnail */}
                     <div className="w-full aspect-video bg-black relative">
                        {selectedPrompt.videoId ? (
                           <iframe 
                              src={`https://www.youtube.com/embed/${selectedPrompt.videoId}?autoplay=1`} 
                              className="w-full h-full border-0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                              allowFullScreen
                           ></iframe>
                        ) : selectedPrompt.imageUrl ? (
                           <img src={selectedPrompt.imageUrl} alt={selectedPrompt.title} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-950 font-bold">No Media Available</div>
                        )}
                     </div>
                     
                     <div className="p-5 sm:p-7">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3">{selectedPrompt.title}</h2>
                        {selectedPrompt.shortDesc && (
                          <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed">{selectedPrompt.shortDesc}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mb-6">
                           {['High RPM', 'Tested & Verified', 'Beginner Friendly', 'Viral Automation Ready'].map((badge, i) => (
                             <span key={i} className="bg-slate-800/80 text-slate-300 px-3 py-1 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1.5">
                               <CheckCircle size={13} className="text-emerald-400" /> {badge}
                             </span>
                           ))}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 pt-2">
                           {selectedPrompt.promptLink ? (
                              <>
                                 <a 
                                   href={selectedPrompt.promptLink} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-5 rounded-xl transition-colors shadow flex items-center justify-center gap-2 text-sm"
                                 >
                                    <ExternalLink size={17} /> Open Prompt Tool
                                 </a>
                                 <button 
                                   onClick={(e) => handleCopy(selectedPrompt.id, selectedPrompt.promptLink || '', e)} 
                                   className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-sm active:scale-95"
                                 >
                                    {copiedId === selectedPrompt.id ? <CheckCircle size={17} className="text-white" /> : <Copy size={17} />}
                                    {copiedId === selectedPrompt.id ? 'Copied Successfully!' : 'Copy Prompt'}
                                 </button>
                              </>
                           ) : (
                              <div className="sm:col-span-2 bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-center">
                                 <p className="text-slate-300 font-semibold text-sm">Check Video Description For Prompt Details</p>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* Entry Special Offer Promo Modal */}
      <AnimatePresence>
        {showEntryPromo && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowEntryPromo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-950 border border-slate-800 p-5 sm:p-7 rounded-2xl max-w-md w-full relative shadow-2xl"
            >
               <button 
                 onClick={() => setShowEntryPromo(false)} 
                 className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-1.5 rounded-full transition-colors"
                 title="Close"
               >
                 <X size={18}/>
               </button>
               
               <div className="text-center mt-2 mb-4">
                 <div className="inline-block bg-rose-600/20 text-rose-400 text-xs font-black uppercase px-3 py-1 rounded-full mb-2 border border-rose-500/30">
                    🔥 Special Discount 🔥
                 </div>
                 <h3 className="text-2xl font-black text-white mb-1">Get 50% OFF</h3>
                 <p className="text-slate-400 text-xs sm:text-sm">on Top Video & AI Automation Tools Today!</p>
               </div>
               <PromoProducts />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Copy Success Promo Modal */}
      <AnimatePresence>
        {showCopyPromo && (
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[250] flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowCopyPromo(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-950 border border-slate-800 p-5 sm:p-7 rounded-2xl max-w-md w-full relative shadow-2xl"
            >
              <button 
                onClick={() => setShowCopyPromo(false)} 
                className="absolute top-3 right-3 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 p-1.5 rounded-full transition-colors"
                title="Close"
              >
                <X size={18}/>
              </button>
              
              <div className="text-center mb-4">
                <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-500/20 shadow-sm">
                   <CheckCircle size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Prompt Copied!</h3>
                <p className="text-slate-400 text-xs sm:text-sm">Want top results? Unlock professional AI Tools at 50% OFF today!</p>
              </div>
              <PromoProducts />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
