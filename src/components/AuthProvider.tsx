import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface UserData {
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      setUser(userAuth);
      if (userAuth) {
        // check if admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', userAuth.uid));
          setUserData({ isAdmin: adminDoc.exists() });
        } catch (e: any) {
          console.error("Quota or access error checking admin status:", e);
          // Fallback bypass if quota is exhausted
          if (userAuth.email === 'jerryhun47@gmail.com') {
             setUserData({ isAdmin: true });
          } else {
             setUserData({ isAdmin: false });
          }
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    try {
       await setDoc(doc(db, 'users', cred.user.uid), {
         email: cred.user.email,
         name: cred.user.displayName,
         photoURL: cred.user.photoURL,
         lastLoginAt: new Date()
       }, { merge: true });
    } catch (e) {
       console.error(e);
    }
  };

  const signOut = async () => {
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
