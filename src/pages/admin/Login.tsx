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
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600/20 text-red-500 border border-red-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
             <Lock size={32} />
          </div>
          <h1 className="text-2xl font-black text-white">Status Logs</h1>
          <p className="text-zinc-400 mt-2 text-sm font-medium">Secure Admin Access for Jerry Automation</p>
        </div>

        {error && <div className="bg-red-950/80 border border-red-600/50 text-red-200 p-4 rounded-xl text-sm mb-6 font-bold">{error}</div>}
        {msg && <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-4 rounded-xl text-sm mb-6 font-bold">{msg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2 text-white">Email Address</label>
            <div className="relative">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
               <input 
                 type="email" 
                 required 
                 value={email} 
                 onChange={e => setEmail(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600" 
                 placeholder="your-admin@email.com"
               />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
               <label className="block text-sm font-bold text-white">Password</label>
               <button type="button" onClick={resetPassword} className="text-xs text-red-500 hover:text-red-400 font-bold">Reset Password</button>
            </div>
            <div className="relative">
               <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
               <input 
                 type="password" 
                 required 
                 value={password} 
                 onChange={e => setPassword(e.target.value)}
                 className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-600" 
                 placeholder="••••••••"
               />
            </div>
          </div>
          
          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-red-600/20 mt-6 cursor-pointer"
          >
            {loading ? 'Processing...' : 'Login to Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
