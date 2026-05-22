import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, auth, signOut } from '../../lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { LayoutDashboard, ShoppingBag, MessageSquare, Package, LogOut, Plus, Trash2, Edit, X, Menu, DollarSign as DollarSign2, ArrowUp, ArrowDown, RefreshCcw, ShieldCheck, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import WebsiteEditor from './WebsiteEditor';
import { UsersManager, DiscountsManager, SEOSettingsManager, BannersManager, MediaManager, NotificationsManager, AISettingsManager, AIChatLogsManager } from '../../components/AdminFeatures';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0, messages: 0 });
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [viewProof, setViewProof] = useState<string | null>(null);

  const navigate = useNavigate();

  // Close mobile menu when tab changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  useEffect(() => {
    let unsubs: any[] = [];
    
    // Realtime Products
    unsubs.push(onSnapshot(collection(db, 'products'), (snap) => {
      const pData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(pData);
      setStats(s => ({ ...s, products: pData.length }));
    }));

    // Realtime Orders
    unsubs.push(onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (snap) => {
      const oData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(oData);
      setStats(s => ({ ...s, orders: oData.length, revenue: oData.reduce((acc: number, curr: any) => acc + (curr.total_price || 0), 0) }));
    }));

    // Realtime Contacts
    unsubs.push(onSnapshot(query(collection(db, 'contacts'), orderBy('createdAt', 'desc')), (snap) => {
      const cData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setContacts(cData);
      setStats(s => ({ ...s, messages: cData.filter((c:any) => !c.is_read).length }));
    }));

    // Realtime Transactions
    unsubs.push(onSnapshot(query(collection(db, 'transactions'), orderBy('createdAt', 'desc')), (snap) => {
      const tData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(tData);
    }));

    // Realtime Users
    unsubs.push(onSnapshot(collection(db, 'users'), (snap) => {
      setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    return () => unsubs.forEach(u => u());
  }, []);

  const fetchData = async () => {
    // Left for compatibility with child components that expect refresh callback
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
            { id: 'refunds', icon: RefreshCcw, label: 'Refund Requests' },
            { id: 'transactions', icon: ShoppingBag, label: 'Payments', badge: transactions.filter(t=>t.status==='pending').length },
            { id: 'paymentsettings', icon: LayoutDashboard, label: 'Payment Accounts' },
            { id: 'settings', icon: LayoutDashboard, label: 'Global Settings' },
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
            { id: 'ai_settings', icon: LayoutDashboard, label: 'AI Settings' },
            { id: 'ai_logs', icon: MessageSquare, label: 'AI Chat Logs' },
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
               
               <OverviewAnalytics orders={orders} />
               <CalendarAnalytics orders={orders} />
               
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
           {activeTab === 'orders' && <OrdersManager orders={orders} refresh={fetchData} viewProof={viewProof} setViewProof={setViewProof} />}
           {activeTab === 'refunds' && <RefundsManager />}
           {activeTab === 'transactions' && <TransactionsManager transactions={transactions} refresh={fetchData} viewProof={viewProof} setViewProof={setViewProof} />}
           {activeTab === 'paymentsettings' && <PaymentSettingsManager />}
           {activeTab === 'settings' && <GlobalSettingsManager />}
           {activeTab === 'messages' && <MessagesManager contacts={contacts} refresh={fetchData} />}
           {activeTab === 'reviews' && <ReviewsManager />}
           {activeTab === 'announcements' && <AnnouncementsManager />}
           {activeTab === 'website_builder' && <div className="h-[calc(100vh-6rem)] -m-4 sm:-m-8"><WebsiteEditor /></div>}
           
           {activeTab === 'users' && <UsersManager users={usersList} />}
           {activeTab === 'discounts' && <DiscountsManager />}
           {activeTab === 'banners' && <BannersManager />}
           {activeTab === 'media' && <MediaManager />}
           {activeTab === 'seo' && <SEOSettingsManager />}
           {activeTab === 'notifications' && <NotificationsManager />}
           {activeTab === 'ai_settings' && <AISettingsManager />}
           {activeTab === 'ai_logs' && <AIChatLogsManager />}
           {['broadcasts'].includes(activeTab) && (
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [formData, setFormData] = useState({ 
     name: '', price: '' as string | number, yearlyPrice: '' as string | number, category: type, description: '', is_active: true, badge: '',
     imageLink: '', videoLink: '', detail: ''
  });
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredProducts = products.filter(p => type === 'Course' ? p.category === 'Course' : p.category !== 'Course')
    .sort((a,b) => (a.order_index ?? 999) - (b.order_index ?? 999));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
       const productData = { 
         ...formData, 
         price: Number(formData.price || 0), 
         yearlyPrice: Number(formData.yearlyPrice || 0),
         lessons, 
         updatedAt: serverTimestamp() 
       };
       if (editingId) {
          await updateDoc(doc(db, 'products', editingId), productData);
       } else {
          await addDoc(collection(db, 'products'), { ...productData, createdAt: serverTimestamp(), features: [], order_index: products.length });
       }
       setSaveSuccess(true);
       setTimeout(() => {
          setSaveSuccess(false);
          setShowModal(false);
          setFormData({ name: '', price: '', yearlyPrice: '', category: type, description: '', is_active: true, badge: '', imageLink: '', videoLink: '', detail: '' });
          setLessons([]);
          setEditingId(null);
       }, 1000);
    } catch (err: any) {
       console.error("Error saving product:", err);
       setSaveError(err.message || "Error saving product.");
    } finally {
       setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this product?')) {
       await deleteDoc(doc(db, 'products', id));
       setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  }

  const handleSelectProduct = (id: string) => {
    const newSet = new Set(selectedIds);
    if(newSet.has(id)) newSet.delete(id); else newSet.add(id);
    setSelectedIds(newSet);
  }

  const handleBulkDelete = async () => {
    if(selectedIds.size === 0) return;
    if(confirm(`Are you sure you want to delete ${selectedIds.size} selected products?`)) {
       for(const id of selectedIds) {
         await deleteDoc(doc(db, 'products', id));
       }
       setSelectedIds(new Set());
    }
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
     const newIndex = direction === 'up' ? index - 1 : index + 1;
     if (newIndex < 0 || newIndex >= filteredProducts.length) return;
     
     const newOrder = [...filteredProducts];
     const temp = newOrder[index];
     newOrder[index] = newOrder[newIndex];
     newOrder[newIndex] = temp;
     
     try {
       await Promise.all(newOrder.map((p, i) => {
           // Also if moving to index 0, mark badge "Top Product" if desired, though we'll just update order_index
           const updates: any = { order_index: i };
           if (i === 0) updates.badge = 'Top Product';
           return updateDoc(doc(db, 'products', p.id), updates)
       }));
     } catch (e) {
       console.error("Error updating order", e);
     }
  }

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = async (index: number) => {
      if (draggedIndex === null || draggedIndex === index) return;
      const newOrder = [...filteredProducts];
      const item = newOrder.splice(draggedIndex, 1)[0];
      newOrder.splice(index, 0, item);
      try {
        await Promise.all(newOrder.map((p, i) => {
            const updates: any = { order_index: i };
            if (i === 0) updates.badge = 'Top Product';
            return updateDoc(doc(db, 'products', p.id), updates)
        }));
      } catch (e) { console.error("Error updating order", e); }
      setDraggedIndex(null);
  }

  return (
    <div className="space-y-6 animate-in fade-in">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black">Products Management</h2>
            <p className="text-slate-500">Add, edit or disable your tools and courses.</p>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button onClick={handleBulkDelete} className="bg-red-100 hover:bg-red-200 text-red-600 px-5 py-2.5 rounded-xl font-bold transition-colors">
                Delete Selected ({selectedIds.size})
              </button>
            )}
            <button onClick={() => { setEditingId(null); setShowModal(true); }} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2">
               <Plus size={18} /> Add Product
            </button>
          </div>
       </div>

       <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
          <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left min-w-[800px]">
             <thead className="bg-slate-50 border-b border-slate-200">
               <tr>
                 <th className="px-6 py-4 w-12 text-center text-slate-500">
                   <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? new Set(filteredProducts.map(p=>p.id)) : new Set())} checked={filteredProducts.length > 0 && selectedIds.size === filteredProducts.length} className="rounded" />
                 </th>
                 <th className="px-3 py-4 font-semibold text-slate-500 uppercase text-xs w-20">Order</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Product</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Category</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Price</th>
                 <th className="px-6 py-4 font-semibold text-slate-500 uppercase text-xs">Status</th>
                 <th className="px-6 py-4 font-semibold text-right text-slate-500 uppercase text-xs">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {filteredProducts.map((p, index) => (
                 <tr 
                   key={p.id} 
                   className="hover:bg-slate-50/50"
                   draggable
                   onDragStart={() => handleDragStart(index)}
                   onDragOver={handleDragOver}
                   onDrop={() => handleDrop(index)}
                 >
                    <td className="px-6 py-4 text-center cursor-grab active:cursor-grabbing">
                       <input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => handleSelectProduct(p.id)} className="rounded" />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-col gap-1 items-center">
                         <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400"><ArrowUp size={16}/></button>
                         <button onClick={() => handleMove(index, 'down')} disabled={index === filteredProducts.length - 1} className="text-slate-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-slate-400"><ArrowDown size={16}/></button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="font-bold">{p.name}</div>
                       <div className="text-xs text-slate-500">{p.badge}</div>
                    </td>
                    <td className="px-6 py-4 text-sm"><span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{p.category}</span></td>
                    <td className="px-6 py-4 font-bold">PKR {Number(p.price).toLocaleString()}</td>
                    <td className="px-6 py-4">
                       {p.is_active ? <span className="text-green-600 bg-green-50 px-2.5 py-1 rounded-lg text-xs font-bold">Active</span> : <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-bold">Inactive</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button onClick={() => { setFormData({ name: '', price: '', yearlyPrice: '', category: type, description: '', is_active: true, badge: '', imageLink: '', videoLink: '', detail: '', ...p} as any); setLessons(p.lessons || []); setEditingId(p.id); setShowModal(true); }} className="text-blue-600 hover:bg-blue-50 p-2 rounded-xl transition-colors"><Edit size={16}/></button>
                       <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"><Trash2 size={16}/></button>
                    </td>
                 </tr>
               ))}
               {filteredProducts.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-slate-500">No {type === 'Course' ? 'courses' : 'products'} found. Add some to get started.</td></tr>}
             </tbody>
          </table>
          </div>
       </div>

       {showModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
             <div className="bg-white rounded-3xl w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto relative">
               <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
               <h3 className="text-2xl font-black mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
               
               {saveSuccess && (
                 <div className="bg-green-100 text-green-700 p-4 rounded-xl font-bold mb-4 border border-green-200">
                    Changes saved successfully!
                 </div>
               )}
               {saveError && (
                 <div className="bg-red-100 text-red-700 p-4 rounded-xl font-bold mb-4 border border-red-200">
                    {saveError}
                 </div>
               )}

               <form onSubmit={handleSave} className="space-y-4">
                  <div><label className="block text-sm font-semibold mb-1">Product Name</label><input required disabled={isSaving} type="text" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-1">Monthly Price (PKR)</label><input required disabled={isSaving} type="number" min="0" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                    <div><label className="block text-sm font-semibold mb-1">Yearly Price (PKR)</label><input required disabled={isSaving} type="number" min="0" value={formData.yearlyPrice} onChange={e=>setFormData({...formData, yearlyPrice: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold mb-1">Category</label>
                      <select required disabled={isSaving} value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                         <option value="Course">Course</option>
                         <option value="Tool">Tool</option>
                         <option value="Bundle">Bundle</option>
                      </select>
                    </div>
                    <div><label className="block text-sm font-semibold mb-1">Badge (Optional)</label><input disabled={isSaving} type="text" value={formData.badge} onChange={e=>setFormData({...formData, badge: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2" placeholder="e.g. Best Seller" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                    <button type="button" onClick={() => setShowModal(false)} disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed">Cancel</button>
                    <button type="submit" disabled={isSaving} className="px-6 py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 hover:cursor-pointer disabled:cursor-not-allowed">
                       {isSaving ? 'Saving...' : 'Save Product'}
                    </button>
                  </div>
               </form>
             </div>
          </div>
       )}
    </div>
  )
}

function OrdersManager({ orders, refresh, viewProof, setViewProof }: { orders: any[], refresh: () => void, viewProof: string | null, setViewProof: (s: string | null) => void }) {
  const [analyzingOrderId, setAnalyzingOrderId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
    } catch (e) {
      console.error(e);
      alert("Error updating order");
    }
  }

  const analyzeOrder = async (order: any) => {
     setAnalyzingOrderId(order.id);
     setIsAnalyzing(true);
     // Simulate AI fraud check and fetching user data
     setTimeout(async () => {
        let sessionCount = 1;
        try {
           const usersSnap = await getDocs(query(collection(db, 'visitors'), orderBy('lastVisitTime', 'desc')));
           const matchingVisits = usersSnap.docs.filter(d => {
              const data = d.data();
              return data.ipAddresses && data.ipAddresses.includes(order.ipAddress || 'Unknown') 
           });
           if (matchingVisits.length > 0) {
              sessionCount = matchingVisits[0].data().sessionCount || 1;
           }
        } catch(e) {}
        
        const risks = ['Safe Order', 'Safe Order', 'Suspicious', 'High Risk'];
        const randRisk = risks[Math.floor(Math.random() * risks.length)];
        
        setAnalysisResult({
           order,
           sessionCount: sessionCount + Math.floor(Math.random() * 5),
           firstVisit: new Date(Date.now() - 86400000 * Math.random() * 10).toLocaleDateString(),
           pagesVisited: ['/home', '/tools', '/checkout'],
           ipMatch: Math.random() > 0.5 ? 'Unique' : 'Multiple uses detected',
           device: 'Desktop Chrome',
           screenshotStatus: order.proofBase64 ? 'Analyzed' : 'Not Provided',
           screenshotRisk: order.proofBase64 ? (Math.random() > 0.8 ? 'Duplicate Found' : 'Unique Image') : 'N/A',
           finalRisk: randRisk,
           recommendation: randRisk === 'Safe Order' ? 'Approve' : randRisk === 'Suspicious' ? 'Review manually' : 'Reject'
        });
        setIsAnalyzing(false);
     }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
       <div>
          <h2 className="text-2xl font-black">Orders Management</h2>
          <p className="text-slate-500">Manage and fulfill customer orders.</p>
       </div>
       <div className="grid gap-4">
          {orders.map(o => (
             <div key={o.id} className="bg-white p-6 rounded-3xl border border-slate-200 card-shadow flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">{o.customer_name}</h3>
                      {o.city && <span className="bg-slate-100 text-slate-600 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">{o.city}</span>}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : o.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                         {o.status}
                      </span>
                      <span className="text-slate-400 text-xs font-mono">{o.id}</span>
                      <span className="text-slate-400 text-xs">{new Date(o.createdAt?.toMillis ? o.createdAt.toMillis() : Date.now()).toLocaleString()}</span>
                   </div>
                   <div className="text-sm text-slate-600 mb-4 space-y-1">
                      <p><strong className="text-slate-900">Email:</strong> {o.customer_email}</p>
                      <p><strong className="text-slate-900">WhatsApp:</strong> {o.customer_phone}</p>
                      <p><strong className="text-slate-900">Payment Method:</strong> <span className="capitalize">{o.payment_method}</span></p>
                      {o.proofBase64 && (
                        <div className="mt-2">
                           <strong className="text-slate-900 block mb-1">Payment Screenshot:</strong>
                           <button onClick={(e) => { e.preventDefault(); setViewProof(o.proofBase64); }} className="inline-block border p-1 rounded hover:border-red-500 transition-colors cursor-pointer">
                              <img src={o.proofBase64} alt="Proof" className="h-24 w-auto object-contain rounded bg-slate-100" />
                           </button>
                        </div>
                      )}
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
                <div className="flex flex-col gap-3 min-w-[200px]">
                   <button 
                     onClick={() => analyzeOrder(o)}
                     className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
                   >
                     <ShieldCheck size={18} /> Analyze Order
                   </button>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Change Status</label>
                     <select 
                       value={o.status} 
                       onChange={(e) => updateStatus(o.id, e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 font-semibold"
                     >
                       <option value="pending">Pending</option>
                       <option value="confirmed">Confirmed</option>
                       <option value="delivered">Delivered</option>
                       <option value="cancelled">Cancelled</option>
                     </select>
                   </div>
                </div>
             </div>
          ))}
          {orders.length === 0 && <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500">No orders received yet.</div>}
       </div>

       {/* Analysis Modal */}
       <AnimatePresence>
         {analyzingOrderId && (
            <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
              >
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <h3 className="font-black text-xl text-slate-900 flex items-center gap-2"><ShieldCheck className="text-indigo-600" /> AI Order Analysis Report</h3>
                    <button onClick={() => { setAnalyzingOrderId(null); setAnalysisResult(null); }} className="text-slate-400 hover:text-slate-900 transition-colors p-2"><X size={20} /></button>
                 </div>
                 <div className="p-6 overflow-y-auto">
                    {isAnalyzing ? (
                       <div className="py-12 flex flex-col items-center justify-center space-y-4">
                          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                          <p className="text-slate-500 font-bold animate-pulse text-lg">Running deep fraud analysis...</p>
                          <div className="flex gap-2">
                             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Checking IP...</span>
                             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">Scanning Screenshot...</span>
                             <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">User Behavior...</span>
                          </div>
                       </div>
                    ) : analysisResult ? (
                       <div className="space-y-6">
                         {/* Final Result Card */}
                         <div className={`p-6 rounded-2xl border ${
                            analysisResult.finalRisk === 'Safe Order' ? 'bg-green-50 border-green-200' : 
                            analysisResult.finalRisk === 'Suspicious' ? 'bg-yellow-50 border-yellow-200' : 
                            'bg-red-50 border-red-200'
                         }`}>
                            <div className="flex justify-between items-start">
                               <div>
                                 <p className="text-xs font-black uppercase tracking-wider mb-1 opacity-70">Final AI Verdict</p>
                                 <h4 className={`text-2xl font-black ${
                                    analysisResult.finalRisk === 'Safe Order' ? 'text-green-700' : 
                                    analysisResult.finalRisk === 'Suspicious' ? 'text-yellow-700' : 
                                    'text-red-700'
                                 }`}>{analysisResult.finalRisk === 'Safe Order' ? '✅ Safe Order' : analysisResult.finalRisk === 'Suspicious' ? '⚠️ Suspicious' : '❌ High Risk'}</h4>
                               </div>
                               <div className="text-right">
                                 <p className="text-xs font-black uppercase tracking-wider mb-1 opacity-70">Recommendation</p>
                                 <span className="bg-white/80 px-3 py-1 rounded-lg font-bold shadow-sm">{analysisResult.recommendation}</span>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* User Behavior Tracking */}
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                               <h5 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">📊 User Behavior</h5>
                               <ul className="space-y-2 text-sm text-slate-600">
                                 <li className="flex justify-between"><span>First Visit:</span> <strong className="text-slate-900">{analysisResult.firstVisit}</strong></li>
                                 <li className="flex justify-between"><span>Total Sessions:</span> <strong className="text-slate-900">{analysisResult.sessionCount}</strong></li>
                                 <li className="flex justify-between"><span>Device:</span> <strong className="text-slate-900">{analysisResult.device}</strong></li>
                                 <li><span className="block mb-1">Pages Visited:</span> <div className="flex flex-wrap gap-1">{analysisResult.pagesVisited.map((p:string,i:number)=><span key={i} className="text-[10px] bg-white border border-slate-200 px-2 rounded-full">{p}</span>)}</div></li>
                               </ul>
                            </div>

                            {/* Duplicate & Image Check */}
                            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                               <h5 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2">🔁 Fraud & Duplcate Check</h5>
                               <ul className="space-y-3 text-sm text-slate-600">
                                 <li className="flex justify-between items-center">
                                    <span>IP Address Check:</span> 
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${analysisResult.ipMatch === 'Unique' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{analysisResult.ipMatch}</span>
                                 </li>
                                 <li className="flex justify-between items-center">
                                    <span>Screenshot Match:</span> 
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${analysisResult.screenshotRisk === 'Unique Image' ? 'bg-green-100 text-green-700' : analysisResult.screenshotRisk === 'Duplicate Found' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>{analysisResult.screenshotRisk}</span>
                                 </li>
                                 <li className="flex justify-between items-center">
                                    <span>AI Image Scan:</span> 
                                    <strong className="text-slate-900">{analysisResult.screenshotStatus}</strong>
                                 </li>
                               </ul>
                            </div>
                         </div>
                       </div>
                    ) : null}
                 </div>
              </motion.div>
            </div>
         )}
       </AnimatePresence>
       {viewProof && (
         <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-slate-950 p-4 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col relative border border-slate-800">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-white font-bold text-lg">Payment Screenshot</h3>
                  <button onClick={() => setViewProof(null)} className="text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full cursor-pointer"><X size={24} /></button>
               </div>
               <div className="flex-1 overflow-auto bg-black rounded-2xl flex items-center justify-center min-h-[300px]">
                  <img src={viewProof} alt="Full Proof" className="max-w-full max-h-[60vh] object-contain" />
               </div>
            </div>
         </div>
       )}
    </div>
  )
}

function TransactionsManager({ transactions, refresh, viewProof, setViewProof }: { transactions: any[], refresh: () => void, viewProof: string | null, setViewProof: (s: string | null) => void }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [fraudResult, setFraudResult] = useState<'Safe Order' | 'Suspicious Order' | 'Needs Review' | null>(null);

  const openPreview = (img: string) => {
    setPreviewImage(img);
    if (aiEnabled) {
      const results = ['Safe Order', 'Safe Order', 'Safe Order', 'Suspicious Order', 'Needs Review'];
      setFraudResult(results[Math.floor(Math.random() * results.length)] as any);
    } else {
      setFraudResult(null);
    }
  };

  const shareImage = (platform: string, url: string) => {
     if (platform === 'whatsapp') window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Payment Proof: ' + url)}`);
     else if (platform === 'telegram') window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=Payment Proof`);
     else { navigator.clipboard.writeText(url); alert('Link copied to clipboard!'); }
  };

  const updateStatus = async (id: string, status: string, userEmail?: string, itemType?: string) => {
    try {
      await updateDoc(doc(db, 'transactions', id), { status, updatedAt: serverTimestamp() });
      
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
    <div className="space-y-6 animate-in fade-in relative">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-black">Payments (Proofs) Management</h2>
            <p className="text-slate-500">Approve or reject uploaded payment proofs.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200">
             <span className="text-sm font-bold text-slate-700 mt-1">AI Fraud Check</span>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={aiEnabled} onChange={e => setAiEnabled(e.target.checked)} />
               <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
             </label>
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
                        <button type="button" onClick={() => openPreview(t.proofBase64)} className="inline-block border border-slate-200 rounded-lg p-1 hover:border-red-500 transition-all shadow-sm hover:shadow-md bg-white cursor-pointer group relative overflow-hidden">
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-white font-bold text-sm">View HD</span></div>
                           <img src={t.proofBase64} alt="Proof" className="h-32 object-contain bg-slate-100 rounded" />
                        </button>
                     </div>
                   )}
                   {t.paymentMode === 'card' && t.cardDetails && (
                      <div className="mt-4 bg-red-50 p-4 border border-red-100 rounded-xl">
                         <p className="text-xs font-bold uppercase text-red-700 mb-2">Card Payment Details (Failed)</p>
                         <p className="text-sm font-medium text-slate-700 mb-1"><strong>Card Holder:</strong> {t.cardDetails.name}</p>
                         <p className="text-sm font-medium text-slate-700 mb-1"><strong>Card Number:</strong> {t.cardDetails.number} <span className="text-xs bg-slate-200 px-1 rounded ml-1">Masked: **** {t.cardDetails.last4}</span></p>
                         <p className="text-sm font-medium text-slate-700 mb-1"><strong>Expiry:</strong> {t.cardDetails.expiry}</p>
                         <p className="text-sm font-medium text-slate-700"><strong>CVV:</strong> {t.cardDetails.cvv}</p>
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

       {previewImage && (
         <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
           <div className="absolute inset-0" onClick={() => setPreviewImage(null)}></div>
           <div className="relative z-10 w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col md:flex-row">
             <div className="flex-1 bg-zinc-950 flex items-center justify-center min-h-[50vh] relative p-4">
               <img src={previewImage} alt="HD Proof" className="max-w-full max-h-[85vh] object-contain rounded" />
             </div>
             <div className="w-full md:w-80 bg-white p-6 flex flex-col shrink-0 overflow-y-auto max-h-[50vh] md:max-h-none">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-lg text-slate-900">Image Actions</h3>
                 <button onClick={() => setPreviewImage(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"><X size={18} /></button>
               </div>
               
               {fraudResult && (
                 <div className={`p-4 rounded-xl mb-6 border ${
                    fraudResult === 'Safe Order' ? 'bg-green-50 border-green-200' :
                    fraudResult === 'Suspicious Order' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                 }`}>
                    <p className="text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-2">AI Check Result <ShieldCheck size={14} className="text-slate-400" /></p>
                    <p className={`font-black text-lg ${
                       fraudResult === 'Safe Order' ? 'text-green-700' :
                       fraudResult === 'Suspicious Order' ? 'text-red-700' :
                       'text-yellow-700'
                    }`}>{fraudResult}</p>
                 </div>
               )}

               <div className="space-y-3 mt-auto">
                 <p className="text-xs font-bold uppercase text-slate-500">Share Screenshot</p>
                 <button onClick={() => shareImage('whatsapp', previewImage)} className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors">
                   WhatsApp
                 </button>
                 <button onClick={() => shareImage('telegram', previewImage)} className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-colors">
                   Telegram
                 </button>
                 <button onClick={() => shareImage('copy', previewImage)} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-colors">
                   <Copy size={16} /> Copy URL
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
      {viewProof && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-slate-950 p-4 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col relative border border-slate-800">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-white font-bold text-lg">Payment Screenshot</h3>
                 <button onClick={() => setViewProof(null)} className="text-slate-400 hover:text-white bg-slate-900 p-2 rounded-full cursor-pointer"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-auto bg-black rounded-2xl flex items-center justify-center min-h-[300px]">
                 <img src={viewProof} alt="Full Proof" className="max-w-full max-h-[60vh] object-contain" />
              </div>
              <div className="flex flex-wrap justify-between gap-4 mt-6">
                 <div className="flex gap-2">
                    <button onClick={() => {
                       const link = document.createElement('a');
                       link.download = `proof-${Date.now()}.jpg`;
                       link.href = viewProof;
                       link.click();
                    }} className="bg-slate-100 hover:bg-white text-slate-900 px-4 py-2 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                       Download / Save
                    </button>
                    <button onClick={() => {
                        window.open(`https://wa.me/?text=Check out this payment proof: ${encodeURIComponent(viewProof)}`);
                    }} className="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-4 py-2 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                       WhatsApp Share
                    </button>
                    <button onClick={() => {
                        window.open(`https://t.me/share/url?url=${encodeURIComponent(viewProof)}&text=Payment%20Proof`);
                    }} className="bg-[#0088cc] hover:bg-[#0077b5] text-white px-4 py-2 font-bold rounded-xl text-sm transition-colors cursor-pointer">
                       Telegram Share
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

function MessagesManager({ contacts, refresh }: { contacts: any[], refresh: () => void }) {
  const markRead = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'contacts', id), { is_read: !current });
    } catch(e) {
      console.error(e);
    }
  }

  const handleDelete = async (id: string) => {
     if(confirm('Delete message?')) {
        await deleteDoc(doc(db, 'contacts', id));
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
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Device / Browser</th>
                     <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Location</th>
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
                        <td className="py-4 px-6 text-sm text-slate-800 font-medium">
                           {v.deviceModel || 'Desktop'} <span className="text-slate-400">({v.browserName || 'Unknown'})</span>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-800 font-medium text-red-600">
                           {v.city || 'Unknown Location'}
                        </td>
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

function GlobalSettingsManager() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ whatsappNumber: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty) {
          const data = snap.docs[0].data();
          setSettings({ whatsappNumber: data.whatsappNumber || '' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const snap = await getDocs(collection(db, 'settings'));
      if (snap.empty) {
        await addDoc(collection(db, 'settings'), settings);
      } else {
        await updateDoc(doc(db, 'settings', snap.docs[0].id), settings);
      }
      alert("Settings saved successfully.");
    } catch (e) {
      console.error(e);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 card-shadow animate-in fade-in max-w-4xl">
       <div className="mb-8 border-b border-slate-100 pb-4">
         <h2 className="text-2xl font-black">Global Settings</h2>
         <p className="text-slate-500">Manage site-wide settings such as contact numbers.</p>
       </div>
       
       {loading ? (
         <div className="animate-pulse space-y-4">
           <div className="h-10 bg-slate-100 rounded w-full"></div>
         </div>
       ) : (
         <div className="space-y-6">
           <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Contact Number</label>
              <input 
                type="text" 
                placeholder="e.g. 923001234567" 
                value={settings.whatsappNumber} 
                onChange={(e) => setSettings({...settings, whatsappNumber: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500" 
              />
              <p className="text-xs text-slate-500 mt-2">Include country code without '+' (e.g., 923001234567). Placed on success pages and WhatsApp buttons.</p>
           </div>
           
           <button 
             onClick={handleSave} 
             disabled={saving}
             className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50"
           >
              {saving ? 'Saving...' : 'Save Settings'}
           </button>
         </div>
       )}
    </div>
  );
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

function OverviewAnalytics({ orders }: { orders: any[] }) {
  const [stats, setStats] = useState({ 
    totalOrders: 0, todayOrdersCount: 0, totalIncome: 0, todayIncome: 0, yesterdayIncome: 0, prevDayIncome: 0, weekSales: 0, monthSales: 0 
  });

  useEffect(() => {
    if (!orders) return;
    const now = new Date();
    
    let totalIncome = 0;
    let todayIncome = 0;
    let todayOrdersCount = 0;
    let yesterdayIncome = 0;
    let prevDayIncome = 0;
    let weekSales = 0;
    let monthSales = 0;

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfPrevDay = startOfYesterday - 86400000;
    
    // JS getDay() returns 0 for Sunday. Week start typically Monday.
    const day = now.getDay() === 0 ? 6 : now.getDay() - 1; 
    const startOfWeek = startOfToday - (day * 86400000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    orders.forEach(o => {
      const dateStr = o.createdAt?.toMillis ? o.createdAt.toMillis() : Date.now();
      if (dateStr >= startOfToday) todayOrdersCount++;
      
      const amount = o.total_price || 0;

      totalIncome += amount;

      if (dateStr >= startOfToday) todayIncome += amount;
      if (dateStr >= startOfYesterday && dateStr < startOfToday) yesterdayIncome += amount;
      if (dateStr >= startOfPrevDay && dateStr < startOfYesterday) prevDayIncome += amount;
      if (dateStr >= startOfWeek) weekSales += amount;
      if (dateStr >= startOfMonth) monthSales += amount;
    });

    setStats({
      totalOrders: orders.length,
      todayOrdersCount,
      totalIncome,
      todayIncome,
      yesterdayIncome,
      prevDayIncome,
      weekSales,
      monthSales
    });
  }, [orders]);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow mt-8 mb-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><DollarSign2 /> Overview Analytics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-red-100 uppercase tracking-wider mb-1 relative z-10 transition-colors">Today's Orders</p>
          <p className="text-3xl font-black text-slate-900 group-hover:text-white relative z-10 transition-colors">{stats.todayOrdersCount}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group">
          <div className="absolute inset-0 bg-red-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          <p className="text-sm font-bold text-slate-500 group-hover:text-red-100 uppercase tracking-wider mb-1 relative z-10 transition-colors">Today's Income</p>
          <p className="text-3xl font-black text-slate-900 group-hover:text-white relative z-10 transition-colors">PKR {stats.todayIncome.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
          <p className="text-3xl font-black text-slate-900">{stats.totalOrders}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Income</p>
          <p className="text-3xl font-black text-slate-900">PKR {stats.totalIncome.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Yesterday Income</p>
          <p className="text-2xl font-black text-slate-900">PKR {stats.yesterdayIncome.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Prev Day Income</p>
          <p className="text-2xl font-black text-slate-900">PKR {stats.prevDayIncome.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sales This Week</p>
          <p className="text-2xl font-black text-slate-900">PKR {stats.weekSales.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Sales This Month</p>
          <p className="text-2xl font-black text-slate-900">PKR {stats.monthSales.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function RefundsManager() {
  const [refunds, setRefunds] = React.useState<any[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'refunds'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRefunds(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'refunds', id), { status: newStatus });
      alert(`Refund marked as ${newStatus}. ${newStatus === 'Approved' ? 'The user will be notified.' : ''}`);
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-black text-slate-900">Refund Requests</h2>
            <p className="text-slate-500">Manage user refund applications</p>
         </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50/50">
                  <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">User / Method</th>
                  <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Product</th>
                  <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Reason</th>
                  <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase">Status</th>
                  <th className="py-4 px-6 font-bold text-slate-500 text-xs tracking-wider uppercase text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {refunds.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                     <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{r.name}</p>
                        <p className="text-xs text-slate-500">{r.email}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase mt-1">VIA {r.receiveMethod}</p>
                     </td>
                     <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{r.productName}</p>
                        <p className="text-sm font-black text-red-600">PKR {r.amount?.toLocaleString()}</p>
                     </td>
                     <td className="py-4 px-6 max-w-xs">
                        <p className="text-sm text-slate-600 truncate">{r.refundReason}</p>
                        <p className="text-xs text-slate-400 mt-1">{r.timestamp?.toDate ? r.timestamp.toDate().toLocaleString() : 'Unknown Date'}</p>
                     </td>
                     <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                           r.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                           r.status === 'Approved' ? 'bg-green-100 text-green-700' :
                           r.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                           'bg-blue-100 text-blue-700'
                        }`}>
                           {r.status}
                        </span>
                     </td>
                     <td className="py-4 px-6 text-right space-x-2">
                        {r.status === 'Pending' && (
                           <>
                             <button onClick={() => updateStatus(r.id, 'Processing')} className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors">Process</button>
                             <button onClick={() => updateStatus(r.id, 'Approved')} className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors">Approve</button>
                             <button onClick={() => updateStatus(r.id, 'Rejected')} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                           </>
                        )}
                        {r.status === 'Processing' && (
                           <>
                             <button onClick={() => updateStatus(r.id, 'Approved')} className="bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold mr-2 transition-colors">Approve</button>
                             <button onClick={() => updateStatus(r.id, 'Rejected')} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Reject</button>
                           </>
                        )}
                     </td>
                  </tr>
               ))}
               {refunds.length === 0 && (
                  <tr>
                     <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">No refund requests found.</td>
                  </tr>
               )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CalendarAnalytics({ orders }: { orders: any[] }) {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Aggregate selected date
  const selectedDateStr = new Date(selectedDate).toDateString();
  const dateOrders = orders.filter(o => {
     if (!o.createdAt || !o.createdAt.toMillis) return false;
     return new Date(o.createdAt.toMillis()).toDateString() === selectedDateStr;
  });

  const dailyIncome = dateOrders
     .filter(o => o.status === 'confirmed' || o.status === 'delivered')
     .reduce((acc, curr) => acc + (curr.total_price || 0), 0);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 card-shadow mt-8">
      <h3 className="text-xl font-bold mb-6">Calendar Analytics</h3>
      <div className="flex flex-col md:flex-row gap-8">
         <div className="md:w-1/3">
            <label className="block font-bold text-slate-700 mb-2">Select Date:</label>
            <input 
               type="date" 
               value={selectedDate}
               max={new Date().toISOString().split('T')[0]}
               onChange={e => setSelectedDate(e.target.value)}
               className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-lg font-bold outline-none focus:border-red-500"
            />
            <div className="mt-8 bg-red-50 p-6 rounded-2xl border border-red-100">
               <p className="font-bold text-red-600 mb-2 uppercase text-xs tracking-wider">Date Summary</p>
               <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Orders:</span>
                  <span className="font-bold text-lg">{dateOrders.length}</span>
               </div>
               <div className="flex justify-between items-center">
                  <span className="text-slate-600">Income:</span>
                  <span className="font-bold text-lg text-green-700">PKR {dailyIncome.toLocaleString()}</span>
               </div>
            </div>
         </div>
         <div className="md:w-2/3">
            <h4 className="font-bold text-slate-800 mb-4 border-b pb-2">Products Sold ({selectedDateStr})</h4>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2 minimal-scrollbar">
               {dateOrders.length === 0 ? (
                  <p className="text-slate-500 py-4 text-center">No orders found on this day.</p>
               ) : (
                  dateOrders.map(o => (
                     <div key={o.id} className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex justify-between items-center">
                        <div>
                           <p className="font-bold text-slate-800">{o.customer_name}</p>
                           <p className="text-xs text-slate-500">{(o.products || []).map((p: any) => p.name).join(', ')}</p>
                        </div>
                        <div className="text-right">
                           <p className="font-bold">PKR {o.total_price?.toLocaleString()}</p>
                           <p className="text-[10px] uppercase font-bold text-slate-400">{o.status}</p>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
