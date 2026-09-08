import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function PromoPopupManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    enabled: true,
    delaySeconds: 4,
    title: 'Grab These Top AI Tools at 50% OFF!',
    subtitle: 'Supercharge your workflow today with our most popular premium tools before the sale ends.',
    badge: 'Limited Time Offer For You',
    items: [
      {
        name: 'Google Veo 3',
        description: 'Advanced AI video generation without limits.',
        originalPrice: 6000,
        discountedPrice: 3000,
        emoji: '🎥',
        link: '/tools/google-veo-3-ultra',
        discountBadge: '50% OFF',
        theme: 'primary' // primary, blue, purple
      },
      {
        name: 'Grok AI',
        description: 'Unrestricted access to the most powerful reasoning model.',
        originalPrice: 4000,
        discountedPrice: 2000,
        emoji: '🧠',
        link: '/tools/grok-ai-super-heavy-plan',
        discountBadge: '50% OFF',
        theme: 'blue'
      },
      {
        name: 'Midjourney V6',
        description: 'Create photorealistic images with exact camera settings.',
        originalPrice: 3000,
        discountedPrice: 1500,
        emoji: '🎨',
        link: '/tools/midjourney-v6-pro',
        discountBadge: '50% OFF',
        theme: 'purple'
      }
    ]
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const d = await getDoc(doc(db, 'settings', 'promo_popup'));
        if (d.exists()) {
          setSettings(d.data() as any);
        }
      } catch (err) {
        console.error("Failed to fetch promo popup settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'promo_popup'), settings);
      alert('Promo popup settings saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...settings.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, items: newItems });
  };

  const addItem = () => {
    setSettings({
      ...settings,
      items: [
        ...settings.items,
        {
          name: 'New Product',
          description: 'Description here',
          originalPrice: 1000,
          discountedPrice: 500,
          emoji: '✨',
          link: '/tools/new',
          discountBadge: '50% OFF',
          theme: 'primary'
        }
      ]
    });
  };

  const removeItem = (index: number) => {
    const newItems = settings.items.filter((_, i) => i !== index);
    setSettings({ ...settings, items: newItems });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-black text-slate-800">Promo Popup Configuration</h2>
         <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-bold transition-colors">
            <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
         </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-900 mb-4">General Settings</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center gap-3">
               <input 
                 type="checkbox" 
                 id="popup-enabled"
                 checked={settings.enabled} 
                 onChange={e => setSettings({...settings, enabled: e.target.checked})}
                 className="w-5 h-5 accent-primary-600 cursor-pointer"
               />
               <label htmlFor="popup-enabled" className="text-sm font-semibold cursor-pointer">Enable Promo Popup</label>
             </div>
             <div>
               <label className="block text-sm font-semibold mb-1">Delay before showing (seconds)</label>
               <input 
                 type="number" 
                 value={settings.delaySeconds} 
                 onChange={e => setSettings({...settings, delaySeconds: parseInt(e.target.value) || 0})}
                 className="w-full border border-slate-200 rounded-lg px-4 py-2" 
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-semibold mb-1">Popup Title</label>
               <input 
                 type="text" 
                 value={settings.title} 
                 onChange={e => setSettings({...settings, title: e.target.value})}
                 className="w-full border border-slate-200 rounded-lg px-4 py-2" 
               />
             </div>
             <div className="md:col-span-2">
               <label className="block text-sm font-semibold mb-1">Subtitle</label>
               <input 
                 type="text" 
                 value={settings.subtitle} 
                 onChange={e => setSettings({...settings, subtitle: e.target.value})}
                 className="w-full border border-slate-200 rounded-lg px-4 py-2" 
               />
             </div>
             <div>
               <label className="block text-sm font-semibold mb-1">Top Badge Text</label>
               <input 
                 type="text" 
                 value={settings.badge} 
                 onChange={e => setSettings({...settings, badge: e.target.value})}
                 className="w-full border border-slate-200 rounded-lg px-4 py-2" 
               />
             </div>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Popup Products</h3>
              <button type="button" onClick={addItem} className="flex items-center gap-1 text-sm bg-slate-900 text-white px-3 py-1 rounded-lg">
                <Plus size={16} /> Add Item
              </button>
           </div>
           
           <div className="space-y-4">
             {settings.items.map((item, index) => (
               <div key={index} className="border border-slate-200 p-4 rounded-xl relative bg-slate-50">
                 <button type="button" onClick={() => removeItem(index)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-2 rounded-lg"><Trash2 size={18} /></button>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pr-10">
                   <div>
                     <label className="block text-xs font-semibold mb-1">Name</label>
                     <input type="text" value={item.name} onChange={e => updateItem(index, 'name', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Emoji</label>
                     <input type="text" value={item.emoji} onChange={e => updateItem(index, 'emoji', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div className="col-span-2">
                     <label className="block text-xs font-semibold mb-1">Description</label>
                     <input type="text" value={item.description} onChange={e => updateItem(index, 'description', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Original Price</label>
                     <input type="number" value={item.originalPrice} onChange={e => updateItem(index, 'originalPrice', parseInt(e.target.value) || 0)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Discount Price</label>
                     <input type="number" value={item.discountedPrice} onChange={e => updateItem(index, 'discountedPrice', parseInt(e.target.value) || 0)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Link URL</label>
                     <input type="text" value={item.link} onChange={e => updateItem(index, 'link', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Theme (primary, blue, purple)</label>
                     <input type="text" value={item.theme} onChange={e => updateItem(index, 'theme', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold mb-1">Discount Badge (e.g. 50% OFF)</label>
                     <input type="text" value={item.discountBadge} onChange={e => updateItem(index, 'discountBadge', e.target.value)} className="w-full border border-slate-200 rounded px-2 py-1 text-sm" />
                   </div>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </form>
    </div>
  );
}
