import React, { useState, useEffect, useRef } from 'react';
import { Monitor, Tablet, Smartphone, Save, Globe, Upload, Image as ImageIcon, CheckCircle, Info, MousePointerClick } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDocs, collection, updateDoc, addDoc } from 'firebase/firestore';

export default function WebsiteEditor() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [selectedEditorId, setSelectedEditorId] = useState('');
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'EDITOR_LOCATION_SELECTED') {
        const editorId = e.data.payload.id;
        setSelectedEditorId(editorId);
        
        // Immediately apply the image if uploaded
        if (uploadedImageUrl && iframeRef.current && iframeRef.current.contentWindow) {
           iframeRef.current.contentWindow.postMessage({
              type: 'APPLY_IMAGE',
              payload: { id: editorId, src: uploadedImageUrl }
           }, '*');
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [uploadedImageUrl]);

  const handlePublish = async () => {
    if (!selectedEditorId || !uploadedImageUrl) {
      alert("Please upload an image and select a location on the website first.");
      return;
    }

    setIsPublishing(true);
    try {
      const snap = await getDocs(collection(db, 'settings'));
      const newSettings: any = {};
      
      if (selectedEditorId === 'promo-banner') {
        newSettings.promoBannerUrl = uploadedImageUrl;
      } else if (selectedEditorId === 'client-review-banner') {
        newSettings.clientReviewUrl = uploadedImageUrl;
      } else {
        // Generic override
        const currentData = snap.empty ? {} : snap.docs[0].data();
        newSettings.imageOverrides = {
           ...(currentData.imageOverrides || {}),
           [selectedEditorId]: uploadedImageUrl
        };
      }

      if (snap.empty) {
        await addDoc(collection(db, 'settings'), newSettings);
      } else {
        await updateDoc(doc(db, 'settings', snap.docs[0].id), newSettings);
      }
      
      alert("Website changes published successfully!");
    } catch (e) {
      console.error(e);
      alert("Failed to publish changes.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1200;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/webp', 0.85);
          setUploadedImageUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-900 overflow-hidden rounded-3xl border border-slate-800">
      {/* Editor Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4 text-white">
           <Globe className="text-red-500" />
           <span className="font-black text-lg">Visual Image Placer</span>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
           <button onClick={() => setDevice('desktop')} className={`p-2 rounded-md transition-colors ${device === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Monitor size={18} /></button>
           <button onClick={() => setDevice('tablet')} className={`p-2 rounded-md transition-colors ${device === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Tablet size={18} /></button>
           <button onClick={() => setDevice('mobile')} className={`p-2 rounded-md transition-colors ${device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Smartphone size={18} /></button>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={handlePublish} disabled={isPublishing || !selectedEditorId || !uploadedImageUrl} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
             <Save size={16} /> {isPublishing ? 'Publishing...' : 'Publish Live'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Properties */}
         <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto p-5 minimal-scrollbar space-y-6">
                <div>
                   <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Upload size={16} className="text-red-500"/> Step 1: Upload Photo</h3>
                   <div className="bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl p-4 text-center relative hover:border-red-500/50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {uploadedImageUrl ? (
                        <div className="space-y-2">
                          <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-24 object-cover rounded-lg border border-slate-700" />
                          <span className="text-xs font-bold text-green-400 block"><CheckCircle size={14} className="inline mr-1" /> Uploaded successfully</span>
                        </div>
                      ) : (
                        <div className="py-4">
                           <ImageIcon size={24} className="mx-auto text-slate-500 mb-2" />
                           <p className="text-xs font-semibold text-slate-400">Click to upload your image</p>
                        </div>
                      )}
                   </div>
                </div>

                <div className={`transition-opacity ${uploadedImageUrl ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><MousePointerClick size={16} className="text-blue-500"/> Step 2: Select Location</h3>
                   <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-xs leading-relaxed flex gap-2">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      Hover over images in the live preview to the right. Click any highlighted image to apply your uploaded photo there.
                   </div>
                   
                   {selectedEditorId && (
                      <div className="mt-4 bg-slate-900 border border-slate-700 p-3 rounded-lg">
                         <span className="text-xs text-slate-400 block mb-1">Selected Location:</span>
                         <span className="text-sm font-bold text-white uppercase tracking-wider">{selectedEditorId.replace(/-/g, ' ')}</span>
                      </div>
                   )}
                </div>
                
                <div className={`transition-opacity ${uploadedImageUrl && selectedEditorId ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2"><Save size={16} className="text-green-500"/> Step 3: Publish</h3>
                   <button onClick={handlePublish} disabled={isPublishing} className="w-full bg-red-600 hover:bg-red-500 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all flex justify-center items-center gap-2">
                     {isPublishing ? 'Publishing...' : 'Publish to Live Website'}
                   </button>
                </div>
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 bg-slate-900 p-4 md:p-8 flex justify-center overflow-auto minimal-scrollbar">
            <div className={`bg-white border border-slate-800 shadow-2xl relative transition-all duration-300 ease-in-out ${device === 'desktop' ? 'w-full h-full rounded-xl' : device === 'tablet' ? 'w-[768px] h-full rounded-2xl' : 'w-[375px] h-full rounded-[2.5rem] border-[12px] border-slate-950'}`}>
               <iframe 
                 ref={iframeRef}
                 src="/?mode=editor" 
                 title="Live Preview" 
                 className="w-full h-full rounded-lg"
                 onLoad={(e) => {
                    try {
                       const doc = (e.target as HTMLIFrameElement).contentDocument;
                       const win = (e.target as HTMLIFrameElement).contentWindow;
                       if (doc && win) {
                          const style = doc.createElement('style');
                          style.innerHTML = `
                             [data-editor-id] { cursor: crosshair !important; position: relative; transition: all 0.2s; }
                             [data-editor-id]:hover { outline: 4px solid #ef4444 !important; outline-offset: 4px; border-radius: 4px; box-shadow: 0 0 20px rgba(239,68,68,0.5); z-index: 50; }
                             [data-editor-id]::after { content: 'Pin Photo Here'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #ef4444; color: white; padding: 8px 16px; border-radius: 8px; font-weight: bold; font-family: sans-serif; opacity: 0; pointer-events: none; transition: opacity 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.5); z-index: 51; }
                             [data-editor-id]:hover::after { opacity: 1; }
                             a { pointer-events: none !important; }
                          `;
                          doc.head.appendChild(style);

                          doc.body.addEventListener('click', ev => {
                            const el = (ev.target as HTMLElement).closest('[data-editor-id]');
                            if (el) {
                               ev.preventDefault();
                               ev.stopPropagation();
                               const editorId = el.getAttribute('data-editor-id');
                               if (editorId) {
                                 window.parent.postMessage({ type: 'EDITOR_LOCATION_SELECTED', payload: { id: editorId } }, '*');
                               }
                            }
                          }, true);
                          
                          win.addEventListener('message', ev => {
                             if (ev.data.type === 'APPLY_IMAGE') {
                                const target = doc.querySelector(`[data-editor-id="${ev.data.payload.id}"]`);
                                if (target && target.tagName === 'IMG') {
                                   (target as HTMLImageElement).src = ev.data.payload.src;
                                }
                             }
                          });
                       }
                    } catch (err) {
                       console.error("Iframe access error", err);
                    }
                 }}
               />
            </div>
         </div>
      </div>
    </div>
  );
}
