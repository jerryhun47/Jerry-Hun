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
           className="fixed bottom-[80px] left-[10px] z-[9999]"
        >
           <div className="bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3 md:gap-4 max-w-[280px] sm:max-w-xs cursor-default">
             <div className="bg-slate-100 p-2 sm:p-3 rounded-xl border border-slate-200 shrink-0">
               <ShoppingBag size={20} className="text-slate-600" />
             </div>
             <div className="flex-1">
               <p className="text-xs sm:text-sm text-slate-900 font-medium leading-snug">
                 Someone from <strong className="text-slate-900">{orders[currentIndex].city || 'your area'}</strong> purchased
               </p>
               <p className="text-xs sm:text-sm text-slate-900 font-bold mt-0.5 line-clamp-1">
                 {orders[currentIndex].product_names?.[0] || 'a Product'}
               </p>
             </div>
           </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
