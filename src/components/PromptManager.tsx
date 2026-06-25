import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Save, Image as ImageIcon, Video, UploadCloud, CheckSquare, Square } from 'lucide-react';

const extractYouTubeId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function PromptManager() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    shortDesc: '',
    promptLink: '',
    videoLink: '',
    imageUrl: '',
  });

  const [bulkText, setBulkText] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);

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
      title: '', shortDesc: '', promptLink: '', videoLink: '', imageUrl: ''
    });
    setEditingId(null);
  };

  const handleEdit = (prompt: any) => {
    setEditingId(prompt.id);
    setIsBulkMode(false);
    setFormData({
      title: prompt.title || '',
      shortDesc: prompt.shortDesc || '',
      promptLink: prompt.promptLink || '',
      videoLink: prompt.videoLink || '',
      imageUrl: prompt.imageUrl || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this prompt?")) {
      await deleteDoc(doc(db, 'prompts', id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected prompts?`)) {
      try {
        const batch = writeBatch(db);
        selectedIds.forEach(id => {
          batch.delete(doc(db, 'prompts', id));
        });
        await batch.commit();
        setMessage({ type: 'success', text: `Successfully deleted ${selectedIds.length} prompts` });
        setSelectedIds([]);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to delete selected prompts' });
      }
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === prompts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(prompts.map(p => p.id));
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

  const processPromptData = (data: typeof formData) => {
    let finalImageUrl = data.imageUrl;
    let videoId = extractYouTubeId(data.videoLink);
    
    if (!finalImageUrl && videoId) {
       finalImageUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    const defaultDesc = "Create highly engaging AI-generated videos using this proven workflow.\n\n🔥 High RPM niche\n🎯 Low competition market\n🚀 Strong viral potential\n💰 Monetization friendly\n📈 Growing audience demand\n\nPerfect for YouTube automation creators looking to scale faster.";

    return {
       title: data.title || 'Untitled Prompt',
       shortDesc: data.shortDesc || defaultDesc,
       promptLink: data.promptLink || '',
       videoLink: data.videoLink || '',
       videoId: videoId || '',
       imageUrl: finalImageUrl || '',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!formData.videoLink) {
       setMessage({ type: 'error', text: 'Video Link is required' });
       return;
    }

    try {
      const dataToSave = processPromptData(formData);

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

  const parseAndSaveBulk = async () => {
     setMessage({ type: '', text: '' });
     if (!bulkText.trim()) {
        setMessage({ type: 'error', text: 'Please paste bulk data first' });
        return;
     }

     try {
       const lines = bulkText.split('\n').filter(l => l.trim() !== '');
       const promptsToAdd: any[] = [];
       let currentPrompt: any = {};

       for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.match(/^\d+\.$/) || line.toLowerCase().startsWith('title:')) {
             if (currentPrompt.videoLink) {
                if (!currentPrompt.title) currentPrompt.title = `Prompt ${promptsToAdd.length + 1}`;
                promptsToAdd.push(processPromptData({ ...formData, ...currentPrompt }));
                currentPrompt = {};
             }
             if (line.toLowerCase().startsWith('title:')) {
                currentPrompt.title = line.substring(6).trim();
             }
          } else if (line.toLowerCase().startsWith('video:')) {
             currentPrompt.videoLink = line.substring(6).trim();
          } else if (line.toLowerCase().startsWith('prompt:')) {
             currentPrompt.promptLink = line.substring(7).trim();
          } else if (line.toLowerCase().match(/^🔥 \d+\./)) {
             if (currentPrompt.videoLink) {
                promptsToAdd.push(processPromptData({ ...formData, ...currentPrompt }));
                currentPrompt = {};
             }
             currentPrompt.title = line.replace(/🔥 \d+\.\s*/, '').trim();
          }
       }
       
       if (currentPrompt.videoLink) {
          if (!currentPrompt.title) currentPrompt.title = `Prompt ${promptsToAdd.length + 1}`;
          promptsToAdd.push(processPromptData({ ...formData, ...currentPrompt }));
       }

       if (promptsToAdd.length === 0) {
          setMessage({ type: 'error', text: 'No valid prompts found. Use Title: / Video: / Prompt:' });
          return;
       }

       const batch = writeBatch(db);
       promptsToAdd.forEach(p => {
          const docRef = doc(collection(db, 'prompts'));
          batch.set(docRef, { ...p, createdAt: serverTimestamp() });
       });
       
       await batch.commit();

       setMessage({ type: 'success', text: `Successfully imported ${promptsToAdd.length} prompts!` });
       setBulkText('');
       setIsBulkMode(false);
       setTimeout(() => setMessage({ type: '', text: '' }), 3000);
     } catch (err) {
       console.error(err);
       setMessage({ type: 'error', text: 'Failed to process bulk import' });
     }
  };

  return (
    <div className="space-y-8">
      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
           <h2 className="text-xl font-bold text-slate-800">
             {isBulkMode ? 'Bulk Add Prompts' : editingId ? 'Edit Prompt' : 'Create New Prompt'}
           </h2>
           <div className="flex gap-2">
             {!isBulkMode && !editingId && (
                <button type="button" onClick={() => setIsBulkMode(true)} className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                   <UploadCloud size={16} /> Bulk Add
                </button>
             )}
             {(editingId || isBulkMode) && (
                <button type="button" onClick={() => { resetForm(); setIsBulkMode(false); }} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                   <X size={16} /> Cancel
                </button>
             )}
           </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
            {message.text}
          </div>
        )}

        {isBulkMode ? (
           <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-sm text-blue-800">
                 <b>Format Example:</b><br />
                 Title: Home Renovation AI<br />
                 Video: https://youtube.com/...<br />
                 Prompt: https://docs...
              </div>
              <textarea 
                 value={bulkText} 
                 onChange={e => setBulkText(e.target.value)} 
                 rows={10} 
                 className="w-full font-mono text-sm border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none" 
                 placeholder="Paste your prompts here..."
              ></textarea>
              <button onClick={parseAndSaveBulk} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                 <UploadCloud size={20} /> Import Prompts
              </button>
           </div>
        ) : (
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Title (Optional)</label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. 10x Your Views with this Hook" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Prompt Link *</label>
                    <input type="text" required value={formData.promptLink} onChange={e => setFormData({...formData, promptLink: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://docs.google.com/..." />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">YouTube Video Link (Optional)</label>
                 <div className="relative">
                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" value={formData.videoLink} onChange={e => setFormData({...formData, videoLink: e.target.value})} className="w-full border border-slate-300 rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="https://youtube.com/watch?v=..." />
                 </div>
              </div>

              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-2">Short Description (Optional)</label>
                 <textarea value={formData.shortDesc} onChange={e => setFormData({...formData, shortDesc: e.target.value})} rows={2} className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-500 outline-none" placeholder="1-2 lines summarizing the prompt"></textarea>
              </div>

              {/* Image Upload */}
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                 <label className="block text-sm font-semibold text-slate-700 mb-4 tracking-wide uppercase">Cover Image / Thumbnail (Optional)</label>
                 <p className="text-xs text-slate-500 mb-4">If left blank, system will auto-fetch from YouTube Link</p>
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
                          Upload Custom Image
                       </button>
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                 </div>
              </div>

              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                 {editingId ? <Save size={20} /> : <Plus size={20} />}
                 {editingId ? 'Save Changes' : 'Publish Prompt'}
              </button>
           </form>
        )}
      </div>

      {/* List Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-xl font-bold text-slate-800">Published Prompts</h2>
          {prompts.length > 0 && (
            <div className="flex gap-2 items-center">
              <button 
                onClick={handleSelectAll} 
                className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                {selectedIds.length === prompts.length ? <CheckSquare size={16} /> : <Square size={16} />}
                Select All
              </button>
              {selectedIds.length > 0 && (
                <button 
                  onClick={handleBulkDelete} 
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors font-semibold"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedIds.length})
                </button>
              )}
            </div>
          )}
        </div>
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading prompts...</div>
        ) : prompts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {prompts.map(prompt => (
                <div key={prompt.id} className={`border ${selectedIds.includes(prompt.id) ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-200'} rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-300 transition-colors bg-slate-50 relative`}>
                   
                   {/* Checkbox overlay */}
                   <button 
                     onClick={() => toggleSelection(prompt.id)}
                     className="absolute top-2 left-2 z-10 bg-white/80 backdrop-blur text-slate-700 hover:text-red-600 p-1.5 rounded-md shadow-sm transition-colors"
                   >
                     {selectedIds.includes(prompt.id) ? <CheckSquare className="text-red-500" size={18} /> : <Square size={18} />}
                   </button>

                   <div className="aspect-video bg-black relative">
                      {prompt.imageUrl ? (
                         <img src={prompt.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
                      )}
                      {prompt.videoId && <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white p-1.5 rounded-md"><Video size={14}/></span>}
                   </div>
                   <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 mb-1 line-clamp-1">{prompt.title}</h3>
                      <p className="text-xs text-blue-600 truncate mb-1">{prompt.promptLink}</p>
                      
                      <div className="flex items-center gap-2 border-t border-slate-200 pt-3 mt-auto">
                         <button onClick={() => handleEdit(prompt)} className="flex-1 flex justify-center items-center gap-1.5 p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-semibold transition-colors">
                            <Edit2 size={16} /> Edit
                         </button>
                         <button onClick={() => handleDelete(prompt.id)} className="flex-1 flex justify-center items-center gap-1.5 p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-semibold transition-colors">
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

