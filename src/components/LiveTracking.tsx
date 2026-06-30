import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getCityFromIP, getDeviceDetails } from '../lib/tracking';

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
        const city = await getCityFromIP();
        const { type, model } = getDeviceDetails();
        
        const newLogRef = doc(collection(db, 'tracking_logs'));
        await setDoc(newLogRef, {
          path: location.pathname,
          sessionId,
          city,
          device: type,
          model: model,
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
