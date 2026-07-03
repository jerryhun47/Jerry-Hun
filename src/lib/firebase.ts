import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { initializeFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp, setLogLevel, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

enableMultiTabIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

// Suppress transient offline warnings in dev/sandbox
setLogLevel('error');

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
export type { User };
export { collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp };
