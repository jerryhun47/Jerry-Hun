import { useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { UAParser } from 'ua-parser-js';

export function useVisitorTracking(pathname: string) {
  useEffect(() => {
    let currentCity = 'Unknown';
    let currentIp = 'Unknown';
    
    // Set persistent visitor ID
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'vid_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
      localStorage.setItem('visitor_id', visitorId);
    }

    const initTracking = async () => {
      try {
        const res = await fetch('https://freeipapi.com/api/json/');
        const data = await res.json();
        if (data.cityName) currentCity = data.cityName;
        if (data.ipAddress) currentIp = data.ipAddress;
      } catch (e) {}

      const parser = new UAParser();
      const result = parser.getResult();
      const deviceModel = result.device.model || result.os.name || 'Desktop';
      const browserName = result.browser.name || 'Unknown Browser';

      const visitorRef = doc(db, 'visitors', visitorId as string);
      const visitorSnap = await getDoc(visitorRef);

      if (!visitorSnap.exists()) {
        await setDoc(visitorRef, {
           visitorId,
           firstVisitTime: serverTimestamp(),
           lastVisitTime: serverTimestamp(),
           sessionCount: 1,
           userAgent: window.navigator.userAgent,
           deviceModel,
           browserName,
           city: currentCity,
           ipAddresses: [currentIp],
           pageVisits: [{ path: pathname, timestamp: Date.now() }],
        });
      } else {
        await updateDoc(visitorRef, {
           lastVisitTime: serverTimestamp(),
           sessionCount: increment(0), // don't increment unless it's a new session, simplified for now
           ipAddresses: arrayUnion(currentIp),
           pageVisits: arrayUnion({ path: pathname, timestamp: Date.now() }),
           city: currentCity,
        });
      }

      const interval = setInterval(() => {
         updateDoc(visitorRef, {
            lastActive: serverTimestamp(),
         }).catch(() => {});
      }, 10000); 

      return () => clearInterval(interval);
    };

    const cleanupPromise = initTracking();
    
    return () => {
       cleanupPromise.then(cleanup => {
         if (typeof cleanup === 'function') cleanup();
       });
    };
  }, [pathname]);
}
