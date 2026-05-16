import React, { useState, useEffect } from 'react';
import { Play, Flame, Rocket, Wrench, Trophy, GraduationCap, DollarSign, CheckCircle, Star, Target, Video, Settings, Send, Quote, ArrowRight, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, getDocs, query } from 'firebase/firestore';
import { motion } from 'motion/react';

export default function Home() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const q = query(collection(db, 'products'));
        const querySnapshot = await getDocs(q);
        const prods: any[] = [];
        querySnapshot.forEach((doc) => prods.push({ id: doc.id, ...doc.data() }));
        const activeProds = prods.filter((p: any) => p.is_active !== false);
        // Shuffle the array
        for (let i = activeProds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [activeProds[i], activeProds[j]] = [activeProds[j], activeProds[i]];
        }
        setTopProducts(activeProds.slice(0, 4));
      } catch(err) {
        console.error("Error fetching top products", err);
      }
    };
    fetchTopProducts();
  }, []);

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
  }

  const reviews = [
    { name: 'Ali Raza', city: 'Lahore', text: 'Amazing course, I started earning within two months!', rating: 5, image: 'https://drive.google.com/uc?export=view&id=1YOI7BymQe8anBO2KSZDQba7Y7kUTf3ak' },
    { name: 'Usman Tariq', city: 'Karachi', text: 'Jerrys tools are very easy to use for automation.', rating: 5 },
    { name: 'Hamza Bilal', city: 'Islamabad', text: 'Got my first $1k month thanks to the strategies taught.', rating: 5 },
    { name: 'Zohaib Khan', city: 'Peshawar', text: 'Best investment I made for my YouTube journey.', rating: 5 },
    { name: 'Saad Ahmed', city: 'Faisalabad', text: 'Highly recommend to anyone looking for passive income.', rating: 5 },
  ];

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
    <div className="w-full relative overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-full h-[80vh] overflow-hidden -z-10">
        <div className="hero-orb bg-red-600 w-96 h-96 top-0 left-10 mt-10 sm:mt-0"></div>
        <div className="hero-orb bg-red-500 w-96 h-96 top-40 right-10 animation-delay-2000"></div>
        <div className="hero-orb bg-red-800 w-96 h-96 -bottom-20 left-1/2 animation-delay-4000"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="flex items-center gap-4 mb-4 lg:mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-red-500 border border-slate-800 text-xs md:text-sm font-semibold">
                <Flame size={16} /> Pakistan's #1 YouTube Automation Educator
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 lg:mb-6 text-white leading-tight">
              Build Your <br/><span className="gradient-text">YouTube Empire</span><br/>
              On Complete <span className="gradient-text">Autopilot</span>
            </h1>
            <p className="text-sm md:text-lg text-slate-300 mb-6 lg:mb-8 max-w-xl">
              Hi, I'm <strong className="text-white">Jerry</strong> — a YouTube Automation Expert. I teach you how to build a profitable YouTube channel without showing your face or working countless hours.
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
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <a href="#services" className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/30">
                <Rocket size={18} /> Start Learning
              </a>
              <Link to="/tools" className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-6 py-3 md:px-8 md:py-4 rounded-full font-bold flex items-center justify-center gap-2 transition-all">
                <Wrench size={18} /> Explore Tools
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            whileInView={{ opacity: 1, scale: 1 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mt-8 md:mt-0"
          >
            <div className="card-shadow glass-effect rounded-3xl p-6 md:p-8 relative z-10 border border-white/10">
              <div className="flex flex-col items-center text-center">
                <h3 className="text-xl md:text-2xl font-bold mb-1 text-white">Jerry <span className="text-red-500 font-extrabold hidden sm:inline">Automation</span></h3>
                <p className="text-slate-400 font-medium text-sm md:text-base mb-1">YouTube Automation Expert</p>
                <p className="text-red-400 font-bold text-xs md:text-sm mb-4 max-w-[200px] leading-tight">Pakistan's #1 Tools Seller & Trusted by 1500+ People</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><CheckCircle size={14} className="text-red-500" /> Verified Educator</span>
                  <span className="bg-slate-950/80 border border-slate-800 text-slate-300 text-[10px] md:text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1"><Star size={14} className="text-red-500" fill="currentColor" /> 5-Star Rated</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 border-y border-slate-900/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-16 text-center">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">About Me</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl text-white font-black mt-2">Who Am I?</h2>
           </motion.div>
           
           <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-2 gap-4">
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:-translate-y-2 transition-transform duration-300">
                    <Trophy className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">Top Educator</h4>
                    <p className="text-sm text-slate-400">YouTube Automation Niche</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-900 border border-slate-800 transform md:translate-y-6 hover:-translate-y-2 transition-transform duration-300">
                    <GraduationCap className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">5000+ Students</h4>
                    <p className="text-sm text-slate-400">Successfully Trained</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:-translate-y-2 transition-transform duration-300">
                    <DollarSign className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">$10K+ Monthly</h4>
                    <p className="text-sm text-slate-400">Student Earnings</p>
                 </motion.div>
                 <motion.div variants={staggerItem} className="card-shadow p-6 rounded-2xl bg-slate-900 border border-slate-800 transform md:translate-y-6 hover:-translate-y-2 transition-transform duration-300">
                    <Wrench className="text-red-500 mb-4" size={32} />
                    <h4 className="font-bold text-white">Premium Tools</h4>
                    <p className="text-sm text-slate-400">Built for Automation</p>
                 </motion.div>
              </motion.div>
              <motion.div {...fadeUp} transition={{ delay: 0.3, duration: 0.6 }}>
                <h3 className="text-2xl font-bold mb-4 text-white">My Journey — From Automation To Success</h3>
                <div className="space-y-4 text-slate-300 mb-8 leading-relaxed">
                  <p>I am <strong className="text-white">Jerry</strong>, Pakistan's leading YouTube Automation educator. With over 5 years of experience in YouTube automation, I started from scratch and built a system that runs on its own.</p>
                  <p>I noticed many people want to earn from YouTube but don't know where to start. That's why I decided to share my knowledge and give you the very shortcuts I discovered over the years.</p>
                  <p>My <strong className="text-white">tools</strong> and courses are designed specifically for upcoming YouTubers to be affordable, highly effective, and results-driven.</p>
                </div>
                <a href="#services" className="inline-flex items-center gap-2 text-red-500 font-bold hover:text-red-400 border-b border-transparent hover:border-red-400 transition-all">
                  View My Services &rarr;
                </a>
              </motion.div>
           </div>
        </div>
      </section>

      {/* Services/Process */}
      <section id="services" className="py-20 bg-slate-900/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-16 text-center max-w-2xl mx-auto">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">YouTube Automation</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-4 text-white">What Do I Teach?</h2>
             <p className="text-slate-400">A complete A to Z YouTube Automation system that will change your life</p>
           </motion.div>
           
           <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-4 gap-6 mb-16">
              <motion.div variants={staggerItem} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 card-shadow text-center relative pointer-events-none md:pointer-events-auto hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Target /></div>
                 <h3 className="font-bold mb-2 text-white">01. Niche Selection</h3>
                 <p className="text-sm text-slate-400">Find profitable niches and analyze the competition effectively</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Video /></div>
                 <h3 className="font-bold mb-2 text-white">02. Content System</h3>
                 <p className="text-sm text-slate-400">Create content using AI tools without ever showing your face</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><Settings /></div>
                 <h3 className="font-bold mb-2 text-white">03. Full Automation</h3>
                 <p className="text-sm text-slate-400">Master upload scheduling, SEO optimization, and channel growth</p>
              </motion.div>
              <motion.div variants={staggerItem} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 card-shadow text-center hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-12 h-12 bg-slate-900 border border-slate-800 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><DollarSign /></div>
                 <h3 className="font-bold mb-2 text-white">04. Monetization</h3>
                 <p className="text-sm text-slate-400">Learn AdSense, sponsorships, and multiple income streams</p>
              </motion.div>
           </motion.div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-20 border-y border-slate-900/50 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
             <div>
               <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Top Products</span>
               <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 text-white">Automate Your Work</h2>
             </div>
             <Link to="/tools" className="inline-flex items-center gap-2 text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-6 py-3 rounded-full font-bold transition-all w-fit shrink-0 hover:scale-105">
               View More <ArrowRight size={18} className="text-red-500" />
             </Link>
           </motion.div>
           
           <div className="relative group/slider">
             <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 pb-8">
               {topProducts.length > 0 ? topProducts.map(product => (
                  <motion.div variants={staggerItem} key={product.id} className="w-full shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 card-shadow flex flex-col relative group hover:border-slate-700 transition-colors">
                    {product.badge && <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 text-red-400 text-xs font-bold px-3 py-1 rounded-full">{product.badge}</div>}
                    <div className="mb-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{product.category}</span>
                      <h3 className="text-lg font-bold mt-1 text-white group-hover:text-red-400 transition-colors">{product.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 flex-1 line-clamp-3">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="font-black text-lg text-white">PKR {product.price.toLocaleString()}</div>
                      <Link to={`/tools?product=${product.id}`} className="bg-red-600 hover:bg-red-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 hover:scale-110">
                         <ShoppingCart size={18} />
                      </Link>
                    </div>
                  </motion.div>
               )) : (
                 [1, 2, 3, 4].map(i => (
                   <div key={i} className="w-full shrink-0 bg-slate-900 border border-slate-800 rounded-3xl p-6 h-64 animate-pulse"></div>
                 ))
               )}
             </motion.div>
           </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-slate-900/40 backdrop-blur-sm border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <motion.div {...fadeUp} className="mb-12 text-center">
             <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Success Stories</span>
             <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-4 text-white">Student Reviews</h2>
             <p className="text-slate-400">Trusted by creators from all over the country</p>
           </motion.div>
           <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {reviews.map((review, i) => (
                <motion.div variants={staggerItem} key={i} className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative hover:-translate-y-2 transition-transform duration-300">
                   <Quote className="absolute top-6 right-6 text-slate-800" size={32} />
                   <div className="flex gap-1 mb-4">
                     {[...Array(review.rating)].map((_, j) => <Star key={j} size={16} className="text-red-500" fill="currentColor" />)}
                   </div>
                   <p className="text-slate-300 text-sm mb-6 relative z-10 leading-relaxed">"{review.text}"</p>
                   {review.image && (
                      <div className="mb-6 rounded-lg overflow-hidden border border-slate-800">
                         <img src={review.image} alt="Review attachment" className="w-full h-auto object-cover" />
                      </div>
                   )}
                   <div className="border-t border-slate-800 pt-4 mt-auto">
                      <p className="font-bold text-white flex items-center justify-between">
                         {review.name}
                         <span className="text-xs font-medium text-slate-500 bg-slate-950 border border-slate-800 px-2 py-1 rounded">{review.city}</span>
                      </p>
                   </div>
                </motion.div>
             ))}
           </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid lg:grid-cols-2 gap-16">
              <motion.div {...fadeUp}>
                 <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Get In Touch</span>
                 <h2 className="text-2xl md:text-3xl lg:text-5xl font-black mt-2 mb-6 text-white">Talk to Me</h2>
                 <p className="text-slate-400 mb-8 max-w-md">Have any questions? I'm here to help. Fill out the form and I will reply to you shortly.</p>
                 
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-red-500">
                          <Send size={24} />
                       </div>
                       <div>
                          <p className="font-bold text-white">Email</p>
                          <p className="text-slate-400">jerry@jerryautomation.com</p>
                       </div>
                    </div>
                 </div>
              </motion.div>

              <motion.div {...fadeUp} transition={{ delay: 0.2, duration: 0.6 }} className="card-shadow p-8 rounded-3xl bg-slate-900 border border-slate-800">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                       <div>
                          <label className="block text-sm font-semibold mb-2 text-slate-300">Your Name *</label>
                          <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow" placeholder="Ali Khan" />
                       </div>
                       <div>
                          <label className="block text-sm font-semibold mb-2 text-slate-300">Email *</label>
                          <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow" placeholder="ali@email.com" />
                       </div>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Phone Number</label>
                       <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow" placeholder="+92-3XX-XXXXXXX" />
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Subject *</label>
                       <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow">
                          <option value="">Select Subject</option>
                          <option value="course">Course Inquiry</option>
                          <option value="tools">Tools Purchase</option>
                          <option value="mentoring">Personal Mentoring</option>
                          <option value="other">Other</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-sm font-semibold mb-2 text-slate-300">Message *</label>
                       <textarea required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={4} className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow" placeholder="Write your question here..."></textarea>
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

    </div>
  );
}
