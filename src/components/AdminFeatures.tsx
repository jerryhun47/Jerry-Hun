import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Trash2, Plus, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

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
