import React, { useState, useEffect } from 'react';
import { Target } from 'lucide-react';
import { getCachedAnnouncements } from '../lib/cacheService';

export default function FrontendAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    getCachedAnnouncements().then((data) => {
      setAnnouncements(data);
    }).catch(() => {});
  }, []);

  if (announcements.length === 0) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2 overflow-hidden flex whitespace-nowrap w-full select-none z-40">
       <div className="animate-marquee inline-block whitespace-nowrap">
          {announcements.map((a, i) => (
             <span key={i} className="mx-8 font-medium text-sm flex-inline items-center gap-2">
                <Target size={14} className="inline text-primary-500 mr-2" />
                {a.text}
             </span>
          ))}
          {/* duplicate for seamless loop */}
          {announcements.map((a, i) => (
             <span key={`dup-${i}`} className="mx-8 font-medium text-sm flex-inline items-center gap-2">
                <Target size={14} className="inline text-primary-500 mr-2" />
                {a.text}
             </span>
          ))}
       </div>
    </div>
  );
}
