import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Eye, X, CheckCircle, Zap, Shield, TrendingUp, Search, PlayCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoProducts = ({ isCopy }: { isCopy?: boolean }) => (
  <div className="flex flex-col gap-4 mt-4 text-left">
    {/* Veo 3 Ultra */}
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
       <div>
         <h4 className="font-bold text-white text-lg">Google Veo 3 Ultra</h4>
         <div className="flex items-center gap-2 mt-1">
           <span className="text-slate-500 line-through text-sm">PKR 6000</span>
           <span className="text-red-400 font-bold">PKR 3000</span>
           <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-0.5 rounded ml-2">🔥 50% OFF</span>
         </div>
       </div>
       <Link to="/tools" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg whitespace-nowrap active:scale-95 transition-all shadow-lg shadow-red-500/20 w-full sm:w-auto text-center">
         👉 Buy Now
       </Link>
    </div>
    {/* Super Grok AI */}
    <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
       <div>
         <h4 className="font-bold text-white text-lg">Grok AI</h4>
         <div className="flex items-center gap-2 mt-1">
           <span className="text-slate-500 line-through text-sm">PKR 6000</span>
           <span className="text-red-400 font-bold">PKR 3000</span>
           <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-0.5 rounded ml-2">🔥 50% OFF</span>
         </div>
       </div>
       <Link to="/tools" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg whitespace-nowrap active:scale-95 transition-all shadow-lg shadow-red-500/20 w-full sm:w-auto text-center">
         👉 Buy Now
       </Link>
    </div>
  </div>
);

export default function Prompts() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrompt, setSelectedPrompt] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showEntryPromo, setShowEntryPromo] = useState(false);
  const [showCopyPromo, setShowCopyPromo] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrompts(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching prompts", error);
      setLoading(false);
    });

    // Handle Entry Promo
    if (!sessionStorage.getItem('promoShown')) {
      const timer = setTimeout(() => {
        setShowEntryPromo(true);
        sessionStorage.setItem('promoShown', 'true');
      }, 1500);
      return () => {
        unsubscribe();
        clearTimeout(timer);
      };
    }

    return () => unsubscribe();
  }, []);

  const handleCopy = (id: string, text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(text) navigator.clipboard.writeText(text);
    setCopiedId(id);
    
    // Show copy promo
    setShowCopyPromo(true);
    
    setTimeout(() => {
       setCopiedId(null);
    }, 2000);
  };

  const filteredPrompts = prompts.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 sm:p-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-black text-white mb-4">
             AI <span className="text-red-500">Prompts</span> Library
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-slate-400 max-w-2xl mx-auto">
             High-converting, tested, and powerful AI prompts to supercharge your YouTube automation journey.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 max-w-md mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
             <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search prompts..." className="w-full bg-slate-900/80 border border-slate-800 text-white rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none backdrop-blur-md transition-shadow" />
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="animate-pulse bg-slate-900 rounded-3xl p-4 border border-slate-800">
                   <div className="h-56 bg-slate-800 rounded-2xl mb-4"></div>
                   <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
                   <div className="h-4 w-full bg-slate-800 rounded mb-4"></div>
                   <div className="h-10 w-full bg-slate-800 rounded-xl"></div>
                </div>
             ))}
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPrompts.map((prompt) => (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: true }}
                 key={prompt.id} 
                 className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col cursor-pointer"
                 onClick={() => setSelectedPrompt(prompt)}
               >
                 <div className="relative aspect-video overflow-hidden bg-slate-950">
                    {prompt.imageUrl ? (
                       <img src={prompt.imageUrl} loading="lazy" alt={prompt.title} className="w-full h-full object-cover" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 font-bold">No Thumbnail</div>
                    )}
                    {prompt.videoId && (
                       <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="bg-red-600 text-white rounded-full p-3 shadow-xl">
                             <PlayCircle size={32} />
                          </div>
                       </div>
                    )}
                 </div>
                 
                 <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{prompt.title}</h3>
                    {prompt.shortDesc && <p className="text-sm text-slate-400 mb-4 line-clamp-2 md:line-clamp-3">{prompt.shortDesc}</p>}
                    
                    <div className="mt-auto flex flex-col gap-2">
                       <button onClick={(e) => { e.stopPropagation(); setSelectedPrompt(prompt); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm z-10 relative shadow-sm">
                          <Eye size={16} /> View Prompt
                       </button>
                       {prompt.videoLink && (
                          <button onClick={(e) => { e.stopPropagation(); setSelectedPrompt(prompt); }} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-95 flex items-center justify-center gap-2 text-sm z-10 relative">
                             <PlayCircle size={16} /> Watch Tutorial
                          </button>
                       )}
                    </div>
                 </div>
               </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/40 rounded-3xl border border-slate-800/50">
             <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-slate-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No Prompts Found</h3>
             <p className="text-slate-400">Try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
         {selectedPrompt && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto minimal-scrollbar"
               onClick={() => setSelectedPrompt(null)}
            >
               <motion.div 
                  initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]"
               >
                  <button onClick={() => setSelectedPrompt(null)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur-md hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors">
                     <X size={20} />
                  </button>

                  <div className="overflow-y-auto minimal-scrollbar">
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
                           <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 font-bold">No Media Available</div>
                        )}
                     </div>
                     
                     <div className="p-6 sm:p-8 md:p-10">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">{selectedPrompt.title}</h2>
                        {selectedPrompt.shortDesc && <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl">{selectedPrompt.shortDesc}</p>}
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                           {selectedPrompt.promptLink && (
                              <a href={selectedPrompt.promptLink} target="_blank" rel="noopener noreferrer" className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                                 <ExternalLink size={20} /> Open Prompt
                              </a>
                           )}
                           <button onClick={(e) => handleCopy(selectedPrompt.id, selectedPrompt.promptLink || '', e)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2">
                              {copiedId === selectedPrompt.id ? <CheckCircle size={20} /> : <Copy size={20} />}
                              {copiedId === selectedPrompt.id ? 'Copied Successfully!' : 'Copy Prompt'}
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Entry Promo Modal */}
      <AnimatePresence>
        {showEntryPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl shadow-red-900/20">
               <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-full font-black text-sm uppercase tracking-wider shadow-lg shadow-red-600/50 whitespace-nowrap">
                  🔥 Special Offer 🔥
               </div>
              <button onClick={() => setShowEntryPromo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full transition-colors"><X size={20}/></button>
              <div className="text-center mt-4 mb-6">
                <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Get 50% OFF</h3>
                <p className="text-slate-400 font-medium">on VEO 3 & Grok AI Today!</p>
              </div>
              <PromoProducts />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Promo Modal */}
      <AnimatePresence>
        {showCopyPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[250] flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl shadow-blue-900/20">
              <button onClick={() => setShowCopyPromo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full transition-colors"><X size={20}/></button>
              <div className="text-center mb-6">
                <div className="bg-green-500/10 text-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                   <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Prompt Copied!</h3>
                <p className="text-slate-400 font-medium text-sm">Want same results? Get VEO 3 AI Tool at 50% OFF today!</p>
              </div>
              <PromoProducts isCopy />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
