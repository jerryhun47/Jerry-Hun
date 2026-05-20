import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, onSnapshot } from 'firebase/firestore';
import { ShoppingCart, Search, Lock, CheckCircle, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthProvider';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  features: string[];
  badge?: string;
  is_active: boolean;
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
        setProducts(prods);
        setLoading(false);
      }, (error) => {
        console.error(error);
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
  });

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
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [proofBase64, setProofBase64] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'uploading' | 'success' | 'error'>('idle');
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

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
    fetchMethods();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('processing');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) {
            scaleSize = MAX_WIDTH / img.width;
          }
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.5);
          setProofBase64(compressedDataUrl);
          setStatus('idle');
        } catch (err) {
          // Fallback if canvas fails
          setProofBase64(dataUrl);
          setStatus('idle');
        }
      };
      img.onerror = () => {
        setProofBase64(dataUrl);
        setStatus('idle');
      };
      img.src = dataUrl;
    };
    reader.onerror = () => setStatus('idle');
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofBase64 || !email || !name || !phone) return;
    setStatus('uploading');
    
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: 'guest',
        userName: name,
        userEmail: email,
        userPhone: phone,
        items: [{ id: product.id, name: product.name, price: product.price, quantity: 1 }],
        itemType: 'tool',
        price: product.price,
        proofBase64,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      // Notify Admin Email
      const adminEmailBody = `
        <div style="font-family: sans-serif;">
          <h2 style="color: #ef4444;">New Order Placed!</h2>
          <p><strong>Item:</strong> ${product.name}</p>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Price:</strong> PKR ${product.price}</p>
          <p>Please check the admin dashboard to approve the transaction and view the payment screenshot.</p>
        </div>
      `;
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'Contact@jerryautomation.com',
            subject: 'New Order: ' + product.name,
            body: adminEmailBody
          })
        });
      } catch (e) {
        console.error("Failed to notify admin via email", e);
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
             <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} /></div>
             <h3 className="text-2xl font-black mb-2 text-white">Success!</h3>
             <p className="text-slate-400 mb-8">Your order has been submitted successfully. An administrator will review and send access details to your email shortly.</p>
             <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer">Close</button>
           </div>
         ) : (
           <>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Complete Payment</h2>
              
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-400">Buying</span>
                   <span className="text-white font-bold text-right">{product.name}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2 mt-2">
                   <span className="text-slate-400">Total Amount</span>
                   <span className="text-red-400 font-black text-xl">PKR {product.price.toLocaleString()}</span>
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

              {status === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg p-3 text-sm mb-4">
                   Error placing order. Please try again.
                </div>
              )}

              <button 
                disabled={!proofBase64 || !name || !email || !phone || status === 'uploading' || status === 'processing'} 
                onClick={handleSubmitProof}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98] cursor-pointer"
              >
                 {status === 'uploading' ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
           </>
         )}
      </motion.div>
    </motion.div>
  )
}
