import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query } from 'firebase/firestore';
import { Target } from 'lucide-react';

export default function FrontendAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnn = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'announcements')));
        const valid = snap.docs.map(d => d.data()).filter(a => a.isActive);
        setAnnouncements(valid);
      } catch (e) {
        // ignore
      }
    };
    fetchAnn();
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2 overflow-hidden flex whitespace-nowrap w-full select-none z-40">
       <div className="animate-marquee inline-block whitespace-nowrap">
          {announcements.map((a, i) => (
             <span key={i} className="mx-8 font-medium text-sm flex-inline items-center gap-2">
                <Target size={14} className="inline text-red-500 mr-2" />
                {a.text}
             </span>
          ))}
          {/* duplicate for seamless loop */}
          {announcements.map((a, i) => (
             <span key={`dup-${i}`} className="mx-8 font-medium text-sm flex-inline items-center gap-2">
                <Target size={14} className="inline text-red-500 mr-2" />
                {a.text}
             </span>
          ))}
       </div>
    </div>
  );
}
