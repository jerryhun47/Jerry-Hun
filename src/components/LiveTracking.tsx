import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function LiveTracking() {
  const location = useLocation();

  useEffect(() => {
    // Only track if not in admin area to avoid noise
    if (location.pathname.startsWith('/admin')) return;

    let sessionId = sessionStorage.getItem('sid');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('sid', sessionId);
    }

    const trackVisit = async () => {
      try {
        let city = 'Unknown';
        let ip = 'Unknown';
        try {
          const res = await fetch('https://freeipapi.com/api/json/');
          const data = await res.json();
          city = data.cityName || 'Unknown';
          ip = data.ipAddress || 'Unknown';
        } catch (e) {}

        const isMobile = /Mobi|Android/i.test(navigator.userAgent);
        
        await addDoc(collection(db, 'tracking_logs'), {
          path: location.pathname,
          sessionId,
          city,
          ip,
          device: isMobile ? 'Mobile' : 'Desktop',
          userAgent: navigator.userAgent,
          timestamp: serverTimestamp()
        });
      } catch (err) {
        console.error('Tracking failed', err);
      }
    };

    trackVisit();
  }, [location.pathname]);

  return null;
}
