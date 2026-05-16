import { useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useVisitorTracking() {
  useEffect(() => {
    // Basic tracking: create a session document when app loads
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const sessionRef = doc(db, 'visitors', sessionId);

    setDoc(sessionRef, {
       userAgent: window.navigator.userAgent,
       path: window.location.pathname,
       timestamp: serverTimestamp(),
       lastActive: serverTimestamp(),
       // Firestore doesn't natively support onDisconnect in the Web SDK in the same way 
       // Realtime DB does, but we can update `lastActive` periodically
    }).catch(console.error);

    const interval = setInterval(() => {
       setDoc(sessionRef, {
          lastActive: serverTimestamp(),
          path: window.location.pathname,
       }, { merge: true }).catch(console.error);
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);
}
