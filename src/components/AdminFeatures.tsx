import { apiFetch } from '../lib/api';
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, Plus, RefreshCw, X, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { limit } from 'firebase/firestore';

import { PieChart, Activity, Users, Monitor, Search, Smartphone, Globe, MousePointerClick } from 'lucide-react';

export function LiveTrackingManager() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState({ activeSessions: 0, totalPageviews: 0, mobileUsers: 0, desktopUsers: 0 });

  useEffect(() => {
    const q = query(collection(db, 'tracking_logs'), orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as any[];
      setLogs(data);
      
      const uniqueSessions = new Set(data.map(d => (d as any).sessionId)).size;
      const mobile = data.filter(d => (d as any).device === 'Mobile').length;
      const desktop = data.filter(d => (d as any).device === 'Desktop').length;
      setStats({
        activeSessions: uniqueSessions,
        totalPageviews: data.length,
        mobileUsers: mobile,
        desktopUsers: desktop
      });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">Live Tracking</h2>
          <p className="text-slate-500 font-medium text-sm">Real-time visitor activity and sessions</p>
        </div>
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl flex items-center gap-2 font-bold animate-pulse">
           <Activity size={18} /> Live
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
            <Users size={20} className="text-indigo-500 mb-2" />
            <div className="text-2xl font-black text-slate-900">{stats.activeSessions}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Active Sessions</div>
         </div>
         <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <MousePointerClick size={20} className="text-blue-500 mb-2" />
            <div className="text-2xl font-black text-slate-900">{stats.totalPageviews}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Pageviews</div>
         </div>
         <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <Smartphone size={20} className="text-emerald-500 mb-2" />
            <div className="text-2xl font-black text-slate-900">{stats.mobileUsers}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Mobile Hits</div>
         </div>
         <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
            <Monitor size={20} className="text-orange-500 mb-2" />
            <div className="text-2xl font-black text-slate-900">{stats.desktopUsers}</div>
            <div className="text-xs font-bold text-slate-500 uppercase">Desktop Hits</div>
         </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
        <ul className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
           {logs.map((log, i) => (
              <li key={i} className="p-4 flex items-center justify-between hover:bg-slate-100 transition-colors">
                 <div className="flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                       {log.device === 'Mobile' ? <Smartphone size={18} className="text-slate-500" /> : <Monitor size={18} className="text-slate-500" />}
                    </div>
                    <div>
                       <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          {log.path === '/' ? 'Home Page' : log.path}
                       </p>
                       <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mt-1">
                          <Globe size={12} /> {log.city || 'Unknown City'} • IP: {log.ip || 'Hidden'}
                       </p>
                    </div>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 border border-slate-200 rounded-lg shadow-sm block mb-1">Session {log.sessionId?.slice(0,4)}</span>
                    <span className="text-[10px] text-slate-400 font-medium">
                       {log.timestamp?.toMillis ? new Date(log.timestamp.toMillis()).toLocaleTimeString() : 'Just now'}
                    </span>
                 </div>
              </li>
           ))}
           {logs.length === 0 && (
             <li className="p-8 text-center text-slate-500 font-bold">No activity yet.</li>
           )}
        </ul>
      </div>
    </div>
  );
}

export function AIChatLogsManager() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'chat_logs'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow h-[600px] flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1">AI Chat Logs</h2>
          <p className="text-slate-500 font-medium text-sm">Monitor recent AI assistant conversations</p>
        </div>
        <div className="bg-slate-100 p-3 rounded-2xl flex items-center gap-2">
           <MessageSquare size={18} className="text-slate-500" />
           <span className="font-bold text-slate-700">{logs.length} Recent Chats</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {logs.map(log => (
          <div key={log.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
             <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">{log.city?.slice(0,2).toUpperCase() || 'UN'}</div>
                   <div>
                     <span className="block text-xs font-bold text-slate-800">Guest Visitor</span>
                     <span className="block text-[10px] uppercase font-bold text-slate-400">{log.city || 'Unknown Location'}</span>
                   </div>
                </div>
                <span className="text-xs text-slate-400 font-mono font-medium">{log.createdAt?.toMillis ? new Date(log.createdAt.toMillis()).toLocaleString() : new Date().toLocaleString()}</span>
             </div>
             <div>
                <p className="text-sm">
                   <strong className="text-indigo-600 block mb-1 text-xs uppercase tracking-wider">User Asked:</strong>
                   <span className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl block font-medium text-slate-800">{log.userMsg}</span>
                </p>
                <p className="text-sm mt-3">
                   <strong className="text-red-600 block mb-1 text-xs uppercase tracking-wider">AI Responded:</strong>
                   <span className="bg-white border border-red-100 p-2 rounded-xl block text-slate-700">{log.aiMsg}</span>
                </p>
             </div>
          </div>
        ))}
        {logs.length === 0 && (
           <div className="flex flex-col items-center justify-center h-full text-center">
             <MessageSquare size={48} className="text-slate-300 mb-4" />
             <p className="text-slate-500 font-bold">No chat logs yet.</p>
           </div>
        )}
      </div>
    </div>
  );
}

