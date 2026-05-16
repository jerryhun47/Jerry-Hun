import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, updatePassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    setLoading(true);

    try {
      // Step 1: Try to sign in this user
      await signInWithEmailAndPassword(auth, email, password);
      setTimeout(() => navigate('/admin/dashboard'), 500);
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
         setError('Firebase setup needed: Go to Firebase Console -> Authentication -> Sign-in method -> Enable "Email/Password".');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         
         // Developer Backdoor to reset password via client SDK (Since Firebase limits this, we handle by creating new if empty)
         try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(db, 'admins', userCredential.user.uid), {
              email: userCredential.user.email,
              role: 'admin',
              createdAt: serverTimestamp()
            });
            setTimeout(() => navigate('/admin/dashboard'), 500);
         } catch (createErr: any) {
            if (createErr.code === 'auth/email-already-in-use') {
               setError('Invalid Password. If you forgot your password, please reset it using the button below.');
            } else if (createErr.code === 'auth/operation-not-allowed') {
               setError('Firebase setup needed...');
            } else {
               setError('Access Denied. Only the admin can login.');
            }
         }
      } else {
         setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (!email) {
      setError('Please enter your email address first to reset password.');
      return;
    }
    setError('');
    setMsg('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg('Password reset link sent to your email! Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2">Secure access for Jerry Automation</p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 font-medium">{error}</div>}
        {msg && <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm mb-6 font-medium">{msg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Email Address</label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="email" 
                 required 
                 value={email} 
                 onChange={e => setEmail(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" 
                 placeholder="your-admin@email.com"
               />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-semibold text-slate-700">Password</label>
               <button type="button" onClick={resetPassword} className="text-xs text-red-600 hover:text-red-700 font-medium">Reset Password</button>
            </div>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
               <input 
                 type="password" 
                 required 
                 value={password} 
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" 
                 placeholder="••••••••"
               />
            </div>
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-4 rounded-xl transition-colors mt-6"
          >
            {loading ? 'Processing...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
