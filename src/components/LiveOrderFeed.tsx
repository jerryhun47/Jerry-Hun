import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function LiveOrderFeed() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(20));
        const snap = await getDocs(q);
        const fetchedOrders = snap.docs.map(doc => doc.data());
        if (fetchedOrders.length > 0) {
           setOrders(fetchedOrders);
        }
      } catch(e) {
        console.error('Failed to fetch recent orders', e);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    // Show every 10 sec, display for 3 sec
    const cycle = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        setCurrentIndex((prev) => (prev + 1) % orders.length);
      }, 3000); // 3 seconds visible
    }, 10000); // 10 seconds interval

    return () => clearInterval(cycle);
  }, [orders]);

  return (
    <AnimatePresence>
      {isVisible && orders.length > 0 && (
        <motion.div
           initial={{ opacity: 0, y: 50, x: -20, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
           exit={{ opacity: 0, y: 20, scale: 0.95 }}
           className="fixed bottom-4 sm:bottom-6 left-4 sm:left-6 bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl p-3 sm:p-4 z-40 flex items-center gap-3 md:gap-4 max-w-[280px] sm:max-w-xs cursor-default"
        >
           <div className="bg-green-500/10 p-2 sm:p-3 rounded-xl border border-green-500/20 shrink-0">
             <ShoppingBag size={20} className="text-green-500" />
           </div>
           <div className="flex-1">
             <p className="text-xs sm:text-sm text-slate-300 font-medium leading-snug">
               <strong className="text-white">{orders[currentIndex].customer_name || 'Someone'}</strong> from <strong className="text-white">{orders[currentIndex].city || 'Pakistan'}</strong> purchased
             </p>
             <p className="text-xs sm:text-sm text-red-400 font-bold mt-0.5 line-clamp-1">
               {orders[currentIndex].product_names?.[0] || 'a Premium Tool'}
             </p>
             <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Just now</p>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
