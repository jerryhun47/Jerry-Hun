import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, setLogLevel } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

// Suppress transient offline warnings in dev/sandbox
setLogLevel('error');

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
export type { User };
export { collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp };
