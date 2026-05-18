import React, { useState, useEffect } from 'react';
import { db, auth, signOut } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { LayoutDashboard, ShoppingBag, MessageSquare, Package, LogOut, Plus, Trash2, Edit, X, Menu, DollarSign as DollarSign2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebsiteEditor from './WebsiteEditor';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, messages: 0 });
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  const navigate = useNavigate();

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const pSnap = await getDocs(collection(db, 'products'));
      const oSnap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      const cSnap = await getDocs(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')));
      const tSnap = await getDocs(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')));
      
      const pData: any[] = pSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const oData: any[] = oSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const cData: any[] = cSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const tData: any[] = tSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setProducts(pData);
      setOrders(oData);
      setContacts(cData);
      setTransactions(tData);

      setStats({
        products: pData.length,
        orders: oData.length,
        revenue: oData.filter(o => o.status === 'confirmed' || o.status === 'delivered').reduce((acc, curr) => acc + (curr.total_price || 0), 0),
        messages: cData.filter(c => !c.is_read).length
      });
    } catch (e) {
       console.error("Error fetching data:", e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
           <div className="flex flex-col">
             <span className="font-bold text-xl text-white tracking-tight">Jerry<span className="text-red-500">Automation</span></span>
             <span className="block text-xs text-slate-500 mt-1 uppercase tracking-widest font-black">Admin Panel</span>
           </div>
           <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto minimal-scrollbar text-sm">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
            { id: 'analytics', icon: LayoutDashboard, label: 'Analytics' },
            { id: 'products', icon: Package, label: 'Products (Tools)' },
            { id: 'courses', icon: Package, label: 'Courses' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders', badge: orders.filter(o=>o.status==='pending').length },
            { id: 'transactions', icon: ShoppingBag, label: 'Payments', badge: transactions.filter(t=>t.status==='pending').length },
            { id: 'paymentsettings', icon: LayoutDashboard, label: 'Payment Accounts' },
            { id: 'messages', icon: MessageSquare, label: 'Inbox', badge: stats.messages },
            { id: 'users', icon: LayoutDashboard, label: 'Users' },
            { id: 'announcements', icon: MessageSquare, label: 'Announcements' },
            { id: 'discounts', icon: ShoppingBag, label: 'Discounts' },
            { id: 'reviews', icon: MessageSquare, label: 'Reviews' },
            { id: 'website_builder', icon: Edit, label: 'Live Website Editor' },
            { id: 'broadcasts', icon: MessageSquare, label: 'Broadcasts' },
            { id: 'banners', icon: LayoutDashboard, label: 'Banners' },
            { id: 'media', icon: LayoutDashboard, label: 'Media Manager' },
            { id: 'seo', icon: LayoutDashboard, label: 'SEO Settings' },
            { id: 'notifications', icon: MessageSquare, label: 'Notifications' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-500/20' : 'hover:bg-slate-800 hover:text-white'}`}>
               <div className="flex items-center gap-3"><tab.icon size={16} /> {tab.label}</div>
               {(tab.badge && tab.badge > 0) ? <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white text-red-600' : 'bg-red-600 text-white'}`}>{tab.badge}</span> : null}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors text-slate-400">
              <LogOut size={18} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full h-screen relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center sticky top-0 z-30">
           <span className="font-bold text-lg">Admin Dashboard</span>
           <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200"><Menu size={24}/></button>
        </div>
        
        <div className="max-w-6xl mx-auto p-4 md:p-8">
           
           {activeTab === 'overview' && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div>
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Dashboard Overview</h1>
                  <p className="text-slate-500">Welcome back, Admin. Here is what is happening today.</p>
               </div>
               
               <div className="grid md:grid-cols-4 gap-6">
                 {[
                   { label: 'Total Revenue', value: `PKR ${stats.revenue.toLocaleString()}`, icon: DollarSign2 },
                   { label: 'Total Orders', value: stats.orders, icon: ShoppingBag },
                   { label: 'Total Products', value: stats.products, icon: Package },
                   { label: 'Unread Messages', value: stats.messages, icon: MessageSquare }
                 ].map((stat, i) => (
                   <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow">
                      <div className="flex items-center justify-between mb-4">
                         <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center"><stat.icon size={24} /></div>
                      </div>
                      <p className="text-slate-500 font-medium">{stat.label}</p>
                      <h3 className="text-3xl font-black mt-1 text-slate-900">{stat.value}</h3>
                   </div>
                 ))}
               </div>
               
               <div className="bg-white p-8 rounded-3xl border border-slate-200 card-shadow mt-8">
                  <h3 className="text-xl font-bold mb-6">Recent Orders</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                       <thead>
                         <tr className="text-slate-400 border-b border-slate-100 uppercase text-xs tracking-wider">
                            <th className="pb-4 font-semibold">Customer</th>
                            <th className="pb-4 font-semibold">Products</th>
                            <th className="pb-4 font-semibold">Total</th>
                            <th className="pb-4 font-semibold">Status</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                         {orders.slice(0,5).map(o => (
                            <tr key={o.id}>
                               <td className="py-4">
                                  <p className="font-bold">{o.customer_name}</p>
                                  <p className="text-sm text-slate-500">{o.customer_email}</p>
                               </td>
                               <td className="py-4 text-sm text-slate-600">{o.products?.length || 0} items</td>
                               <td className="py-4 font-bold">PKR {o.total_price?.toLocaleString()}</td>
                               <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                     {o.status}
                                  </span>
                               </td>
                            </tr>
                         ))}
                         {orders.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-500">No orders yet.</td></tr>}
                       </tbody>
                    </table>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'analytics' && <AnalyticsManager />}
           {activeTab === 'products' && <ProductsManager products={products} type="Tool" refresh={fetchData} />}
           {activeTab === 'courses' && <ProductsManager products={products} type="Course" refresh={fetchData} />}
           {activeTab === 'orders' && <OrdersManager orders={orders} refresh={fetchData} />}
           {activeTab === 'transactions' && <TransactionsManager transactions={transactions} refresh={fetchData} />}
           {activeTab === 'paymentsettings' && <PaymentSettingsManager />}
           {activeTab === 'messages' && <MessagesManager contacts={contacts} refresh={fetchData} />}
           {activeTab === 'reviews' && <ReviewsManager />}
           {activeTab === 'announcements' && <AnnouncementsManager />}
           {activeTab === 'website_builder' && <div className="h-[calc(100vh-6rem)] -m-4 sm:-m-8"><WebsiteEditor /></div>}
           
           {['users', 'discounts', 'broadcasts', 'banners', 'media', 'seo', 'notifications'].includes(activeTab) && (
              <PlaceholderManager tabName={activeTab} />
           )}

        </div>
      </main>
    </div>
  );
}

function ProductsManager({ products, type, refresh }: { products: any[], type: string, refresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [formData, setFormData] = useState({ 
     name: '', price: 0, category: type, description: '', is_active: true, badge: '',
     imageLink: '', videoLink: '', logoBase64: '', detail: ''
  });
  const [lessons, setLessons] = useState<any[]>([]);

  const filteredProducts = products.filter(p => type === 'Course' ? p.category === 'Course' : p.category !== 'Course');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
       const productData = { ...formData, lessons, updatedAt: serverTimestamp() };
       if (editingId) {
          await updateDoc(doc(db, 'products', editingId), productData);
       } else {
          await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp(), features: [] });
       }
       setShowModal(false);
       setFormData({ name: '', price: 0, category: type, description: '', is_active: true, badge: '', imageLink: '', videoLink: '', logoBase64: '', detail: '' });
       setLessons([]);
       setEditingId(null);
       refresh();
    } catch (err) {
       console.error("Error saving product:", err);
       alert("Error saving product.");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
       await deleteDoc(doc(db, 'products', id));
       refresh();
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Products Management</h2>
            <p className="text-slate-500">Add, edit or disable your tools and courses.</p>
          </div>
          <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
             <Plus size={18} /> Add Product
          </button>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Product</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Category</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Price</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Status</th>
                 <th className="px-6 py-4 font-semibold text-right text-slate-500 uppercase text-xs">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredProducts.map(p => (
                 <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                       <div className="font-bold">{p.name}</div>
                       <div className="text-xs text-slate-500">{p.badge}</div>
                    </td>
                    <td className="px-6 py-4 text-sm"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{p.category}</span></td>
                    <td className="px-6 py-4 font-bold">PKR {p.price.toLocaleString()}</td>
                    <td className="px-6 py-4">
                       {p.is_active ? <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold">Active</span> : <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold">Inactive</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => { setFormData({ name: '', price: 0, category: type, description: '', is_active: true, badge: '', imageLink: '', videoLink: '', logoBase64: '', detail: '', ...p} as any); setLessons(p.lessons || []); setEditingId(p.id); setShowModal(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"><Edit size={16}/></button>
                       <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 size={16}/></button>
                    </td>
                 </tr>
               ))}
               {filteredProducts.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-slate-500">No {type === 'Course' ? 'courses' : 'products'} found. Add some to get started.</td></tr>}
             </tbody>
          </table>
       </div>

       {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto">
               <h3 className="text-2xl font-black mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
               <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="block text-sm font-semibold mb-1">Product Name</label><input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-1">Price (PKR)</label><input required type="number" min="0" value={formData.price} onChange={e=>setFormData({...formData, price: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                    <div><label className="block text-sm font-semibold mb-1">Category</label>
                      <select required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                         <option value="Course">Course</option>
                         <option value="Tool">Tool</option>
                         <option value="Bundle">Bundle</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-1">Badge (Optional)</label><input type="text" value={formData.badge} onChange={e=>setFormData({...formData, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. Best Seller" /></div>
                    <div className="flex items-center mt-6">
                       <label className="flex items-center gap-2 cursor-pointer">
                         <input type="checkbox" checked={formData.is_active} onChange={e=>setFormData({...formData,is_active: e.target.checked})} className="w-5 h-5 text-red-600 rounded border-slate-300" />
                         <span className="font-semibold">Active in Store</span>
                       </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-1">Image Link (Optional)</label><input type="text" value={formData.imageLink} onChange={e=>setFormData({...formData, imageLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="https://" /></div>
                    <div><label className="block text-sm font-semibold mb-1">Video Link (Optional)</label><input type="text" value={formData.videoLink} onChange={e=>setFormData({...formData, videoLink: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="YouTube URL" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1">Product Logo Upload / Link</label>
                      <input 
                        type="text"
                        placeholder="Image URL..."
                        value={formData.logoBase64}
                        onChange={e => setFormData({...formData, logoBase64: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-sm mb-2"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const dataUrl = event.target?.result as string;
                              const img = new Image();
                              img.onload = () => {
                                try {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 500;
                                  let scaleSize = 1;
                                  if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
                                  canvas.width = img.width * scaleSize;
                                  canvas.height = img.height * scaleSize;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                                  setFormData({...formData, logoBase64: canvas.toDataURL('image/webp', 0.5)});
                                } catch (err) {
                                  setFormData({...formData, logoBase64: dataUrl});
                                }
                              };
                              img.onerror = () => setFormData({...formData, logoBase64: dataUrl});
                              img.src = dataUrl;
                            };
                            reader.readAsDataURL(file);
                          }
                        }} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-sm" 
                      />
                      {formData.logoBase64 && <img src={formData.logoBase64} alt="Preview" className="h-10 mt-2 object-contain" />}
                    </div>
                  </div>
                  <div><label className="block text-sm font-semibold mb-1">Short Description</label><textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="Write a short description..."></textarea></div>
                  <div><label className="block text-sm font-semibold mb-1">Product Detail (Rich Content/Paragraph)</label><textarea value={formData.detail} onChange={e=>setFormData({...formData, detail: e.target.value})} rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="Write full product detail here... Markdown is supported."></textarea></div>

                  {formData.category === 'Course' && (
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 mt-4">
                       <div className="flex justify-between items-center mb-4">
                         <h4 className="font-bold">Course Lessons</h4>
                         <button type="button" onClick={() => setLessons([...lessons, { title: '', duration: '', videoLink: '', content: '' }])} className="text-sm bg-slate-200 hover:bg-slate-300 font-bold px-3 py-1 rounded-lg">Add Lesson</button>
                       </div>
                       <div className="space-y-4">
                         {lessons.map((lesson, idx) => (
                           <div key={idx} className="border border-slate-300 rounded-lg p-4 bg-white relative">
                             <button type="button" onClick={() => setLessons(lessons.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
                             <div className="grid grid-cols-2 gap-2 mb-2">
                               <div><label className="text-xs font-bold text-slate-500">Lesson Title</label><input type="text" value={lesson.title} onChange={e => { const newL = [...lessons]; newL[idx].title = e.target.value; setLessons(newL); }} className="w-full border rounded px-2 py-1 text-sm" /></div>
                               <div><label className="text-xs font-bold text-slate-500">Duration (e.g. 15 min)</label><input type="text" value={lesson.duration} onChange={e => { const newL = [...lessons]; newL[idx].duration = e.target.value; setLessons(newL); }} className="w-full border rounded px-2 py-1 text-sm" /></div>
                             </div>
                             <div className="mb-2"><label className="text-xs font-bold text-slate-500">Video URL</label><input type="text" value={lesson.videoLink} onChange={e => { const newL = [...lessons]; newL[idx].videoLink = e.target.value; setLessons(newL); }} className="w-full border rounded px-2 py-1 text-sm" placeholder="https://" /></div>
                             <div><label className="text-xs font-bold text-slate-500">Text Content</label><textarea value={lesson.content} onChange={e => { const newL = [...lessons]; newL[idx].content = e.target.value; setLessons(newL); }} className="w-full border rounded px-2 py-1 text-sm" rows={2}></textarea></div>
                           </div>
                         ))}
                         {lessons.length === 0 && <p className="text-sm text-slate-500 text-center py-2">No lessons added. Click "Add Lesson" to curriculum.</p>}
                       </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white">Save Product</button>
                  </div>
               </form>
             </div>
          </div>
       )}
    </div>
  )
}

function OrdersManager({ orders, refresh }: { orders: any[], refresh: () => void }) {
  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
      refresh();
    } catch (e) {
      console.error(e);
      alert("Error updating order");
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div>
          <h2 className="text-2xl font-black">Orders Management</h2>
          <p className="text-slate-500">Manage and fulfill customer orders.</p>
       </div>
       <div className="grid gap-4">
          {orders.map(o => (
             <div key={o.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow flex flex-col md:flex-row justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{o.customer_name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {o.status}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">{o.id}</span>
                   </div>
                   <div className="text-sm text-slate-600 mb-4 space-y-1">
                      <p><strong className="text-slate-900">Email:</strong> {o.customer_email}</p>
                      <p><strong className="text-slate-900">WhatsApp:</strong> {o.customer_phone}</p>
                      <p><strong className="text-slate-900">Payment Method:</strong> <span className="capitalize">{o.payment_method}</span></p>
                      {o.notes && <p className="bg-slate-50 p-2 rounded border border-slate-100 italic">"{o.notes}"</p>}
                   </div>
                   <div>
                     <strong className="text-xs text-slate-400 uppercase tracking-wider mb-2 block">Items Ordered:</strong>
                     <ul className="space-y-1">
                        {o.products?.map((p: any, i: number) => (
                           <li key={i} className="text-sm font-medium">1x {p.name} <span className="text-slate-400">- PKR {p.price?.toLocaleString()}</span></li>
                        ))}
                     </ul>
                     <p className="font-black text-xl mt-3 text-red-600">Total: PKR {o.total_price?.toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex flex-col gap-2 min-w-[200px]">
                   <label className="text-xs font-bold text-slate-500 uppercase">Change Status</label>
                   <select 
                     value={o.status} 
                     onChange={(e) => updateStatus(o.id, e.target.value)}
                     className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-semibold"
                   >
                     <option value="pending">Pending</option>
                     <option value="confirmed">Confirmed</option>
                     <option value="delivered">Delivered</option>
                     <option value="cancelled">Cancelled</option>
                   </select>
                </div>
             </div>
          ))}
          {orders.length === 0 && <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">No orders received yet.</div>}
       </div>
    </div>
  )
}

function TransactionsManager({ transactions, refresh }: { transactions: any[], refresh: () => void }) {
  const updateStatus = async (id: string, status: string, userEmail?: string, itemType?: string) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status, updatedAt: serverTimestamp() });
      refresh();
      
      if (status === 'approved' && userEmail) {
        try {
          const body = `
            <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; color: #333;">
              <h2 style="color: #ef4444;">Order Confirmed!</h2>
              <p>Hello,</p>
              <p>Your payment for <strong>${itemType || 'your item'}</strong> has been verified. Thank you for your purchase!</p>
              <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; color: #0f172a;">Your Access Credentials</h3>
                <p><strong>Email:</strong> Jerrytools121@gmail.com</p>
                <p><strong>Password:</strong> Tesla@123</p>
              </div>
              <p>If you have any questions, feel free to contact us.</p>
              <p>Best regards,<br/>Jerry Automation</p>
            </div>
          `;

          await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: userEmail,
              subject: 'Order Confirmation & Access Details - Jerry Automation',
              body
            })
          });
          alert("Order approved and access email sent successfully.");
        } catch (err) {
          console.error("Failed to send email", err);
          alert("Approved, but failed to send email. Ensure SMTP is configured.");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Error updating transaction");
    }
  }

  const handleDelete = async (id: string) => {
     if(confirm('Delete this transaction?')) {
        await deleteDoc(doc(db, 'transactions', id));
        refresh();
     }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Payments (Proofs) Management</h2>
            <p className="text-slate-500">Approve or reject uploaded payment proofs.</p>
          </div>
       </div>

       <div className="grid gap-4">
          {transactions.map((t: any) => (
             <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{t.userEmail}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${t.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {t.status}
                      </span>
                      {t.itemType && <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs uppercase">{t.itemType}</span>}
                   </div>
                   
                   <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                     {t.items ? (
                        <>
                           <strong>Items: </strong> 
                           {t.items.map((i:any) => i.name).join(', ')}
                        </>
                     ) : (
                        <>
                           <strong>Item: </strong> {t.itemTitle}
                        </>
                     )}
                     <br/>
                     <strong>Amount: </strong> PKR {t.price?.toLocaleString()}
                   </div>
                   
                   {t.proofBase64 && (
                     <div className="mt-4">
                        <p className="text-xs font-bold uppercase text-slate-500 mb-2">Payment Screenshot</p>
                        <a href={t.proofBase64} target="_blank" rel="noreferrer" className="inline-block border border-slate-200 rounded-lg p-1 hover:border-blue-500 transition-colors">
                           <img src={t.proofBase64} alt="Proof" className="h-32 object-contain bg-slate-100 rounded" />
                        </a>
                     </div>
                   )}
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                   <label className="text-xs font-bold text-slate-500 uppercase">Action</label>
                   {t.status === 'pending' && (
                     <>
                        <button onClick={() => updateStatus(t.id, 'approved', t.userEmail, t.itemType)} className="px-4 py-2 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200">Approve Access</button>
                        <button onClick={() => updateStatus(t.id, 'rejected')} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 mt-2">Reject Image</button>
                     </>
                   )}
                   {t.status !== 'pending' && (
                     <button onClick={() => updateStatus(t.id, 'pending')} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 mt-auto">Revert to Pending</button>
                   )}
                   <button onClick={() => handleDelete(t.id)} className="px-4 py-2 bg-slate-50 text-red-600 hover:text-red-700 font-bold rounded-xl border border-slate-200 hover:bg-red-50 mt-2">Delete Record</button>
                </div>
             </div>
          ))}
          {transactions.length === 0 && <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">No payment proofs uploaded yet.</div>}
       </div>
    </div>
  )
}

function MessagesManager({ contacts, refresh }: { contacts: any[], refresh: () => void }) {
  const markRead = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { is_read: !current });
      refresh();
    } catch(e) {
      console.error(e);
    }
  }

  const handleDelete = async (id: string) => {
     if(confirm('Delete message?')) {
        await deleteDoc(doc(db, 'contacts', id));
        refresh();
     }
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div>
          <h2 className="text-2xl font-black">Messages Management</h2>
          <p className="text-slate-500">View and respond to contact form submissions.</p>
       </div>
       <div className="grid gap-4">
          {contacts.map(c => (
             <div key={c.id} className={`p-6 rounded-3xl border card-shadow flex flex-col md:flex-row justify-between gap-6 transition-colors ${c.is_read ? 'bg-white border-slate-200' : 'bg-red-50/50 border-red-100'}`}>
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{c.name}</h3>
                      {!c.is_read && <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase">New</span>}
                   </div>
                   <div className="text-sm text-slate-600 mb-4 bg-white/50 p-3 rounded-lg flex items-center gap-4 border border-slate-100">
                      <span><strong>Email:</strong> <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a></span>
                      <span><strong>Phone:</strong> {c.phone || 'N/A'}</span>
                      <span className="capitalize"><strong>Subject:</strong> {c.subject}</span>
                   </div>
                   <p className="text-slate-800 whitespace-pre-wrap">{c.message}</p>
                </div>
                <div className="flex flex-col gap-2 min-w-[150px]">
                   <button onClick={() => markRead(c.id, c.is_read)} className={`px-4 py-2 rounded-xl font-bold border transition-colors ${c.is_read ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600' : 'bg-red-100 border-red-200 text-red-700 hover:bg-red-200'}`}>
                      {c.is_read ? 'Mark Unread' : 'Mark Read'}
                   </button>
                   <button onClick={() => handleDelete(c.id)} className="px-4 py-2 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors">
                      Delete
                   </button>
                </div>
             </div>
          ))}
          {contacts.length === 0 && <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">No messages.</div>}
       </div>
    </div>
  )
}

function AnalyticsManager() {
  const [visitors, setVisitors] = React.useState<any[]>([]);
  const [activeUsers, setActiveUsers] = React.useState(0);

  React.useEffect(() => {
     const fetchVisitors = async () => {
        try {
           const snap = await getDocs(query(collection(db, 'visitors'), orderBy('lastActive', 'desc')));
           const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
           setVisitors(data);
           
           const twoMinsAgo = Date.now() - 120000;
           const active = data.filter((v: any) => v.lastActive && v.lastActive.toMillis() > twoMinsAgo).length;
           setActiveUsers(active);
        } catch(e) {
           console.error("Error fetching visitors", e);
        }
     };

     fetchVisitors();
     const interval = setInterval(fetchVisitors, 10000);
     return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
         <div>
           <h2 className="text-2xl font-black text-slate-800">Visitor Analytics</h2>
           <p className="text-slate-500">Real-time traffic and user insights.</p>
         </div>
         <div className="text-right">
            <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-xs">Live Updates</span>
         </div>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Active Users</h3>
            <div className="text-4xl font-black text-red-600 flex items-center gap-2 mt-2">
               <span className="relative flex h-4 w-4">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
               </span>
               {activeUsers}
            </div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Total Visitors</h3>
            <div className="text-4xl font-black text-slate-800 mt-2">{visitors.length}</div>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Recent Sessions</h3>
            <div className="text-4xl font-black text-slate-800 mt-2">{visitors.filter(v => v.timestamp && v.timestamp.toMillis() > Date.now() - 86400000).length}</div>
            <p className="text-xs text-slate-400 mt-1 font-bold">Today</p>
         </div>
         <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-slate-500 font-bold mb-1 uppercase text-xs tracking-wider">Returning vs New</h3>
            <div className="text-xl font-bold mt-2 text-slate-800">
               N/A <span className="text-sm font-normal text-slate-500">(Pending)</span>
            </div>
         </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
           <h3 className="font-bold text-lg text-slate-800">Recent Visitors</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Path</th>
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">OS / Browser</th>
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Last Active</th>
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {visitors.slice(0, 10).map(v => {
                     const isActive = v.lastActive && v.lastActive.toMillis() > Date.now() - 120000;
                     return (
                     <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-slate-800">{v.path || '/'}</td>
                        <td className="py-4 px-6 text-sm text-slate-500 max-w-xs truncate" title={v.userAgent}>{v.userAgent}</td>
                        <td className="py-4 px-6 text-sm text-slate-500">
                           {v.lastActive ? new Date(v.lastActive.toMillis()).toLocaleTimeString() : 'Unknown'}
                        </td>
                        <td className="py-4 px-6">
                           {isActive ? (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Online</span>
                           ) : (
                              <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold uppercase">Offline</span>
                           )}
                        </td>
                     </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
       </div>

       {/* Simplified Graph placeholder */}
       <div className="bg-slate-900 rounded-3xl p-6 text-center shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 via-slate-900 to-slate-900"></div>
          <h3 className="font-bold text-white mb-6 relative z-10">Traffic Overview</h3>
          <div className="h-48 flex items-end justify-center gap-2 relative z-10 px-4">
             {[40, 60, 45, 80, 50, 90, 70].map((h, i) => (
                <div key={i} className="w-12 bg-red-500/80 hover:bg-red-400 rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
             ))}
          </div>
          <div className="flex justify-center gap-8 mt-4 text-slate-400 text-sm relative z-10 font-bold">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
       </div>

    </div>
  )
}

function PlaceholderManager({ tabName }: { tabName: string }) {
  const formatName = (name: string) => name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in max-w-4xl">
       <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
         <div>
            <h2 className="text-2xl font-black text-slate-900">{formatName(tabName)} Management</h2>
            <p className="text-slate-500 mt-1">Configure {tabName} settings and properties for Jerry Automation.</p>
         </div>
         <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
            Save Settings
         </button>
       </div>

       <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
          <Package size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">{formatName(tabName)} Panel Activated</h3>
          <p className="text-slate-500 max-w-md mx-auto">This section is actively connected to the database but you do not have any {tabName} records yet.</p>
          <button className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-xl font-bold">
            + Create New {formatName(tabName)}
          </button>
       </div>
    </div>
  )
}

function PaymentSettingsManager() {
  const [methods, setMethods] = React.useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [formData, setFormData] = useState({ providerName: '', accountName: '', accountNumber: '', iban: '', logoUrl: '', qrBase64: '', isActive: true });

  const fetchMethods = async () => {
    const snap = await getDocs(collection(db, 'payment_methods'));
    setMethods(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  React.useEffect(() => { fetchMethods(); }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
       const reader = new FileReader();
       reader.onloadend = () => {
         const dataUrl = reader.result as string;
         const img = new Image();
         img.onload = () => {
           try {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 500;
             let scaleSize = 1;
             if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
             canvas.width = img.width * scaleSize;
             canvas.height = img.height * scaleSize;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
             setFormData({ ...formData, qrBase64: canvas.toDataURL('image/webp', 0.5) });
           } catch(err) {
             setFormData({ ...formData, qrBase64: dataUrl });
           }
         };
         img.onerror = () => setFormData({ ...formData, qrBase64: dataUrl });
         img.src = dataUrl;
       };
       reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
       await updateDoc(doc(db, 'payment_methods', editingId), { ...formData, updatedAt: serverTimestamp() });
    } else {
       await addDoc(collection(db, 'payment_methods'), { ...formData, createdAt: serverTimestamp() });
    }
    setShowModal(false);
    setFormData({ providerName: '', accountName: '', accountNumber: '', iban: '', logoUrl: '', qrBase64: '', isActive: true });
    setEditingId(null);
    fetchMethods();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      await deleteDoc(doc(db, 'payment_methods', id));
      fetchMethods();
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm animate-in fade-in max-w-5xl">
       <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-black text-slate-900">Payment Methods</h2>
            <p className="text-slate-500">Manage bank accounts, Easypaisa, and crypto addresses.</p>
         </div>
         <button onClick={() => setShowModal(true)} className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold">+ Add Method</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         {methods.map(m => (
           <div key={m.id} className="border border-slate-200 rounded-2xl p-6 relative group hover:border-red-500 transition-colors">
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setFormData(m as any); setEditingId(m.id); setShowModal(true); }} className="p-1.5 bg-slate-100 hover:bg-white rounded-lg shadow"><Edit size={14}/></button>
                <button onClick={() => handleDelete(m.id)} className="p-1.5 bg-red-100 hover:bg-white text-red-600 rounded-lg shadow"><Trash2 size={14}/></button>
              </div>
              <div className="flex items-center gap-3 mb-4">
                {m.logoUrl ? <img src={m.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-full" /> : <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">{m.providerName[0]}</div>}
                <div>
                   <h3 className="font-bold text-lg leading-tight">{m.providerName}</h3>
                   <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${m.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>{m.isActive ? 'Active' : 'Disabled'}</span>
                </div>
              </div>
              <div className="space-y-1 text-sm text-slate-600">
                 <p><span className="font-semibold text-slate-400 w-16 inline-block">Name:</span> <b>{m.accountName}</b></p>
                 <p><span className="font-semibold text-slate-400 w-16 inline-block">Number:</span> <b>{m.accountNumber}</b></p>
                 {m.iban && <p><span className="font-semibold text-slate-400 w-16 inline-block">IBAN:</span> <b className="text-xs break-all">{m.iban}</b></p>}
              </div>
              {m.qrBase64 && (
                 <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                   <div className="w-12 h-12 bg-slate-100 p-1 rounded-lg border border-slate-200">
                     <img src={m.qrBase64} alt="QR" className="w-full h-full object-contain" />
                   </div>
                   <span className="text-xs font-bold text-slate-400">QR Code Attached</span>
                 </div>
              )}
           </div>
         ))}
         {methods.length === 0 && <div className="col-span-full text-center py-12 text-slate-400">No payment methods configured.</div>}
       </div>

       {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
             <button onClick={() => { setShowModal(false); setEditingId(null); setFormData({ providerName: '', accountName: '', accountNumber: '', iban: '', logoUrl: '', qrBase64: '', isActive: true }); }} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
             <h2 className="text-2xl font-black mb-6">{editingId ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
             <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-1">Provider (e.g. Easypaisa, Meezan)</label><input required type="text" value={formData.providerName} onChange={e=>setFormData({...formData, providerName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                  <div><label className="block text-sm font-semibold mb-1">Account Title (Name)</label><input required type="text" value={formData.accountName} onChange={e=>setFormData({...formData, accountName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold mb-1">Account Number</label><input required type="text" value={formData.accountNumber} onChange={e=>setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                  <div><label className="block text-sm font-semibold mb-1">IBAN (Optional)</label><input type="text" value={formData.iban} onChange={e=>setFormData({...formData, iban: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="PK..." /></div>
                </div>
                <div><label className="block text-sm font-semibold mb-1">Provider Logo URL (Optional)</label><input type="text" value={formData.logoUrl} onChange={e=>setFormData({...formData, logoUrl: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="https://" /></div>
                
                <div className="border border-slate-200 p-4 rounded-xl bg-slate-50 mt-4">
                   <label className="block text-sm font-semibold mb-2">QR Code Image (Optional)</label>
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 cursor-pointer" />
                   {formData.qrBase64 && (
                     <div className="mt-4 w-24 h-24 border border-slate-300 rounded-lg overflow-hidden bg-white">
                        <img src={formData.qrBase64} alt="QR Preview" className="w-full h-full object-contain" />
                     </div>
                   )}
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                   <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e=>setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-red-600 rounded border-slate-300" />
                   <label htmlFor="isActive" className="text-sm font-semibold">Method is actively accepting payments</label>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <button type="submit" className="px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white w-full">Save Payment Method</button>
                </div>
             </form>
          </div>
        </div>
       )}
    </div>
  );
}

function ReviewsManager() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', city: '', text: '', rating: 5, image: '' });

  const fetchReviews = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
      setReviews(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', id), { approved: !currentStatus });
      fetchReviews();
    } catch (err) {
      alert("Error toggling status");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this review?")) {
      await deleteDoc(doc(db, 'reviews', id));
      fetchReviews();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
         const dataUrl = reader.result as string;
         const img = new Image();
         img.onload = () => {
           try {
             const canvas = document.createElement('canvas');
             const MAX_WIDTH = 500;
             let scaleSize = 1;
             if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
             canvas.width = img.width * scaleSize;
             canvas.height = img.height * scaleSize;
             const ctx = canvas.getContext('2d');
             ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
             setNewReview({ ...newReview, image: canvas.toDataURL('image/webp', 0.5) });
           } catch(err) {
             setNewReview({ ...newReview, image: dataUrl });
           }
         };
         img.onerror = () => setNewReview({ ...newReview, image: dataUrl });
         img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'reviews'), {
        ...newReview,
        approved: true, // Auto approve admin-added reviews
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewReview({ name: '', city: '', text: '', rating: 5, image: '' });
      fetchReviews();
    } catch (err) {
      alert("Error adding review");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Reviews Management</h2>
            <p className="text-slate-500">View, approve, and add client reviews manually.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
             <Plus size={18} /> Add Review
          </button>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 border-b border-slate-100 uppercase tracking-wider text-slate-500 font-semibold">
                <tr>
                   <th className="p-4">Client</th>
                   <th className="p-4">Review Text</th>
                   <th className="p-4">Rating</th>
                   <th className="p-4">Status</th>
                   <th className="p-4 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {reviews.map(rev => (
                   <tr key={rev.id} className="hover:bg-slate-50/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                           {rev.image ? <img src={rev.image} className="w-10 h-10 object-cover rounded-full" /> : <div className="w-10 h-10 bg-slate-200 rounded-full" />}
                           <div>
                             <p className="font-bold text-slate-900">{rev.name}</p>
                             <p className="text-xs text-slate-500">{rev.city || 'N/A'}</p>
                           </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 max-w-xs truncate" title={rev.text}>{rev.text}</td>
                      <td className="p-4 font-bold text-slate-900">{rev.rating} / 5</td>
                      <td className="p-4">
                         <span className={`px-3 py-1 rounded-full text-xs font-bold ${rev.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {rev.approved ? 'Approved' : 'Pending'}
                         </span>
                      </td>
                      <td className="p-4 text-right">
                         <button onClick={() => handleToggleApproval(rev.id, rev.approved)} className="text-blue-500 hover:text-blue-700 font-bold mr-4">
                           {rev.approved ? 'Hide' : 'Approve'}
                         </button>
                         <button onClick={() => handleDelete(rev.id)} className="text-red-500 hover:text-red-700 font-bold p-2"><Trash2 size={16} /></button>
                      </td>
                   </tr>
                ))}
                {reviews.length === 0 && !loading && (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-500">No reviews found.</td></tr>
                )}
             </tbody>
          </table>
       </div>

       {showAddModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
               <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X size={24}/></button>
               <h3 className="text-2xl font-bold mb-4">Add Manual Review</h3>
               <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input type="text" required value={newReview.name} onChange={e => setNewReview({...newReview, name: e.target.value})} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">City</label>
                    <input type="text" value={newReview.city} onChange={e => setNewReview({...newReview, city: e.target.value})} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Review Text</label>
                    <textarea required value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Rating</label>
                    <input type="number" min="1" max="5" value={newReview.rating} onChange={e => setNewReview({...newReview, rating: Number(e.target.value)})} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Image (Optional Base64 Upload)</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border rounded-lg px-4 py-2" />
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">Save Review</button>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}

function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({ text: '', isActive: true });

  const fetchAnnouncements = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      setAnnouncements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'announcements', id), { isActive: !currentStatus });
      fetchAnnouncements();
    } catch (err) {
      alert("Error toggling status");
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm("Are you sure you want to delete this announcement?")) {
      await deleteDoc(doc(db, 'announcements', id));
      fetchAnnouncements();
    }
  };

  const handleAddAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        ...newAnnouncement,
        createdAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewAnnouncement({ text: '', isActive: true });
      fetchAnnouncements();
    } catch (err) {
      alert("Error adding announcement");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Announcements</h2>
            <p className="text-slate-500">Manage scrolling announcements at the top of the website.</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
             <Plus size={18} /> Add New
          </button>
       </div>

       <div className="grid gap-4">
          {announcements.map(ann => (
             <div key={ann.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow flex justify-between items-center gap-6">
                <div>
                   <p className="font-bold text-slate-800">{ann.text}</p>
                   <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${ann.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {ann.isActive ? 'Active' : 'Hidden'}
                   </span>
                </div>
                <div className="flex gap-2 min-w-[150px]">
                   <button onClick={() => handleToggleActive(ann.id, ann.isActive)} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">
                      {ann.isActive ? 'Hide' : 'Show'}
                   </button>
                   <button onClick={() => handleDelete(ann.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl">
                      Delete
                   </button>
                </div>
             </div>
          ))}
          {announcements.length === 0 && !loading && (
             <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">
                No announcements records yet. Click "Add New" to create one.
             </div>
          )}
       </div>

       {showAddModal && (
         <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative">
               <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-900"><X size={24}/></button>
               <h3 className="text-2xl font-bold mb-4">Add Announcement</h3>
               <form onSubmit={handleAddAnnouncement} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Announcement Text</label>
                    <textarea required value={newAnnouncement.text} onChange={e => setNewAnnouncement({...newAnnouncement, text: e.target.value})} className="w-full border rounded-lg px-4 py-2" rows={3} placeholder="E.g., Huge 50% discount on all courses starting tomorrow!"></textarea>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="isActive" checked={newAnnouncement.isActive} onChange={e => setNewAnnouncement({...newAnnouncement, isActive: e.target.checked})} className="w-4 h-4" />
                    <label htmlFor="isActive" className="text-sm font-semibold">Active immediately</label>
                  </div>
                  <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">Save</button>
               </form>
            </div>
         </div>
       )}
    </div>
  );
}
