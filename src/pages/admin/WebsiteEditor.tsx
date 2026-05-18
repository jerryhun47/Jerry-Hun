import React, { useState } from 'react';
import { Columns, LayoutTemplate, Type, Image as ImageIcon, Video, MousePointerClick, CheckCircle, Smartphone, Monitor, Tablet, Save, Eye, Palette, Globe, Layers, CornerUpLeft, CornerUpRight, Trash2, Settings, Plus, Play, Info } from 'lucide-react';
import { db } from '../../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function WebsiteEditor() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'elements' | 'global' | 'media' | 'settings'>('elements');

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    // Simulate save functionality
    setTimeout(() => {
      alert("Website changes published successfully!");
      setIsPublishing(false);
    }, 1500);
  };

  const elements = [
    { name: 'Heading', icon: Type },
    { name: 'Text', icon: Type },
    { name: 'Image', icon: ImageIcon },
    { name: 'Video', icon: Video },
    { name: 'Button', icon: MousePointerClick },
    { name: 'Forms', icon: CheckCircle },
    { name: 'Sections', icon: LayoutTemplate },
    { name: 'Columns', icon: Columns },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 overflow-hidden rounded-3xl border border-slate-800">
      {/* Editor Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4 text-white">
           <Globe className="text-red-500" />
           <span className="font-black text-lg">Website Builder (Alpha)</span>
        </div>
        
        {/* Responsive Controls */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
           <button onClick={() => setDevice('desktop')} className={`p-2 rounded-md transition-colors ${device === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Monitor size={18} /></button>
           <button onClick={() => setDevice('tablet')} className={`p-2 rounded-md transition-colors ${device === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Tablet size={18} /></button>
           <button onClick={() => setDevice('mobile')} className={`p-2 rounded-md transition-colors ${device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Smartphone size={18} /></button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
           <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Undo"><CornerUpLeft size={18} /></button>
           <button className="p-2 text-slate-400 hover:text-white transition-colors" title="Redo"><CornerUpRight size={18} /></button>
           <div className="w-px h-6 bg-slate-800 mx-2"></div>
           <button className="px-4 py-2 text-sm font-bold text-slate-300 hover:text-white transition-colors flex items-center gap-2">
             <Eye size={16} /> Preview
           </button>
           <button onClick={handlePublish} disabled={isPublishing} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50">
             <Save size={16} /> {isPublishing ? 'Publishing...' : 'Publish Live'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Properties */}
         <div className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            {/* Tabs */}
            <div className="flex border-b border-slate-800 p-2 gap-1">
               <button onClick={() => setActiveTab('elements')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${activeTab === 'elements' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Plus size={14}/> Add</button>
               <button onClick={() => setActiveTab('global')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${activeTab === 'global' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Palette size={14}/> Global</button>
               <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Settings size={14}/> Page</button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 minimal-scrollbar">
               {activeTab === 'elements' && (
                 <div>
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Drag Elements</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {elements.map(el => (
                       <div 
                         key={el.name} 
                         draggable
                         onDragStart={(e) => e.dataTransfer.setData('text/plain', el.name)}
                         className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-slate-800 hover:border-slate-700 transition-colors"
                       >
                          <el.icon size={20} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-300">{el.name}</span>
                       </div>
                     ))}
                   </div>
                   
                   <div className="mt-8">
                     <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Saved Blocks</h3>
                     <div className="space-y-2">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm text-slate-400 flex items-center gap-2"><Layers size={14}/> Hero Section 1</div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-sm text-slate-400 flex items-center gap-2"><Layers size={14}/> Product Grid</div>
                     </div>
                   </div>
                 </div>
               )}

               {activeTab === 'global' && (
                  <div className="space-y-6">
                     <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Brand Colors</h3>
                        <div className="flex gap-2">
                           <div className="w-8 h-8 rounded-full bg-red-600 border-2 border-white cursor-pointer"></div>
                           <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 cursor-pointer"></div>
                           <div className="w-8 h-8 rounded-full bg-white border border-slate-200 cursor-pointer"></div>
                           <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 cursor-pointer flex items-center justify-center text-white"><Plus size={14}/></div>
                        </div>
                     </div>
                     <div>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Typography</h3>
                        <select className="w-full bg-slate-900 border border-slate-800 text-slate-300 rounded-lg p-2 text-sm mb-2">
                           <option>Inter (Sans Serif)</option>
                           <option>Roboto</option>
                           <option>Poppins</option>
                        </select>
                     </div>
                  </div>
               )}
               
               {activeTab === 'settings' && (
                  <div className="space-y-4">
                     <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-xs leading-relaxed flex gap-2">
                        <Info size={16} className="shrink-0 mt-0.5" />
                        Inline editing is active in the preview canvas. Click any text to edit directly.
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 bg-slate-900 p-4 md:p-8 flex justify-center overflow-auto minimal-scrollbar">
            <div className={`bg-slate-950 border border-slate-800 shadow-2xl relative transition-all duration-300 ease-in-out ${device === 'desktop' ? 'w-full h-full rounded-2xl' : device === 'tablet' ? 'w-[768px] h-full rounded-3xl' : 'w-[375px] h-full rounded-[2.5rem] border-8'}`}>
               
               {/* Visual Builder Canvas Placeholder */}
               <div className="absolute inset-0 flex flex-col overflow-hidden bg-white">
                  <iframe 
                    src="/" 
                    title="Live Preview" 
                    className="w-full h-full border-0"
                    onLoad={(e) => {
                       try {
                          const doc = (e.target as HTMLIFrameElement).contentDocument;
                          if (doc) {
                             doc.designMode = "off";
                             
                             const style = doc.createElement('style');
                             style.innerHTML = `
                                .editor-hover { outline: 2px dashed #3b82f6 !important; cursor: pointer !important; }
                                .editor-drag-over { outline: 2px dashed #10b981 !important; background-color: rgba(16,185,129,0.1) !important; }
                                [contenteditable="true"]:focus { outline: 2px solid #3b82f6 !important; background-color: rgba(59,130,246,0.05); }
                             `;
                             doc.head.appendChild(style);

                             // Editable logic
                             doc.body.addEventListener('mouseover', ev => {
                                if (ev.target.tagName !== 'BODY') ev.target.classList.add('editor-hover');
                             });
                             doc.body.addEventListener('mouseout', ev => {
                                ev.target.classList.remove('editor-hover');
                             });
                             doc.body.addEventListener('click', ev => {
                               const tag = ev.target.tagName;
                               if (['A', 'BUTTON'].includes(tag)) ev.preventDefault();
                               
                               if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'A', 'BUTTON', 'LI', 'TD'].includes(tag)) {
                                  ev.target.contentEditable = "true";
                                  ev.target.focus();
                               }
                             });

                             // Drag & Drop logic
                             doc.body.addEventListener('dragover', ev => {
                                ev.preventDefault(); // allow drop
                                if (ev.target.tagName !== 'BODY') ev.target.classList.add('editor-drag-over');
                             });
                             doc.body.addEventListener('dragleave', ev => {
                                ev.target.classList.remove('editor-drag-over');
                             });
                             doc.body.addEventListener('drop', ev => {
                                ev.preventDefault();
                                ev.target.classList.remove('editor-drag-over');
                                const type = ev.dataTransfer.getData('text/plain');
                                if (!type) return;

                                let html = '';
                                if (type === 'Heading') html = '<h2 class="text-3xl font-bold my-4">New Heading</h2>';
                                else if (type === 'Text') html = '<p class="text-slate-500 my-2">New text block. Edit me directly.</p>';
                                else if (type === 'Image') html = '<img src="/Client_Review.png" class="w-full max-w-sm h-auto rounded-lg my-4 object-cover" alt="New Image"/>';
                                else if (type === 'Video') html = '<div class="w-full aspect-video bg-slate-800 rounded-xl flex items-center justify-center text-white my-4 font-bold">Video Placeholder (Click to edit link)</div>';
                                else if (type === 'Button') html = '<button class="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-bold my-4 text-sm transition-all shadow-lg hover:scale-105 cursor-pointer">Click Me</button>';
                                else if (type === 'Sections') html = '<div class="p-10 border-2 border-dashed border-slate-300 rounded-xl my-4 text-center">New Section Area</div>';
                                else html = '<div class="p-4 border border-dashed border-blue-500 my-2">' + type + '</div>';

                                const div = doc.createElement('div');
                                div.innerHTML = html;
                                ev.target.appendChild(div.firstChild);
                             });
                          }
                       } catch (err) {}
                    }}
                  />
               </div>
               
               {/* Elementor-like hover overlays */}
            </div>
         </div>
      </div>
    </div>
  );
}

function EditIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
}
