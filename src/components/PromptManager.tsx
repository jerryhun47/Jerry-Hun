import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';

export default function PromptManager() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    promptLink: '',
    fullPrompt: '',
    tags: '',
    imageUrl: '',
    isTrending: false,
    useCase: ''
  });

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const q = query(collection(db, 'prompts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPrompts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '', shortDesc: '', promptLink: '', fullPrompt: '', tags: '', imageUrl: '', isTrending: false, useCase: ''
    });
    setEditingId(null);
  };

  const handleEdit = (prompt: any) => {
    setEditingId(prompt.id);
    setFormData({
      title: prompt.title || '',
      shortDesc: prompt.shortDesc || '',
      promptLink: prompt.promptLink || '',
      fullPrompt: prompt.fullPrompt || '',
      tags: prompt.tags || '',
      imageUrl: prompt.imageUrl || '',
      isTrending: prompt.isTrending || false,
      useCase: prompt.useCase || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      await deleteDoc(doc(db, 'prompts', id));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
         setMessage({ type: 'error', text: 'Image must be less than 500KB' });
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      const dataToSave = {
         ...formData,
         categories: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      if (editingId) {
        await updateDoc(doc(db, 'prompts', editingId), { 
           ...dataToSave,
           updatedAt: serverTimestamp() 
        });
        setMessage({ type: 'success', text: 'Prompt saved successfully' });
      } else {
        await addDoc(collection(db, 'prompts'), {
          ...dataToSave,
          createdAt: serverTimestamp()
        });
        setMessage({ type: 'success', text: 'Prompt saved successfully' });
      }
      resetForm();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to save prompt' });
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Prompt' : 'Create New Prompt'}</h2>
           {editingId && (
              <button type="button" onClick={resetForm} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                 <X size={16} /> Cancel
              </button>
           )}
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="grid md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                 <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 10x Your Views with this Hook" />
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Prompt Link *</label>
                 <input type="text" required value={formData.promptLink} onChange={e => setFormData({...formData, promptLink: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://..." />
              </div>
           </div>

           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description</label>
              <textarea value={formData.shortDesc} onChange={e => setFormData({...formData, shortDesc: e.target.value})} rows={2} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="1-2 lines summarizing the prompt"></textarea>
           </div>

           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Prompt Text</label>
              <textarea value={formData.fullPrompt} onChange={e => setFormData({...formData, fullPrompt: e.target.value})} rows={5} className="w-full font-mono text-sm border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Write the complete prompt..."></textarea>
           </div>
           
           <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ideal Use Case</label>
              <input type="text" value={formData.useCase} onChange={e => setFormData({...formData, useCase: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. YouTube Shorts Hooks" />
           </div>

           <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Tags / Categories (comma separated)</label>
                 <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Shorts, Hook, Evergreen" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                 <input type="checkbox" id="trending" checked={formData.isTrending} onChange={e => setFormData({...formData, isTrending: e.target.checked})} className="w-5 h-5 accent-red-600 rounded" />
                 <label htmlFor="trending" className="font-semibold text-slate-700 select-none cursor-pointer">Mark as Trending 🔥</label>
              </div>
           </div>

           {/* Image Upload */}
           <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
              <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide uppercase">Cover Image / Thumbnail</label>
              <div className="flex flex-col items-center justify-center gap-4">
                 {formData.imageUrl ? (
                    <div className="relative inline-block">
                       <img src={formData.imageUrl} alt="Preview" className="h-40 rounded-lg object-cover shadow-sm border border-slate-200" />
                       <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} className="absolute -top-3 -right-3 bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-full shadow-sm"><X size={16}/></button>
                    </div>
                 ) : (
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                       <ImageIcon size={32} />
                    </div>
                 )}
                 <div className="relative group">
                    <button type="button" className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold shadow-md group-hover:bg-slate-800 transition-colors">
                       Choose Image
                    </button>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                 </div>
                 <p className="text-xs text-slate-500">YouTube Thumbnail size recommended (1280x720). Max 500KB.</p>
              </div>
           </div>

           <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
              {editingId ? <Save size={20} /> : <Plus size={20} />}
              {editingId ? 'Save Changes' : 'Publish Prompt'}
           </button>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-6">Published Prompts</h2>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading prompts...</div>
        ) : prompts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {prompts.map(prompt => (
                <div key={prompt.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-300 transition-colors">
                   <div className="aspect-video bg-slate-100 relative">
                      {prompt.imageUrl ? (
                         <img src={prompt.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                      )}
                      {prompt.isTrending && <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm">Trending</span>}
                   </div>
                   <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{prompt.title}</h3>
                      <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-2">{prompt.shortDesc}</p>
                      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 mt-auto">
                         <button onClick={() => handleEdit(prompt)} className="flex-1 flex justify-center items-center gap-1.5 p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-semibold transition-colors">
                            <Edit2 size={16} /> Edit
                         </button>
                         <button onClick={() => handleDelete(prompt.id)} className="flex-1 flex justify-center items-center gap-1.5 p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors">
                            <Trash2 size={16} /> Delete
                         </button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">No prompts found. Add your first prompt above.</div>
        )}
      </div>
    </div>
  );
}
