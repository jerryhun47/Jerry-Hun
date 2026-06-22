import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Copy, Eye, X, CheckCircle, Zap, Shield, TrendingUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoProducts = () => (
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
         <h4 className="font-bold text-white text-lg">Super Grok AI</h4>
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

  const [randomizedPrompts, setRandomizedPrompts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRandomizedPrompts([...fetched].sort(() => 0.5 - Math.random()));
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
      }, 1000);
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
    setShowCopyPromo(true);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentDisplayPrompts = searchQuery ? prompts : randomizedPrompts;
  
  const filteredPrompts = currentDisplayPrompts.filter(p => 
    p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.shortDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.tags && p.tags.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans p-4 sm:p-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-800/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 font-bold uppercase tracking-wider text-sm mb-2 block">Premium Collection</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl font-black text-white mb-4">
             AI <span className="text-red-500">Prompts</span> Library
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-slate-400 max-w-2xl mx-auto">
             High-converting, tested, and powerful AI prompts to supercharge your YouTube automation journey.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8 max-w-md mx-auto relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
             <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search prompts..." className="w-full bg-slate-900/80 border border-slate-800 text-white rounded-full pl-12 pr-4 py-3 focus:ring-2 focus:ring-red-500 outline-none backdrop-blur-md transition-shadow" />
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-slate-900 rounded-3xl p-4 border border-slate-800">
                   <div className="h-48 bg-slate-800 rounded-2xl mb-4"></div>
                   <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
                   <div className="h-4 w-full bg-slate-800 rounded mb-4"></div>
                   <div className="h-10 w-full bg-slate-800 rounded-xl"></div>
                </div>
             ))}
          </div>
        ) : filteredPrompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPrompts.map((prompt) => (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 key={prompt.id} 
                 className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 group flex flex-col cursor-pointer"
                 onClick={() => setSelectedPrompt(prompt)}
               >
                 <div className="relative aspect-video overflow-hidden bg-slate-950">
                    {prompt.imageUrl ? (
                       <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center text-slate-700 bg-slate-900 font-bold">No Thumbnail</div>
                    )}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                       {prompt.isTrending && <span className="bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase flex items-center gap-1 shadow-md"><TrendingUp size={12}/> Trending</span>}
                    </div>
                 </div>
                 
                 <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-red-400 transition-colors">{prompt.title}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 md:line-clamp-3 flex-1">{prompt.shortDesc}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                       <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2 flex items-center gap-1.5 justify-center">
                          <CheckCircle size={14} className="text-green-500" />
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">98% Working</span>
                       </div>
                       <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2 flex items-center gap-1.5 justify-center">
                          <Zap size={14} className="text-yellow-500" />
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">High Demand</span>
                       </div>
                       <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2 flex items-center gap-1.5 justify-center">
                          <Shield size={14} className="text-blue-500" />
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">Evergreen</span>
                       </div>
                       <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-2 flex items-center gap-1.5 justify-center">
                          <svg className="w-3.5 h-3.5 text-purple-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.236l6.764 13.528H5.236L12 6.236z"/></svg>
                          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">Low Comp</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-2 mt-auto">
                       <button onClick={(e) => handleCopy(prompt.id, prompt.fullPrompt || prompt.promptLink, e)} className="flex-1 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm z-10 relative">
                          {copiedId === prompt.id ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                          {copiedId === prompt.id ? 'Copied!' : 'Copy Prompt'}
                       </button>
                       <button onClick={(e) => { e.stopPropagation(); setSelectedPrompt(prompt); }} className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] active:scale-95 flex items-center justify-center gap-2 text-sm z-10 relative">
                          <Eye size={16} /> View Detail
                       </button>
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
             <p className="text-slate-400">Check back later or try adjusting your search terms.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
         {selectedPrompt && (
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[150] flex items-center justify-center p-4 sm:p-6 overflow-y-auto minimal-scrollbar"
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
                     {selectedPrompt.imageUrl && (
                        <div className="w-full aspect-video sm:aspect-[21/9] bg-black">
                           <img src={selectedPrompt.imageUrl} alt={selectedPrompt.title} className="w-full h-full object-cover" />
                        </div>
                     )}
                     
                     <div className="p-6 sm:p-8 md:p-10">
                        <div className="flex flex-wrap gap-2 mb-4">
                           {selectedPrompt.categories?.map((cat: string, i: number) => (
                              <span key={i} className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">{cat}</span>
                           ))}
                           <span className="bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">Pro Selection</span>
                        </div>
                        
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">{selectedPrompt.title}</h2>
                        <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-3xl">{selectedPrompt.shortDesc}</p>
                        
                        <div className="grid sm:grid-cols-2 gap-8 mb-10">
                           <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800">
                              <h4 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-4 flex items-center gap-2"><TrendingUp size={16}/> Performance Stats</h4>
                              <ul className="space-y-3">
                                 <li className="flex items-center justify-between text-sm"><span className="text-slate-400">Success Rate</span> <span className="font-bold text-green-400">98%</span></li>
                                 <li className="flex items-center justify-between text-sm"><span className="text-slate-400">Demand Level</span> <span className="font-bold text-yellow-400">Very High</span></li>
                                 <li className="flex items-center justify-between text-sm"><span className="text-slate-400">Competition</span> <span className="font-bold text-purple-400">Low</span></li>
                              </ul>
                           </div>
                           <div className="bg-slate-950 rounded-2xl p-6 border border-slate-800 flex flex-col justify-center items-start">
                              <h4 className="text-slate-500 font-bold uppercase tracking-wider text-sm mb-4">Access Link</h4>
                              {selectedPrompt.promptLink ? (
                                <a href={selectedPrompt.promptLink} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-medium break-all text-sm underline underline-offset-4 mb-4">
                                   {selectedPrompt.promptLink}
                                </a>
                              ) : (
                                <p className="text-slate-500 text-sm mb-4">No direct link provided.</p>
                              )}
                              
                              <button onClick={(e) => handleCopy(selectedPrompt.id, selectedPrompt.fullPrompt || selectedPrompt.promptLink || '', e)} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 flex items-center justify-center gap-2">
                                 {copiedId === selectedPrompt.id ? <CheckCircle size={20} /> : <Copy size={20} />}
                                 {copiedId === selectedPrompt.id ? 'Copied Successfully!' : 'Quick Copy'}
                              </button>
                           </div>
                        </div>

                        {selectedPrompt.fullPrompt && (
                           <div className="mt-8">
                              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
                                 Full Prompt Material
                                 <button onClick={(e) => handleCopy(selectedPrompt.id + '_full', selectedPrompt.fullPrompt, e)} className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800 transition-colors">
                                    {copiedId === selectedPrompt.id + '_full' ? <CheckCircle size={18} className="text-green-400"/> : <Copy size={18}/>}
                                 </button>
                              </h3>
                              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
                                 <pre className="text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed overflow-x-auto">{selectedPrompt.fullPrompt}</pre>
                              </div>
                           </div>
                        )}
                        
                        {selectedPrompt.useCase && (
                           <div className="mt-8 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                              <h4 className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-2">Ideal Use Case</h4>
                              <p className="text-slate-300 text-sm leading-relaxed">{selectedPrompt.useCase}</p>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Entry Promo Modal */}
      <AnimatePresence>
        {showEntryPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl">
              <button onClick={() => setShowEntryPromo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full"><X size={20}/></button>
              <div className="text-center mb-6">
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Limited Time 50% OFF</h3>
                <p className="text-slate-400 text-sm">Get instant access on your personal email.<br/>High demand AI tools.</p>
              </div>
              <PromoProducts />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Promo Modal */}
      <AnimatePresence>
        {showCopyPromo && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[250] flex items-center justify-center p-4">
            <motion.div initial={{scale:0.9, y:20}} animate={{scale:1, y:0}} exit={{scale:0.9, y:20}} className="bg-slate-950 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-lg w-full relative shadow-2xl">
              <button onClick={() => setShowCopyPromo(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full"><X size={20}/></button>
              <div className="text-center mb-6">
                <div className="bg-green-500/10 text-green-400 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                   <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Prompt Copied!</h3>
                <p className="text-slate-400 text-sm">Want better results? Upgrade your tools 🔥</p>
              </div>
              <PromoProducts />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
