import { useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { UAParser } from 'ua-parser-js';

export function useVisitorTracking() {
  useEffect(() => {
    let currentCity = 'Unknown Location';
    
    const initTracking = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.city) {
          currentCity = data.city;
        }
      } catch (e) {
        console.error('Failed to get location', e);
      }

      const parser = new UAParser();
      const result = parser.getResult();
      const deviceModel = result.device.model || result.os.name || 'Desktop';
      const browserName = result.browser.name || 'Unknown Browser';

      const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const sessionRef = doc(db, 'visitors', sessionId);

      setDoc(sessionRef, {
         userAgent: window.navigator.userAgent,
         deviceModel,
         browserName,
         city: currentCity,
         path: window.location.pathname,
         timestamp: serverTimestamp(),
         lastActive: serverTimestamp(),
      }).catch(console.error);

      const interval = setInterval(() => {
         setDoc(sessionRef, {
            lastActive: serverTimestamp(),
            path: window.location.pathname,
         }, { merge: true }).catch(console.error);
      }, 10000); 

      return () => clearInterval(interval);
    };

    const cleanupPromise = initTracking();
    
    return () => {
       cleanupPromise.then(cleanup => {
         if (typeof cleanup === 'function') cleanup();
       });
    };
  }, []);
}
