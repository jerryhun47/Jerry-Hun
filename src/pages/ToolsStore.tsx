import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [cart, setCart] = useState<{product: Product, quantity: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.is_active !== false) {
           prods.push({ id: doc.id, ...data } as Product);
        }
      });
      setProducts(prods);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

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
        <div className="flex flex-col lg:flex-row gap-8">
          
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
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div></div>
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
                        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 card-shadow flex flex-col relative overflow-hidden group hover:border-slate-700 transition-colors"
                      >
                        {product.badge && <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 text-red-400 text-xs font-bold px-3 py-1 rounded-full">{product.badge}</div>}
                        <div className="mb-4">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.category}</span>
                          <h3 className="text-xl font-bold mt-1 text-white group-hover:text-red-400 transition-colors">{product.name}</h3>
                        </div>
                        <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">{product.description}</p>
                        <div className="flex items-center justify-between mt-auto">
                          <div className="font-black text-2xl text-white">PKR {product.price.toLocaleString()}</div>
                          <button onClick={() => addToCart(product)} className="bg-red-600 hover:bg-red-500 cursor-pointer text-white p-3 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-95 group-hover:scale-110">
                             <ShoppingCart size={20} />
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

          {/* Sidebar Cart */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="w-full lg:w-96"
          >
            <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden sticky top-24">
              <div className="bg-black text-white p-6 border-b border-slate-800">
                <h3 className="font-bold flex items-center gap-2 text-lg"><ShoppingCart className="text-red-500"/> Your Cart</h3>
              </div>
              <div className="p-6">
                 {cart.length === 0 ? (
                   <div className="text-center py-8 text-slate-500">
                     <ShoppingCart size={40} className="mx-auto mb-4 opacity-50 text-slate-600" />
                     <p>Your cart is empty</p>
                   </div>
                 ) : (
                   <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                     <AnimatePresence>
                       {cart.map((item, idx) => (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           exit={{ opacity: 0, height: 0 }}
                           key={idx} 
                           className="flex justify-between items-center border-b border-slate-800 pb-4"
                         >
                           <div>
                             <p className="font-bold text-sm text-white">{item.product.name}</p>
                             <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                           </div>
                           <p className="font-bold text-white">PKR {(item.product.price * item.quantity).toLocaleString()}</p>
                         </motion.div>
                       ))}
                     </AnimatePresence>
                   </div>
                 )}
                 
                 <div className="border-t border-slate-800 pt-4 mb-6">
                   <div className="flex justify-between items-center font-black text-xl text-white">
                      <span>Total:</span>
                      <span>PKR {cartTotal.toLocaleString()}</span>
                   </div>
                 </div>

                 <button 
                   disabled={cart.length === 0}
                   onClick={() => setShowCheckout(true)}
                   className="w-full bg-red-600 disabled:opacity-50 hover:bg-red-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20 cursor-pointer active:scale-[0.98]"
                 >
                   Checkout &rarr;
                 </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <CheckoutModal cart={cart} cartTotal={cartTotal} onClose={() => setShowCheckout(false)} onClearCart={() => setCart([])} />
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckoutModal({ cart, cartTotal, onClose, onClearCart }: any) {
  const { user, signInWithGoogle } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  
  const [proofBase64, setProofBase64] = useState('');
  const [status, setStatus] = useState<'idle'|'uploading'|'success'|'error'>('idle');

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
        setProofBase64(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitProof = async () => {
    if (!proofBase64 || !user) return;
    setStatus('uploading');
    
    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userEmail: user.email,
        items: cart.map((item: any) => ({ id: item.product.id, name: item.product.name, price: item.product.price, quantity: item.quantity })),
        itemType: 'tool',
        price: cartTotal,
        proofBase64,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setStatus('success');
      onClearCart();
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
             <h3 className="text-2xl font-black mb-2 text-white">Payment Submitted!</h3>
             <p className="text-slate-400 mb-8">Your payment proof has been uploaded. An administrator will review and grant access to your account shortly.</p>
             <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-colors cursor-pointer">Close</button>
           </div>
         ) : !user ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 text-center">Login to Continue</h2>
            <p className="text-slate-400 text-center mb-6">You need an account to process your cart.</p>
            
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
           <>
              <h2 className="text-2xl font-bold text-white mb-1 text-center">Complete Payment</h2>
              <p className="text-slate-400 text-center mb-6">Checking out as <strong>{user.email}</strong></p>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                   <span className="text-slate-400">Order Summary</span>
                   <span className="text-white font-bold">{cart.length} item{cart.length > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-slate-400">Total Amount</span>
                   <span className="text-red-400 font-black text-xl">PKR {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 text-center mb-6">
                 <h3 className="font-bold text-white mb-4">Easypaisa Details</h3>
                 <div className="space-y-2 text-sm md:text-base">
                   <div className="flex justify-between border-b border-slate-700/50 pb-2"><span className="text-slate-400">Name:</span> <span className="font-bold text-white">Omar Hayat</span></div>
                   <div className="flex justify-between border-b border-slate-700/50 pb-2"><span className="text-slate-400">Number:</span> <span className="font-bold text-white">03272918229</span></div>
                   <div className="flex justify-between pt-1 flex-col sm:flex-row gap-1"><span className="text-slate-400 text-left">IBAN:</span> <span className="font-mono font-bold text-white text-right break-all">PK11TMFB0000000073111658</span></div>
                 </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-slate-300">Upload Payment Screenshot</label>
                <label className={`w-full border-2 border-dashed ${proofBase64 ? 'border-green-500 bg-green-500/10' : 'border-slate-700 hover:border-red-500 hover:bg-slate-800/50'} rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[120px]`}>
                   {proofBase64 ? (
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

              <button 
                disabled={!proofBase64 || status === 'uploading'} 
                onClick={handleSubmitProof}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-red-500/20 active:scale-[0.98]"
              >
                 {status === 'uploading' ? 'Submitting...' : 'Submit Payment Proof'}
              </button>
           </>
         )}
      </motion.div>
    </motion.div>
  )
}
