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
    fullName: '',
    email: '',
    accountNumber: '',
    accountName: '',
    receiveMethod: 'Easypaisa',
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedData, setSubmittedData] = useState<{accountNumber: string, accountName: string} | null>(null);

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

    if (!formData.fullName || !formData.email || !formData.accountNumber || !formData.accountName || !formData.receiveMethod) {
      setErrorMsg("Please fill in all required fields (Full Name, Email, Account Number, Account Holder Name, Payment Method).");
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
        fullName: formData.fullName,
        email: formData.email,
        accountNumber: formData.accountNumber,
        name: formData.accountName,
        receiveMethod: formData.receiveMethod,
        timestamp: serverTimestamp()
      });
      
      const { getRefundEmailTemplate } = await import('../lib/emailTemplate');
      const emailHtmlBody = getRefundEmailTemplate({
        customerName: formData.fullName,
        itemName: selectedProduct.name,
        totalPrice: selectedProduct.price || 0,
        status: 'UNDER REVIEW',
        refundMethod: formData.receiveMethod,
        accountNumber: formData.accountNumber,
        accountTitle: formData.accountName
      });

      // Send to Customer
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          subject: "Refund Request Received - Jerry Automation",
          body: emailHtmlBody
        })
      }).catch(err => console.error("Failed to send refund email", err));

      // Send to Admin
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'jerryhun47@gmail.com',
          subject: `New Refund Request: ${formData.fullName} - ${selectedProduct.name}`,
          body: emailHtmlBody
        })
      }).catch(err => console.error("Failed to notify admin of refund request", err));

      setSubmittedData({
        accountNumber: formData.accountNumber,
        accountName: formData.accountName
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
        {status === 'success' && submittedData ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl text-center">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
             </div>
             <h2 className="text-xl font-black text-slate-900 mb-4">Refund Request Submitted</h2>
             <div className="text-slate-800 font-medium leading-relaxed text-sm space-y-4">
               <p>Your refund request has been submitted successfully.</p>
               <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-200">
                 <p className="mb-1"><span className="text-slate-500">Account Number:</span> <strong className="text-slate-900">{submittedData.accountNumber}</strong></p>
                 <p><span className="text-slate-500">Account Name:</span> <strong className="text-slate-900">{submittedData.accountName}</strong></p>
               </div>
               <p>We will process your refund within 24 to 48 hours.</p>
               <p className="text-slate-600 text-xs bg-blue-50 text-blue-800 p-3 rounded-lg border border-blue-100">
                 A confirmation email has just been sent to your email address.<br/>
                 Please check your inbox or spam folder.
               </p>
               <p><strong className="text-red-600 font-bold inline-block">Please do not contact support repeatedly.</strong></p>
             </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div>
               <h1 className="text-2xl font-black text-slate-900 mb-2">Request a Refund</h1>
               <p className="text-slate-500 text-sm">Please fill out the form below. All fields with * are required.</p>
            </div>

            {status === 'error' && (
               <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-center gap-2 font-semibold text-sm">
                  <AlertCircle size={18} />
                  {errorMsg}
               </div>
            )}

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
               <input 
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  placeholder="Your Full Name"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-medium opacity-100"
               />
            </div>

            <div>
               <label className="block text-sm font-bold text-slate-700 mb-2">Email Address *</label>
               <input 
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="Your Email"
                  className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-400 placeholder:font-medium opacity-100"
               />
            </div>

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

            <div className="pt-4 border-t border-slate-100">
               <h3 className="text-sm font-bold text-slate-900 mb-4">Payment Method Details (Required)</h3>
               <div className="space-y-4">
                  <select 
                     required
                     value={formData.receiveMethod} onChange={e => setFormData({...formData, receiveMethod: e.target.value})}
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm bg-white opacity-100"
                  >
                     <option value="Easypaisa">Easypaisa</option>
                     <option value="JazzCash">JazzCash</option>
                     <option value="Bank Transfer">Bank Transfer</option>
                     <option value="Card">Card</option>
                  </select>
                  
                  <input 
                     type="text" required value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                     placeholder="Account Number *"
                  />
                  <input 
                     type="text" required value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})}
                     className="w-full border-2 border-slate-200 rounded-xl px-4 py-2 focus:border-red-500 outline-none transition-all font-bold text-slate-900 text-sm placeholder:text-slate-500 placeholder:font-medium opacity-100"
                     placeholder="Account Holder Name *"
                  />
               </div>
            </div>

            <button 
               disabled={status === 'loading'}
               type="submit" 
               className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-70 disabled:pointer-events-none mt-2"
            >
               {status === 'loading' ? 'Submitting...' : 'Submit Request'}
               {status !== 'loading' && <ArrowRight size={16} />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
