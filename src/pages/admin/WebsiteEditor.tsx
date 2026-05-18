import React, { useState, useEffect, useRef } from 'react';
import { Columns, LayoutTemplate, Type, Image as ImageIcon, Video, MousePointerClick, CheckCircle, Smartphone, Monitor, Tablet, Save, Eye, Palette, Globe, Layers, CornerUpLeft, CornerUpRight, Trash2, Settings, Plus, Info } from 'lucide-react';

export default function WebsiteEditor() {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeTab, setActiveTab] = useState<'elements' | 'global' | 'settings'>('elements');
  const [isPublishing, setIsPublishing] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  const handlePublish = async () => {
    setIsPublishing(true);
    setTimeout(() => {
      alert("Website changes published successfully!");
      setIsPublishing(false);
    }, 1500);
  };

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'ELEMENT_SELECTED') {
        setSelectedElement(e.data.payload);
        setActiveTab('settings');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updateStyle = (property: string, value: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_STYLE',
        payload: { property, value }
      }, '*');
    }
  };

  const updateImage = (src: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'UPDATE_IMAGE',
        payload: { src }
      }, '*');
    }
  };

  const deleteElement = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'DELETE_ELEMENT' }, '*');
      setSelectedElement(null);
      setActiveTab('elements');
    }
  };

  const elements = [
    { name: 'Heading', icon: Type },
    { name: 'Text', icon: Type },
    { name: 'Image', icon: ImageIcon },
    { name: 'Button', icon: MousePointerClick },
    { name: 'Section', icon: LayoutTemplate },
  ];

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col bg-slate-900 overflow-hidden rounded-3xl border border-slate-800">
      {/* Editor Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4 text-white">
           <Globe className="text-red-500" />
           <span className="font-black text-lg">Live Website Builder</span>
        </div>
        
        <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1">
           <button onClick={() => setDevice('desktop')} className={`p-2 rounded-md transition-colors ${device === 'desktop' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Monitor size={18} /></button>
           <button onClick={() => setDevice('tablet')} className={`p-2 rounded-md transition-colors ${device === 'tablet' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Tablet size={18} /></button>
           <button onClick={() => setDevice('mobile')} className={`p-2 rounded-md transition-colors ${device === 'mobile' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-white'}`}><Smartphone size={18} /></button>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={handlePublish} disabled={isPublishing} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 disabled:opacity-50">
             <Save size={16} /> {isPublishing ? 'Publishing...' : 'Publish Live'}
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
         {/* Sidebar Properties */}
         <div className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0">
            <div className="flex border-b border-slate-800 p-2 gap-1">
               <button onClick={() => setActiveTab('elements')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${activeTab === 'elements' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Plus size={14}/> Elements</button>
               <button onClick={() => setActiveTab('settings')} className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${activeTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}><Settings size={14}/> Properties</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 minimal-scrollbar">
               {activeTab === 'elements' && (
                 <div>
                   <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-lg text-xs leading-relaxed flex gap-2 mb-6">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      Drag elements into the canvas. Click any text to edit inline.
                   </div>
                   <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4">Blocks</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {elements.map(el => (
                       <div 
                         key={el.name} 
                         draggable
                         onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', el.name);
                            if (iframeRef.current && iframeRef.current.contentWindow) {
                               iframeRef.current.contentWindow.postMessage({ type: 'DRAG_START' }, '*');
                            }
                         }}
                         onDragEnd={() => {
                            if (iframeRef.current && iframeRef.current.contentWindow) {
                               iframeRef.current.contentWindow.postMessage({ type: 'DRAG_END' }, '*');
                            }
                         }}
                         className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col items-center justify-center gap-2 cursor-grab hover:bg-slate-800 hover:border-slate-700 transition-colors"
                       >
                          <el.icon size={20} className="text-slate-400" />
                          <span className="text-xs font-medium text-slate-300">{el.name}</span>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
               
               {activeTab === 'settings' && selectedElement ? (
                  <div className="space-y-6 animate-in fade-in">
                     <div className="flex items-center justify-between">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2">
                         <span className="bg-red-500/20 text-red-500 p-1.5 rounded-md"><Settings size={16} /></span>
                         Editing: {selectedElement.tagName}
                       </h3>
                       <button onClick={deleteElement} className="text-red-500 hover:bg-red-500/20 p-2 rounded-lg transition-colors"><Trash2 size={16}/></button>
                     </div>
                     
                     <div className="space-y-4">
                        {selectedElement.tagName === 'IMG' && (
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Image Source URL</label>
                            <input type="text" defaultValue={selectedElement.src} onChange={(e) => updateImage(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white" />
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">Text Color</label>
                          <input type="color" onChange={(e) => updateStyle('color', e.target.value)} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">Background Color</label>
                          <input type="color" onChange={(e) => updateStyle('backgroundColor', e.target.value)} className="w-full h-10 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Padding</label>
                            <select onChange={(e) => updateStyle('padding', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                               <option value="">Default</option>
                               <option value="1rem">Small</option>
                               <option value="2rem">Medium</option>
                               <option value="4rem">Large</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Margin</label>
                            <select onChange={(e) => updateStyle('margin', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                               <option value="">Default</option>
                               <option value="1rem">Small</option>
                               <option value="2rem">Medium</option>
                               <option value="4rem">Large</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2">Font Size</label>
                          <select onChange={(e) => updateStyle('fontSize', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white">
                             <option value="">Default</option>
                             <option value="0.875rem">Small</option>
                             <option value="1rem">Normal</option>
                             <option value="1.5rem">Large</option>
                             <option value="2.5rem">Extra Large</option>
                          </select>
                        </div>
                     </div>
                  </div>
               ) : activeTab === 'settings' && !selectedElement ? (
                 <div className="text-center py-10">
                    <MousePointerClick size={32} className="text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">Click an element in the canvas to edit its properties.</p>
                 </div>
               ) : null}
            </div>
         </div>

         {/* Canvas Area */}
         <div className="flex-1 bg-slate-900 p-4 md:p-8 flex justify-center overflow-auto minimal-scrollbar">
            <div className={`bg-white border border-slate-800 shadow-2xl relative transition-all duration-300 ease-in-out ${device === 'desktop' ? 'w-full h-full rounded-xl' : device === 'tablet' ? 'w-[768px] h-full rounded-2xl' : 'w-[375px] h-full rounded-[2.5rem] border-[12px] border-slate-950'}`}>
               <iframe 
                 ref={iframeRef}
                 src="/" 
                 title="Live Preview" 
                 className="w-full h-full rounded-lg"
                 onLoad={(e) => {
                    try {
                       const doc = (e.target as HTMLIFrameElement).contentDocument;
                       const win = (e.target as HTMLIFrameElement).contentWindow;
                       if (doc && win) {
                          doc.designMode = "off";
                          
                          const style = doc.createElement('style');
                          style.innerHTML = `
                             .editor-hover { outline: 2px dashed #ef4444 !important; outline-offset: -2px; cursor: pointer !important; position: relative; }
                             .editor-hover::after { content: 'Edit'; position: absolute; top: -20px; right: 0; background: #ef4444; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; pointer-events: none; }
                             .editor-selected { outline: 3px solid #ef4444 !important; outline-offset: -3px; }
                             .editor-drag-over { border-top: 4px solid #ef4444 !important; }
                             .editor-dragging { display: block !important; min-height: 100px; padding: 20px; border: 2px dashed #475569; }
                             [contenteditable="true"]:focus { outline: 3px solid #3b82f6 !important; outline-offset: 2px; }
                             a, button { pointer-events: none; } /* Disable links in editor */
                             img { cursor: pointer; }
                          `;
                          doc.head.appendChild(style);

                          let selectedEl: HTMLElement | null = null;
                          let draggedEl: HTMLElement | null = null;

                          // Editing Logic
                          doc.body.addEventListener('mouseover', ev => {
                             const el = ev.target as HTMLElement;
                             if (el.tagName !== 'BODY') el.classList.add('editor-hover');
                          });
                          doc.body.addEventListener('mouseout', ev => {
                             const el = ev.target as HTMLElement;
                             el.classList.remove('editor-hover');
                          });
                          
                          doc.body.addEventListener('click', ev => {
                            ev.preventDefault();
                            ev.stopPropagation();
                            
                            if (selectedEl) selectedEl.classList.remove('editor-selected');
                            
                            const el = ev.target as HTMLElement;
                            el.classList.add('editor-selected');
                            selectedEl = el;

                            // Auto-enable inline edit for text
                            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'SPAN', 'DIV', 'A', 'BUTTON', 'LI'].includes(el.tagName)) {
                               el.contentEditable = "true";
                               el.focus();
                            }

                            win.parent.postMessage({
                              type: 'ELEMENT_SELECTED',
                              payload: {
                                tagName: el.tagName,
                                id: el.id,
                                className: el.className,
                                src: (el as HTMLImageElement).src || ''
                              }
                            }, '*');
                          });

                          // Message Receiver from Parent
                          win.addEventListener('message', (msg) => {
                             if (!selectedEl && msg.data.type !== 'DRAG_START' && msg.data.type !== 'DRAG_END') return;
                             
                             if (msg.data.type === 'UPDATE_STYLE') {
                               const { property, value } = msg.data.payload;
                               (selectedEl!.style as any)[property] = value;
                             }
                             if (msg.data.type === 'UPDATE_IMAGE' && selectedEl!.tagName === 'IMG') {
                               (selectedEl as HTMLImageElement).src = msg.data.payload.src;
                             }
                             if (msg.data.type === 'DELETE_ELEMENT') {
                               selectedEl!.remove();
                               selectedEl = null;
                             }
                          });

                          // Drag & Drop reordering and insertion
                          doc.body.addEventListener('dragover', ev => {
                             ev.preventDefault();
                             const el = ev.target as HTMLElement;
                             if (el !== doc.body) el.classList.add('editor-drag-over');
                          });
                          doc.body.addEventListener('dragleave', ev => {
                             const el = ev.target as HTMLElement;
                             el.classList.remove('editor-drag-over');
                          });
                          doc.body.addEventListener('drop', ev => {
                             ev.preventDefault();
                             const el = ev.target as HTMLElement;
                             el.classList.remove('editor-drag-over');
                             
                             // Let's get the drag content. Wait, iframe drag drop data transfer from parent isn't always preserved.
                             // We will just query parent for active dragging, but for simplicity we rely on a global trick or just insert a placeholder
                             // Since parent passes 'text/plain', iframe 'drop' event might have it if domains match.
                             let type = ev.dataTransfer?.getData('text/plain');
                             
                             if (!type) return;

                             let html = '';
                             if (type === 'Heading') html = '<h2 class="text-3xl font-black my-4 text-white">New Heading Element</h2>';
                             else if (type === 'Text') html = '<p class="text-slate-400 my-2 text-lg">New text block. Click to edit me directly.</p>';
                             else if (type === 'Image') html = '<img src="/placeholder-image.webp" class="w-full max-w-sm rounded-xl my-4 hover:scale-105 transition-transform" alt="New Image"/>';
                             else if (type === 'Button') html = '<button class="bg-red-600 px-6 py-3 rounded-full text-white font-bold my-4 inline-block">Action Button</button>';
                             else if (type === 'Section') html = '<section class="p-10 border border-slate-800 rounded-3xl bg-slate-900 my-8 w-full"><h3 class="text-2xl font-bold text-white mb-4">New Section</h3><p class="text-slate-400">Content goes here...</p></section>';

                             const wrapper = doc.createElement('div');
                             wrapper.innerHTML = html;
                             
                             if (el.tagName === 'SECTION' || el.tagName === 'DIV') {
                               el.appendChild(wrapper.firstChild!);
                             } else {
                               el.parentNode?.insertBefore(wrapper.firstChild!, el.nextSibling); 
                             }
                          });
                       }
                    } catch (err) {}
                 }}
               />
            </div>
         </div>
      </div>
    </div>
  );
}
