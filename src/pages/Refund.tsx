import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Refund() {
  const [reason, setReason] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    receiveMethod: 'Easypaisa'
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !selectedProduct || !formData.name || !formData.email || !formData.phone) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    setStatus('loading');
    
    try {
      const checkQ = query(collection(db, 'refunds'), where('email', '==', formData.email), where('productId', '==', selectedProduct.id));
      const checkSnap = await getDocs(checkQ);
      
      if (!checkSnap.empty) {
        setStatus('error');
        setErrorMsg("You have already submitted a refund request for this product.");
        return;
      }

      await addDoc(collection(db, 'refunds'), {
        userId: formData.email,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        refundReason: reason,
        amount: selectedProduct.price,
        status: 'Pending',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        receiveMethod: formData.receiveMethod,
        timestamp: serverTimestamp()
      });
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg("Failed to submit refund request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4">
        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 card-shadow text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
             </div>
             <h2 className="text-2xl font-black text-slate-900 mb-4">Refund Request Submitted</h2>
             <p className="text-slate-600 leading-relaxed max-w-md mx-auto">
               Your refund request has been submitted successfully.<br/>
               It will be processed within 24–48 hours.<br/>
               <strong className="text-red-500 font-bold mt-2 inline-block">Please do not contact customer support repeatedly.</strong>
             </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
               <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Request a Refund</h1>
               <p className="text-slate-500 max-w-lg mx-auto">We're sorry to see you go. Please fill out the form below to request a refund for your purchase.</p>
            </div>

            {status === 'error' && (
               <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 font-semibold text-sm">
                  <AlertCircle size={20} />
                  {errorMsg}
               </div>
            )}

            {/* STEP 1 */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow relative">
               <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0">1</span>
                  Why do you want a refund?
               </h3>
               <textarea 
                  required
                  rows={4}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Please explain in detail why you are requesting a refund..."
                  className="w-full border-2 border-slate-200 rounded-xl p-4 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all resize-none font-medium"
               />
               <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wider">* Reason is required to proceed</p>
            </div>

            {/* STEP 2 & 3 */}
            <AnimatePresence>
               {reason.length > 5 && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow overflow-hidden relative">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0">2</span>
                       Select Purchased Product
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4 mb-6">
                       {products.map(p => (
                          <div 
                             key={p.id}
                             onClick={() => setSelectedProduct(p)}
                             className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${selectedProduct?.id === p.id ? 'border-red-500 bg-red-50 shadow-md transform scale-[1.02]' : 'border-slate-100 hover:border-red-200 bg-slate-50'}`}
                          >
                             <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-900 text-sm leading-snug pr-2">{p.name || 'Unnamed Product'}</h4>
                                {selectedProduct?.id === p.id && <CheckCircle2 className="text-red-500 flex-shrink-0" size={18} />}
                             </div>
                             <p className="font-black text-slate-700">PKR {(p.price || 0).toLocaleString()}</p>
                          </div>
                       ))}
                    </div>

                    <AnimatePresence>
                      {selectedProduct && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-slate-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 shadow-xl shadow-slate-900/10 mt-6 relative overflow-hidden">
                            <div className="relative z-10">
                               <p className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Auto-detected Amount</p>
                               <div className="text-3xl font-black text-red-500">PKR {(selectedProduct.price || 0).toLocaleString()}</div>
                            </div>
                            <div className="text-sm font-medium text-slate-300 bg-slate-800 px-4 py-2 rounded-lg text-center relative z-10 border border-slate-700">
                               Amount is locked and cannot be edited.
                            </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                 </motion.div>
               )}
            </AnimatePresence>

            {/* STEP 4 */}
            <AnimatePresence>
               {selectedProduct && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                       <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0">3</span>
                       User Details
                    </h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4 border-b border-slate-100 pb-6">
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                          <input 
                             type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                             className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all font-semibold"
                             placeholder="Full Name"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
                          <input 
                             type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                             className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all font-semibold"
                             placeholder="Email Address"
                          />
                       </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Active Phone Number *</label>
                          <input 
                             type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                             className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all font-semibold"
                             placeholder="Phone Number"
                          />
                       </div>
                       <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Refund Receiving Method *</label>
                          <select 
                             required value={formData.receiveMethod} onChange={e => setFormData({...formData, receiveMethod: e.target.value})}
                             className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:border-red-500 outline-none transition-all font-black text-slate-900 cursor-pointer"
                          >
                             <option value="Easypaisa">Easypaisa</option>
                             <option value="JazzCash">JazzCash</option>
                             <option value="Bank Transfer">Bank Transfer</option>
                          </select>
                       </div>
                    </div>

                 </motion.div>
               )}
            </AnimatePresence>

            {/* STEP 5 */}
            <AnimatePresence>
               {selectedProduct && formData.name && formData.email && formData.phone && formData.receiveMethod && (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                    <button 
                       disabled={status === 'loading'}
                       type="submit" 
                       className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-red-500/20 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
                    >
                       {status === 'loading' ? 'Submitting Request...' : 'Submit Refund Request'}
                       {!status && <ArrowRight />}
                    </button>
                    <p className="text-center text-xs font-bold text-slate-400 mt-4 uppercase tracking-wider">
                       Secure & Encrypted Submission
                    </p>
                 </motion.div>
               )}
            </AnimatePresence>
          </form>
        )}
      </div>
    </div>
  );
}
