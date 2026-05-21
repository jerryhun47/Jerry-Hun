import React, { useState, useEffect } from 'react';
import { Play, Flame, Rocket, Wrench, Trophy, GraduationCap, DollarSign, CheckCircle, Star, Target, Video, Settings, Send, Quote, ArrowRight, ShoppingCart, ShieldCheck, Tag, Upload, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Reviews System
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', city: '', text: '', rating: 5, image: '' });
  const [reviewSubmitStatus, setReviewSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeProducts: any = null;
    let unsubscribeReviews: any = null;
    let unsubscribeBanners: any = null;

    const fetchTopProducts = () => {
      const q = query(collection(db, 'products'));
      unsubscribeProducts = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const prods: any[] = [];
        querySnapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() }));
        let activeProds = prods.filter((p: any) => p.is_active !== false && p.category !== 'Course');
        
        if (activeProds.length === 0) {
           activeProds = [
             { id: 't1', name: 'Premium Netflix Tool', description: 'Lifetime access to Premium accounts auto-generator.', price: 5000, category: 'Entertainment', is_active: true, badge: 'Hot', order_index: 0 },
             { id: 't2', name: 'Canva Pro Tool', description: 'Unlimited Canva Pro features unlocked.', price: 3000, category: 'Design', is_active: true, order_index: 1 }
           ];
        }

        activeProds.sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));
        setTopProducts(activeProds.slice(0, 4));
        setLoadingProducts(false);
      }, (err) => {
        console.error("Error fetching top products", err);
        setTopProducts([
           { id: 't1', name: 'Premium Netflix Tool', description: 'Lifetime access to Premium accounts auto-generator.', price: 5000, category: 'Entertainment', is_active: true, badge: 'Hot' },
           { id: 't2', name: 'Canva Pro Tool', description: 'Unlimited Canva Pro features unlocked.', price: 3000, category: 'Design', is_active: true }
        ]);
        setLoadingProducts(false);
      });
    };

    const fetchReviews = () => {
      const q = query(collection(db, 'reviews'));
      unsubscribeReviews = onSnapshot(q, { includeMetadataChanges: true }, (querySnapshot) => {
        const fetchedReviews: any[] = [];
        querySnapshot.forEach(doc => {
          if (doc.data().approved !== false) {
             fetchedReviews.push({ id: doc.id, ...doc.data() });
          }
        });
        const defaultReviews = [
             { name: 'Ali Raza', city: 'Lahore', text: 'bhai zabardast tool hai, highly recommended 💯', rating: 5, time: '1 min ago' },
             { name: 'Usman Tariq', city: 'Karachi', text: 'service bht fast thi, great experience.', rating: 5, time: '2 mins ago' },
             { name: 'Zainab Bibi', city: 'Islamabad', text: 'meri automation bilkul set chal rahi hai ab.', rating: 5, time: '5 mins ago' },
             { name: 'Hamza Khan', city: 'Peshawar', text: 'best investment mene apni life me ki hai!', rating: 5, time: '15 mins ago' },
             { name: 'Bilal Ahmed', city: 'Multan', text: 'bht zbardast system bnaya hy jerry ne.', rating: 4, time: '1 hr ago' },
             { name: 'Ayesha Gul', city: 'Faisalabad', text: 'meri sales me 3x izafa hua hai in tools ki waja se.', rating: 5, time: '2 hrs ago' },
             { name: 'Fahad Qureshi', city: 'Rawalpindi', text: 'support system bht responsive hai.', rating: 5, time: '3 hrs ago' },
             { name: 'Omer Farooq', city: 'Quetta', text: 'worth every single penny. completely automated.', rating: 5, time: '3 hrs ago' },
             { name: 'Nida Azhar', city: 'Gujranwala', text: 'sab kuch as described mila. thank you jerry!', rating: 5, time: '5 hrs ago' },
             { name: 'Kashif Ali', city: 'Sialkot', text: 'pehle mjhe yakeen nahi aya, but results amazing hain.', rating: 5, time: '5 hrs ago' },
             { name: 'Saad Haroon', city: 'Bahawalpur', text: '100% working and reliable system', rating: 5, time: '8 hrs ago'},
             { name: 'Iqra Noor', city: 'Lahore', text: 'support team ne bht help ki. highly recommended.', rating: 5, time: '12 hrs ago'}
        ];
        setReviewsList([...fetchedReviews, ...defaultReviews]);
      }, (err) => {
        console.error("Error fetching reviews", err);
      });
    };

    fetchTopProducts();
    fetchReviews();
    
    unsubscribeBanners = onSnapshot(collection(db, 'banners'), (snap) => {
       setBanners(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });

    return () => {
      if (unsubscribeProducts) unsubscribeProducts();
      if (unsubscribeReviews) unsubscribeReviews();
      if (unsubscribeBanners) unsubscribeBanners();
    };
  }, []);

  useEffect(() => {
    if (reviewsList.length === 0) return;
    const interval = setInterval(() => {
       setCurrentReviewIndex(prev => (prev + 1) % reviewsList.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviewsList.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        is_read: false,
        createdAt: serverTimestamp()
      });
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setSubmitStatus('error');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitStatus('loading');
    try {
      await addDoc(collection(db, 'reviews'), {
        ...reviewForm,
        approved: false,
        createdAt: serverTimestamp()
      });
      setReviewSubmitStatus('success');
      setReviewForm({ name: '', city: '', text: '', rating: 5, image: '' });
      setTimeout(() => {
        setReviewSubmitStatus('idle');
        setShowReviewModal(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setReviewSubmitStatus('error');
    }
  };

  const handleReviewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewForm({...reviewForm, image: reader.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-50px" },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="w-full relative overflow-x-hidden font-sans bg-black">
      <FlashSaleBanner topProducts={topProducts} />
      <LivePurchasePopup topProducts={topProducts} />
      
      {banners.length > 0 && (
         <div className="relative w-full overflow-x-auto hide-scrollbar shrink-0 min-h-[100px] z-10 max-w-7xl mx-auto mt-4 px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4">
               {banners.map((b, i) => (
                  <img key={i} src={b.url} alt="Promo Banner" className="h-32 w-auto sm:h-48 md:h-64 object-cover rounded-3xl shrink-0 shadow-lg border border-slate-800" />
               ))}
            </div>
         </div>
      )}

      <div className="absolute top-0 left-0 w-full h-[150vh] overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 via-red-950/20 to-black z-0"></div>
        <NetworkBackground />
        <div className="hero-orb bg-red-600 w-96 h-96 top-0 left-10 mt-10 sm:mt-0 z-0"></div>
        <div className="hero-orb bg-red-500 w-96 h-96 top-40 right-10 animation-delay-2000 z-0"></div>
        <div className="hero-orb bg-red-800 w-96 h-96 -bottom-20 left-1/2 animation-delay-4000 z-0"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10 lg:pt-8 lg:pb-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-4 mb-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-red-500 border border-slate-800 text-xs md:text-sm font-semibold">
                <Flame size={16} /> Pakistan Top Tools Seller
              </div>
            </div>
            <h1 className="text-xl md:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4 lg:mb-6 text-white leading-tight">
              Jerry Automation - Best YouTube Automation & <span className="gradient-text">AI Tools Seller</span> in Pakistan
            </h1>
            <p className="text-sm md:text-lg text-slate-300 mb-6 lg:mb-8 max-w-xl space-y-4">
              Hi, I'm <strong className="text-white">Jerry</strong> — a YouTube Automation Expert. I teach you how to build a profitable YouTube channel without showing your face or working countless hours.<br/><br/>
              I am Jerry, a Pakistan-based most trusted tools seller. I have built the trust of 1500+ clients, Alhamdulillah, and I always strive to deliver positive results.
            </p>
            <div className="flex flex-wrap items-center gap-4 lg:gap-6 mb-8 lg:mb-10">
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">5000+</span>
                <span className="text-xs md:text-sm font-medium text-slate-400">Students</span>
              </div>
              <div className="w-px h-10 md:h-12 bg-slate-800"></div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">50+</span>
                <span className="text-xs md:text-sm font-medium text-slate-400">Channels</span>
              </div>
              <div className="w-px h-10 md:h-12 bg-slate-800 hidden sm:block"></div>
              <div className="flex flex-col">
                <span className="text-2xl md:text-3xl font-black text-white">$10K+</span>
                <span className="text-xs md:text-sm font-medium text-slate-400">Earnings</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4 max-w-[240px]">
              <Link to="/courses" className="bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30 text-sm">
                <Rocket size={18} /> Start Learning
              </Link>
              <Link to="/tools" className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-5 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-md">
                <Wrench size={18} /> Buy Tools
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-2 md:mt-0"
          >
            <div className="card-shadow glass-effect rounded-3xl p-6 relative z-10 border border-white/10 max-w-sm mx-auto flex flex-col items-center text-center">
                <div id="hero-logo-element" className="w-20 h-20 glass-effect bg-white/10 rounded-full flex items-center justify-center text-white mb-4 shadow-xl relative overflow-hidden p-3 border-white/20">
                   <div className="absolute inset-0 rounded-full border-4 border-red-500/20 animate-pulse z-10 pointer-events-none"></div>
                   <img src="/logo.png" alt="Jerry Automation Image" className="w-full h-full object-contain drop-shadow-md relative z-20" />
                </div>
                <h3 className="text-xl font-bold mb-1 text-white">Jerry <span className="text-red-500 font-extrabold hidden sm:inline">Automation</span></h3>
                <p className="text-slate-400 font-medium text-sm mb-4">Jerry – YouTube Automation Expert | Verified Seller</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={12} className="text-red-500" /> Verified</span>
                  <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={12} className="text-red-500" fill="currentColor" /> 5-Star</span>
                </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-12 border-y border-slate-900/50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
             <div>
               <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Top Products</span>
               <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 text-white">Automate Your Work</h2>
             </div>
             <Link to="/tools" className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 rounded-full font-bold transition-all w-fit shrink-0 hover:scale-105">
               View More <ArrowRight size={18} className="text-red-500" />
             </Link>
           </motion.div>
           
           <div className="relative group/slider">
             <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-8 card-shadow w-full">
               <div className="grid grid-cols-2 gap-4 sm:gap-6">
               {loadingProducts ? (
                 [1, 2, 3, 4].map(i => (
                   <div key={i} className="w-full aspect-square shrink-0 bg-slate-900 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col animate-pulse opacity-100">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-800 rounded-xl mb-4"></div>
                      <div className="w-16 h-3 bg-slate-800 rounded mb-2"></div>
                      <div className="w-3/4 h-5 sm:h-6 bg-slate-800 rounded mb-4"></div>
                      <div className="w-full h-3 bg-slate-800 rounded mb-2"></div>
                      <div className="w-2/3 h-3 bg-slate-800 rounded mb-4 flex-1"></div>
                      <div className="flex justify-between items-end border-t border-slate-700 pt-3">
                         <div className="w-20 h-5 sm:h-6 bg-slate-800 rounded"></div>
                         <div className="w-10 h-10 bg-slate-800 rounded-xl"></div>
                      </div>
                   </div>
                 ))
               ) : topProducts.length > 0 ? topProducts.slice(0, 4).map(product => (
                  <motion.div variants={staggerItem} key={product.id} className="w-full aspect-square shrink-0 bg-slate-800 border border-slate-700 rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col relative group hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl hover:border-slate-600 transition-all duration-300 opacity-100">
                    {product.badge && <div className="absolute top-4 right-4 bg-slate-900 border border-slate-700 text-red-500 text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-full z-10">{product.badge}</div>}
                    
                    <img loading="lazy" src={product.logoBase64 || '/logo.png'} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png' }} alt={product.name} className="w-12 h-12 md:w-16 md:h-16 object-cover bg-white rounded-xl p-0.5 mb-4 shrink-0 transition-transform group-hover:scale-105 border border-slate-200" />

                    <div className="mb-2 sm:mb-4">
                      <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">{product.category}</span>
                      <h3 className="text-sm sm:text-lg font-bold mt-1 text-white group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">{product.name}</h3>
                    </div>
                    <p className="text-slate-300 text-xs sm:text-sm mb-4 flex-1 line-clamp-2 sm:line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto border-t border-slate-700 pt-3">
                      <div className="font-black text-sm sm:text-lg text-white">PKR {product.price.toLocaleString()}</div>
                      <Link to={`/tools?product=${product.id}`} className="bg-red-600 hover:bg-red-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:scale-110">
                         <ShoppingCart size={18} />
                      </Link>
                    </div>
                  </motion.div>
               )) : (
                 <div className="col-span-2 text-center text-slate-500 py-12">No products available at the moment.</div>
               )}
               </div>
             </motion.div>
           </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 bg-slate-900 border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-8 text-center">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">About Me</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl text-white font-black mt-2">Who Am I?</h2>
           </motion.div>
           
           <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 gap-4">
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:-translate-y-2 transition-transform duration-300">
                    <Trophy className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">Top Educator</h4>
                    <p className="text-sm text-slate-400">YouTube Automation Niche</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-950 border border-slate-800 transform md:translate-y-6 hover:-translate-y-2 transition-transform duration-300">
                    <GraduationCap className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">5000+ Students</h4>
                    <p className="text-sm text-slate-400">Successfully Trained</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:-translate-y-2 transition-transform duration-300">
                    <DollarSign className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">$10K+ Monthly</h4>
                    <p className="text-sm text-slate-400">Student Earnings</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-950 border border-slate-800 transform md:translate-y-6 hover:-translate-y-2 transition-transform duration-300">
                    <Wrench className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">Premium Tools</h4>
                    <p className="text-sm text-slate-400">Built for Automation</p>
                 </motion.div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.6 }}>
                <h3 className="text-2xl font-bold mb-4 text-white">My Journey — From Automation To Success</h3>
                <div className="space-y-4 text-slate-300 mb-8 leading-relaxed">
                  <p>I started <strong className="text-white">YouTube Automation</strong> in 2023, and now (Alhamdulillah) I have reached a stage where I am running 10 YouTube channels simultaneously. I have become one of <strong className="text-white">Pakistan’s cheapest and most reliable tools sellers</strong>, offering services with a <strong className="text-white">money-back guarantee</strong>.</p>
                </div>
                <a href="#services" className="inline-flex items-center gap-2 text-red-500 font-bold hover:text-red-400 border-b border-transparent hover:border-red-400 transition-all">
                  View My Services &rarr;
                </a>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Services/Process */}
      <section id="services" className="py-12 bg-slate-950 border-y border-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-12 text-center max-w-2xl mx-auto">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">YouTube Automation</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-4 text-white">What Do I Teach?</h2>
             <p className="text-slate-400">A complete A to Z YouTube Automation system that will change your life</p>
           </motion.div>
           
           <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-4 gap-6">
              <motion.div variants={staggerItem} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 card-shadow text-center relative pointer-events-none md:pointer-events-auto hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Target /></div>
                 <h3 className="font-bold mb-2 text-white">01. Niche Selection</h3>
                 <p className="text-sm text-slate-400">Find profitable niches and analyze the competition effectively</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Video /></div>
                 <h3 className="font-bold mb-2 text-white">02. Content System</h3>
                 <p className="text-sm text-slate-400">Create content using AI tools without ever showing your face</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Settings /></div>
                 <h3 className="font-bold mb-2 text-white">03. Full Automation</h3>
                 <p className="text-sm text-slate-400">Master upload scheduling, SEO optimization, and channel growth</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-950 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><DollarSign /></div>
                 <h3 className="font-bold mb-2 text-white">04. Monetization</h3>
                 <p className="text-sm text-slate-400">Learn AdSense, sponsorships, and multiple income streams</p>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* Cards Sections */}
      <section className="py-12 bg-slate-900/40 backdrop-blur-sm border-y border-slate-800 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid md:grid-cols-2 gap-8">
              {/* Affordable */}
              <motion.div {...fadeUp} className="bg-slate-950 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition flex flex-col items-center text-center card-shadow">
                 <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
                    <Tag size={32} />
                 </div>
                 <h2 className="text-2xl font-black mb-4 text-white">Why Our Tools Are So Affordable</h2>
                 <p className="text-slate-400 leading-relaxed max-w-lg">
                   We purchase tools using international cards, which allows us to offer them at lower prices. That's why we provide a full money-back guarantee.
                 </p>
              </motion.div>

              {/* Warranty */}
              <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-slate-950 border border-slate-800 rounded-3xl p-8 hover:border-slate-700 transition flex flex-col items-center text-center card-shadow">
                 <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-red-500/10">
                    <ShieldCheck size={32} />
                 </div>
                 <h2 className="text-2xl font-black mb-4 text-white">Warranty Policy</h2>
                 <p className="text-slate-400 leading-relaxed max-w-lg">
                   All our tools come with money-back and exchange warranty matching the duration of your purchase. For instance, a 1-month purchase grants a 1-month warranty.
                 </p>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Client Reviews Section (Slider) */}
      <section className="py-16 bg-slate-950 border-y border-slate-800 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-10 text-center">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Success Stories</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-8 text-white">Client Reviews</h2>

             {/* Main Review Image Embed */}
             <div className="max-w-4xl mx-auto mb-10 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 pointer-events-none select-none">
                <img 
                  src="https://drive.google.com/uc?export=view&id=1xbrRWRazzjYJGYkcQArPJBEVxrJOzbgc" 
                  alt="Client Review"
                  className="w-full h-auto object-contain bg-slate-900 pointer-events-none select-none"
                  draggable={false}
                />
             </div>

             <button onClick={() => setShowReviewModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full font-bold transition-all shadow-md text-sm mx-auto flex items-center gap-2">
                <Quote size={16} /> Post Review
             </button>
           </motion.div>
           
           {reviewsList.length > 0 && (
             <div className="relative w-full max-w-2xl mx-auto min-h-[300px] flex items-center justify-center">
               <AnimatePresence mode="wait">
                 <motion.div 
                    key={currentReviewIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.5 }}
                    className="bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800 card-shadow text-center w-full relative"
                 >
                    <Quote className="absolute top-6 left-6 text-slate-800 opacity-50" size={32} />
                    <div className="flex justify-center gap-1 mb-4">
                      {[...Array(reviewsList[currentReviewIndex].rating || 5)].map((_, j) => <Star key={j} size={16} className="text-red-500" fill="currentColor" />)}
                    </div>
                    
                    {reviewsList[currentReviewIndex].image && (
                       <div className="mb-4 flex justify-center">
                          <img src={reviewsList[currentReviewIndex].image} alt="Review" className="w-auto h-32 md:h-40 object-cover rounded-xl border border-slate-800 pointer-events-none select-none" />
                       </div>
                    )}
                    
                    <p className="text-slate-300 text-sm md:text-base mb-6 leading-relaxed">"{reviewsList[currentReviewIndex].text}"</p>
                    
                    <div>
                      <div className="flex justify-between items-center text-left">
                        <div>
                          <p className="font-bold text-white text-lg">{reviewsList[currentReviewIndex].name}</p>
                          <p className="text-xs font-medium text-slate-500">{reviewsList[currentReviewIndex].city}</p>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{reviewsList[currentReviewIndex].time || '10 mins ago'}</span>
                      </div>
                    </div>
                 </motion.div>
               </AnimatePresence>
             </div>
           )}
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
             <motion.div 
               initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
               className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 w-full max-w-md relative card-shadow max-h-[90vh] overflow-y-auto minimal-scrollbar"
             >
                <button onClick={() => setShowReviewModal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white p-2 bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
                <h3 className="text-2xl font-bold text-white mb-6">Post Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold mb-2 text-slate-300">Your Name *</label>
                     <input type="text" required value={reviewForm.name} onChange={e => setReviewForm({...reviewForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="Ali Raza" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-2 text-slate-300">City</label>
                     <input type="text" value={reviewForm.city} onChange={e => setReviewForm({...reviewForm, city: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="Lahore" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-2 text-slate-300">Review Text *</label>
                     <textarea required value={reviewForm.text} onChange={e => setReviewForm({...reviewForm, text: e.target.value})} rows={3} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500" placeholder="Great service..."></textarea>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-2 text-slate-300">Rating</label>
                     <input type="number" min="1" max="5" value={reviewForm.rating} onChange={e => setReviewForm({...reviewForm, rating: Number(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500" />
                   </div>
                   <div>
                     <label className="block text-sm font-semibold mb-2 text-slate-300">Upload Image (Optional, max 2MB)</label>
                     <input type="file" accept="image/*" onChange={handleReviewImageUpload} className="w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-500 transition-colors" />
                     {reviewForm.image && <img src={reviewForm.image} alt="Preview" className="h-16 mt-2 rounded border border-slate-800 object-cover" />}
                   </div>
                   <button disabled={reviewSubmitStatus === 'loading'} type="submit" className="w-full mt-4 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98]">
                      {reviewSubmitStatus === 'loading' ? 'Submitting...' : 'Submit Review'}
                   </button>
                   {reviewSubmitStatus === 'success' && <p className="text-green-500 text-center font-medium mt-2 text-sm">Review submitted! Awaiting approval.</p>}
                   {reviewSubmitStatus === 'error' && <p className="text-red-500 text-center font-medium mt-2 text-sm">Error submitting review.</p>}
                </form>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Section */}
      <section id="contact" className="py-12 relative bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16">
              <motion.div {...fadeUp}>
                 <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Get In Touch</span>
                 <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-6 text-white">Talk to Me</h2>
                 <p className="text-slate-400 mb-8 max-w-md">Have any questions? I'm here to help. Fill out the form and I will reply to you shortly.</p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-full flex items-center justify-center text-red-500">
                          <Send size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-white">Email</p>
                          <p className="text-slate-400">jerry@jerryautomation.com</p>
                       </div>
                    </div>
                 </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="card-shadow p-8 rounded-3xl bg-slate-950 border border-slate-800">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-semibold mb-2 text-slate-300">Your Name *</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow" placeholder="Ali Khan" />
                       </div>
                       <div>
                          <label className="block text-sm font-semibold mb-2 text-slate-300">Email *</label>
                          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow" placeholder="ali@email.com" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Phone Number</label>
                       <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow" placeholder="+92-3XX-XXXXXXX" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Subject *</label>
                       <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow">
                          <option value="">Select Subject</option>
                          <option value="course">Course Inquiry</option>
                          <option value="tools">Tools Purchase</option>
                          <option value="mentoring">Personal Mentoring</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Message *</label>
                       <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-1 focus:ring-red-500 transition-shadow" placeholder="Write your question here..."></textarea>
                    </div>
                    <button disabled={submitStatus === 'loading'} type="submit" className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-red-500/20 active:scale-[0.98]">
                       {submitStatus === 'loading' ? 'Sending...' : 'Send Message'}
                    </button>
                    {submitStatus === 'success' && <p className="text-green-500 text-center font-medium mt-2">Message sent successfully!</p>}
                    {submitStatus === 'error' && <p className="text-red-500 text-center font-medium mt-2">Error sending message. Please try again.</p>}
                 </form>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Social Links / Connect With Us */}
      <section className="py-8 bg-slate-950 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
           <div className="flex items-center gap-6">
              <a href="https://www.tiktok.com/@jerryofficial471?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-3 rounded-full transition border border-slate-800 hover:border-slate-600 shadow-md">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" /></svg>
              </a>
              <a href="https://www.youtube.com/@jerryofficial1121" target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-slate-800 text-red-500 p-3 rounded-full transition border border-slate-800 hover:border-red-500 shadow-md">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a href="https://whatsapp.com/channel/0029Vb7nPWkCXC3Sg6n05b1i" target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-slate-800 text-green-500 p-3 rounded-full transition border border-slate-800 hover:border-green-500 shadow-md">
                 <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>
              </a>
           </div>
        </div>
      </section>

    </div>
  );
}

function NetworkBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: any[] = [];
    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      const count = Math.min(width * height / 15000, 80);
      for(let i=0; i<count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2 + 1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.1)';
      
      for(let i=0; i<particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if(p.x < 0 || p.x > width) p.vx *= -1;
        if(p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for(let j=i+1; j<particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if(dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    init();
    draw();
    window.addEventListener('resize', init);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', init);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50 z-0" />;
}

function FlashSaleBanner({ topProducts }: { topProducts: any[] }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 0, seconds: 0 });
  const [product, setProduct] = useState<any>({ name: 'Premium Automation Toolkit' });
  const [discount, setDiscount] = useState("35% OFF");

  useEffect(() => {
    if (topProducts && topProducts.length > 0) {
      setProduct(topProducts[Math.floor(Math.random() * topProducts.length)]);
      setDiscount(`${Math.floor(Math.random() * 30 + 20)}% OFF`);
    }
  }, [topProducts]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let h = prev.hours, m = prev.minutes, s = prev.seconds;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 11; m = 0; s = 0; }
        return { hours: h, minutes: m, seconds: s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-red-600 w-full text-white py-2 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 z-40 relative shadow-md">
      <div className="flex items-center gap-2 text-sm font-bold">
        <Flame size={16} className="text-yellow-300 animate-pulse" /> 
        <span>Limited Offer – {String(timeLeft.hours).padStart(2,'0')}:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')} Remaining</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold truncate max-w-[150px]">{product.name}</span>
        <span className="bg-white text-red-600 text-xs font-black px-2 py-0.5 rounded-full">{discount}</span>
        <Link to={`/tools${product.id ? `?product=${product.id}` : ''}`} className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-slate-800 transition-colors">
          Buy Now
        </Link>
      </div>
    </div>
  );
}

function LivePurchasePopup({ topProducts }: { topProducts: any[] }) {
  const [popup, setPopup] = useState<any>(null);

  const names = ["Ali", "Usman", "Hamza", "Ayesha", "Zain", "Bilal", "Fatima", "Omer", "Kashif", "Sana", "Fahad", "Nida", "Iqra", "Saad"];
  const cities = ["Karachi", "Lahore", "Islamabad", "Peshawar", "Quetta", "Multan", "Faisalabad", "Rawalpindi", "Gujranwala", "Sialkot"];

  useEffect(() => {
    // We can show popup immediately even if topProducts is not loaded yet using fallback
    const showRandomPopup = () => {
      const pName = topProducts.length > 0 
        ? topProducts[Math.floor(Math.random() * topProducts.length)].name 
        : 'Premium Netflix Tool';

      setPopup({
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        product: pName
      });

      // hide after 3 seconds
      setTimeout(() => setPopup(null), 3000);
    };

    const interval = setInterval(() => {
      showRandomPopup();
    }, 10000); // Check every 10 seconds
    
    // Initial popup
    setTimeout(showRandomPopup, 1000);

    return () => clearInterval(interval);
  }, [topProducts]);

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
           initial={{ opacity: 0, y: 20, x: -20 }}
           animate={{ opacity: 1, y: 0, x: 0 }}
           exit={{ opacity: 0, y: 20, x: -20 }}
           className="fixed bottom-4 left-4 z-[9999] bg-white border border-slate-200 shadow-2xl p-3 md:p-4 rounded-xl flex items-center gap-3 w-auto pr-6 pointer-events-none"
        >
          <div className="bg-green-100 text-green-600 p-2 md:p-3 rounded-full h-fit flex-shrink-0 flex items-center justify-center">
            <ShoppingCart size={18} />
          </div>
          <div>
            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wide mb-0.5">Live Order</p>
            <p className="text-xs md:text-sm text-slate-800 font-bold tracking-tight leading-snug whitespace-nowrap">
              {popup.name} from {popup.city} purchased <span className="text-red-600">{popup.product}</span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}