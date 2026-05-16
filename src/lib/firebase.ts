import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { signInWithEmailAndPassword, signOut, onAuthStateChanged };
export type { User };
export { collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, query, orderBy, Timestamp };