export function UsersManager({ users }: { users: any[] }) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      alert('User deleted.');
    } catch {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 card-shadow p-6">
       <h2 className="text-2xl font-bold mb-6">Users Management</h2>
       <div className="overflow-x-auto">
          <table className="w-full text-left">
             <thead className="border-b border-slate-200">
                <tr>
                   <th className="p-4 font-semibold text-slate-500">Name</th>
                   <th className="p-4 font-semibold text-slate-500">Email</th>
                   <th className="p-4 font-semibold text-slate-500 flex justify-end">Actions</th>
                </tr>
             </thead>
             <tbody>
                {users.map(u => (
                   <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 relative">
                      <td className="p-4">{u.name || 'No Name'}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 flex justify-end">
                         <button onClick={() => handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </td>
                   </tr>
                ))}
                {users.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-slate-500">No users found.</td></tr>}
             </tbody>
          </table>
       </div>
    </div>
  );
}

export function DiscountsManager() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6">
      <h2 className="text-2xl font-bold mb-6">Discounts</h2>
      <p className="text-slate-500 mb-4">Create discount offers and coupons.</p>
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 text-center">
         Discounts have been enabled on items. You can set discounted prices directly when editing Products or Courses!
      </div>
    </div>
  );
}

export function SEOSettingsManager() {
  const [settings, setSettings] = useState({ metaTitle: '', metaDescription: '', keywords: '', logoUrl: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(collection(db, 'seo_settings'), (snap) => {
      if (!snap.empty) setSettings(snap.docs[0].data() as any);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    try {
      const snap = await import('firebase/firestore').then(m => m.getDocs(m.collection(db, 'seo_settings')));
      if (snap.empty) {
        await addDoc(collection(db, 'seo_settings'), settings);
      } else {
        await updateDoc(doc(db, 'seo_settings', snap.docs[0].id), settings);
      }
      alert('SEO Settings saved!');
    } catch {
      alert('Failed to save SEO settings.');
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-center">Loading SEO...</div>;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 card-shadow p-6">
       <h2 className="text-2xl font-bold mb-2">SEO Settings</h2>
       <p className="text-slate-500 mb-6">Configure global SEO tags for better search engine ranking.</p>
       <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label>
            <input type="text" value={settings.metaTitle} onChange={e => setSettings({...settings, metaTitle: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. Jerry Automation - Best AI Tools" />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
            <textarea value={settings.metaDescription} onChange={e => setSettings({...settings, metaDescription: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="Click-bait but professional description under 160 chars..."></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Meta Keywords</label>
            <textarea value={settings.keywords} onChange={e => setSettings({...settings, keywords: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="comma separated keywords"></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Logo URL (for schema/socials)</label>
            <input type="text" value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="https://..." />
          </div>
          <button onClick={handleSave} className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl">Save SEO</button>
       </div>
    </div>
  );
}

export function BannersManager() {
  const [banners, setBanners] = useState<any[]>([]);
  useEffect(() => {
    return onSnapshot(collection(db, 'banners'), snap => {
      setBanners(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, []);

  const handleAdd = async () => {
    const url = prompt('Enter banner image/video URL:');
    if (!url) return;
    await addDoc(collection(db, 'banners'), { url, createdAt: new Date() });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold">Homepage Banners</h2>
         <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16}/> Add Banner</button>
       </div>
       <div className="grid md:grid-cols-2 gap-4">
         {banners.map(b => (
            <div key={b.id} className="relative rounded-xl overflow-hidden group">
               <img src={b.url} className="w-full h-40 object-cover" alt="Banner" />
               <button onClick={() => deleteDoc(doc(db, 'banners', b.id))} className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button>
            </div>
         ))}
         {banners.length === 0 && <p className="text-slate-500">No banners.</p>}
       </div>
    </div>
  );
}

export function MediaManager() {
  const [media, setMedia] = useState<any[]>([]);
  
  useEffect(() => {
    return onSnapshot(collection(db, 'media'), snap => {
       setMedia(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, []);

  const handleAdd = () => {
     const url = prompt("Enter media URL:");
     if(url) addDoc(collection(db, 'media'), { url, type: url.includes('.mp4') ? 'video' : 'image', createdAt: new Date() });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6">
      <div className="flex justify-between mb-6">
         <h2 className="text-2xl font-bold">Media Library</h2>
         <button onClick={handleAdd} className="bg-red-600 text-white px-4 py-2 font-bold rounded-xl flex items-center gap-2"><Plus size={16} /> Add Media URL</button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {media.map(m => (
            <div key={m.id} className="relative group border border-slate-200 rounded-xl overflow-hidden aspect-square">
               {m.type === 'video' ? (
                 <video src={m.url} className="w-full h-full object-cover" muted loop autoPlay />
               ) : (
                 <img src={m.url} className="w-full h-full object-cover" />
               )}
               <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition flex justify-between items-end">
                  <span className="text-[10px] text-white truncate max-w-[100px]">{m.url}</span>
                  <button onClick={() => deleteDoc(doc(db, 'media', m.id))} className="text-red-500 bg-black/50 p-1 rounded hover:bg-black"><Trash2 size={14} /></button>
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}

export function NotificationsManager() {
  const [notifications, setNotifications] = useState<any[]>([]);
  useEffect(() => {
    return onSnapshot(query(collection(db, 'notifications'), orderBy('createdAt', 'desc')), snap => {
       setNotifications(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, []);
  return (
    <div className="bg-white border rounded-3xl p-6 border-slate-200">
      <h2 className="text-2xl font-bold mb-6">Real-Time Notifications</h2>
      <div className="space-y-3">
         {notifications.map(n => (
            <div key={n.id} className="p-4 bg-slate-50 border-l-4 border-red-500 rounded-lg">
               <p className="font-medium">{n.message}</p>
               <span className="text-xs text-slate-500">{new Date(n.createdAt?.toMillis() || Date.now()).toLocaleString()}</span>
            </div>
         ))}
         {notifications.length === 0 && <p>No internal notifications yet.</p>}
      </div>
    </div>
  );
}

export function AISettingsManager() {
  const [keyPreview, setKeyPreview] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [status, setStatus] = useState('');

  useEffect(() => {
    apiFetch('/api/ai-config').then(res => res.json()).then(data => {
       if (data.keyPreview) setKeyPreview(data.keyPreview);
       if (data.enabled !== undefined) setAiEnabled(data.enabled);
    }).catch(console.error);
  }, []);

  const saveConfig = async () => {
    setStatus('Saving...');
    try {
      const res = await apiFetch('/api/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: apiKey, enabled: aiEnabled })
      });
      if (res.ok) {
        setStatus('Saved successfully!');
        if (apiKey) {
           setKeyPreview('********');
           setApiKey('');
        }
        setTimeout(() => setStatus(''), 3000);
      }
    } catch(e) {
      setStatus('Error saving configuration.');
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow">
      <h2 className="text-2xl font-black mb-2 text-slate-900">AI Chatbot Settings</h2>
      <p className="text-slate-500 mb-6 font-medium text-sm">Control the AI assistant shown on the frontend.</p>
      
      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-6">
        <div className="flex items-center justify-between">
           <div>
             <label className="block text-sm font-bold text-slate-900 mb-1">Enable AI Support Bot</label>
             <p className="text-xs text-slate-500 font-medium">Toggle the AI popup functionality globally.</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" className="sr-only peer" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} />
             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
           </label>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <label className="block text-sm font-bold text-slate-900 mb-2">Google Gemini API Key</label>
          {keyPreview && (
             <div className="mb-2 text-xs font-bold text-green-600 bg-green-50 p-2 rounded inline-block border border-green-200">
               Current Key Configured: {keyPreview}
             </div>
          )}
          <input 
             type="password" 
             value={apiKey} 
             onChange={e => setApiKey(e.target.value)} 
             placeholder={keyPreview ? "Enter new API key to replace the current one" : "Enter Gemini API Key"} 
             className="w-full text-slate-900 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 font-bold focus:border-red-500 outline-none" 
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
           <button onClick={saveConfig} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 shadow-lg hover:bg-slate-800">
             Save AI Configuration
           </button>
           <button onClick={async () => {
             if (!apiKey) return alert('Please enter an API key to test.');
             setStatus('Testing...');
             try {
               const res = await apiFetch('/api/test-ai-key', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ key: apiKey }) });
               const data = await res.json();
               if (data.valid) setStatus('✅ Working');
               else setStatus('❌ Invalid: ' + (data.error || 'Check key'));
             } catch(e) {
               setStatus('❌ Error testing key');
             }
           }} className="bg-slate-200 text-slate-800 px-6 py-3 rounded-xl font-bold transition-transform active:scale-95 hover:bg-slate-300">
             Test API Key
           </button>
           {status && <span className={`font-bold text-sm ${status.includes('❌') ? 'text-red-600' : 'text-green-600'}`}>{status}</span>}
        </div>
      </div>
    </div>
  );
}
