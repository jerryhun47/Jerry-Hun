import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Plus, Edit2, Trash2, X, Check, Copy, Upload, Image as ImageIcon, QrCode, AlertCircle, CheckCircle2, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import { getProviderLogo, KNOWN_PAYMENT_PROVIDERS, PaymentMethodItem } from '../lib/paymentLogos';

const DEFAULT_ACCOUNTS: PaymentMethodItem[] = [
  {
    id: 'pm_easypaisa_1',
    providerName: 'Easypaisa',
    accountName: 'Jerry Automation',
    accountNumber: '03189418941',
    iban: '',
    logoUrl: getProviderLogo('Easypaisa'),
    isActive: true,
    instructions: 'Send exact amount to Easypaisa account and upload transaction screenshot below.'
  }
];

export default function PaymentSettingsManager() {
  const [methods, setMethods] = useState<PaymentMethodItem[]>(() => {
    try {
      const cached = localStorage.getItem('cached_payment_methods');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  });

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<Omit<PaymentMethodItem, 'id'>>({
    providerName: 'Easypaisa',
    accountName: '',
    accountNumber: '',
    iban: '',
    logoUrl: getProviderLogo('Easypaisa'),
    qrBase64: '',
    isActive: true,
    instructions: ''
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const saveToLocal = (data: PaymentMethodItem[]) => {
    try {
      localStorage.setItem('cached_payment_methods', JSON.stringify(data));
    } catch (e) {}
  };

  useEffect(() => {
    let unsubs = () => {};
    try {
      unsubs = onSnapshot(collection(db, 'payment_methods'), (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            logoUrl: getProviderLogo(d.data().providerName, d.data().logoUrl)
          })) as PaymentMethodItem[];
          setMethods(loaded);
          saveToLocal(loaded);
        } else {
          const isCustomized = localStorage.getItem('payment_methods_customized') === 'true';
          if (!isCustomized) {
            setMethods(DEFAULT_ACCOUNTS);
            saveToLocal(DEFAULT_ACCOUNTS);
          } else {
            const cached = localStorage.getItem('cached_payment_methods');
            if (cached) {
              setMethods(JSON.parse(cached));
            } else {
              setMethods([]);
            }
          }
        }
      }, (err) => {
        console.warn('Firestore payment_methods snapshot error:', err);
      });
    } catch (e) {
      console.warn('Failed to attach payment methods listener:', e);
    }
    return () => unsubs();
  }, []);

  const handleRestoreDefaults = async () => {
    if (!confirm('Restore default Pakistani payment accounts (Easypaisa, JazzCash, Meezan Bank)?')) return;
    try {
      for (const acc of DEFAULT_ACCOUNTS) {
        const { id, ...data } = acc;
        await addDoc(collection(db, 'payment_methods'), {
          ...data,
          createdAt: serverTimestamp()
        });
      }
      localStorage.removeItem('payment_methods_customized');
      showToast('Restored default payment accounts!');
    } catch (e: any) {
      setMethods(DEFAULT_ACCOUNTS);
      saveToLocal(DEFAULT_ACCOUNTS);
      showToast('Loaded default accounts in local storage');
    }
  };

  const handleSelectPreset = (provider: typeof KNOWN_PAYMENT_PROVIDERS[0]) => {
    const autoLogo = getProviderLogo(provider.name);
    setFormData(prev => ({
      ...prev,
      providerName: provider.name,
      logoUrl: autoLogo,
      instructions: prev.instructions || `Send exact amount via ${provider.name} and upload screenshot.`
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          let scaleSize = 1;
          if (img.width > MAX_WIDTH) scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width * scaleSize;
          canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          setFormData(prev => ({ ...prev, qrBase64: canvas.toDataURL('image/webp', 0.6) }));
        } catch (err) {
          setFormData(prev => ({ ...prev, qrBase64: dataUrl }));
        }
      };
      img.onerror = () => setFormData(prev => ({ ...prev, qrBase64: dataUrl }));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.providerName.trim() || !formData.accountNumber.trim() || !formData.accountName.trim()) {
      showToast('Please fill in Provider, Account Name, and Account Number', 'error');
      return;
    }

    setIsSaving(true);
    localStorage.setItem('payment_methods_customized', 'true');

    const methodData: Omit<PaymentMethodItem, 'id'> = {
      providerName: formData.providerName.trim(),
      accountName: formData.accountName.trim(),
      accountNumber: formData.accountNumber.trim(),
      iban: (formData.iban || '').trim(),
      logoUrl: formData.logoUrl || getProviderLogo(formData.providerName),
      qrBase64: formData.qrBase64 || '',
      isActive: formData.isActive !== false,
      instructions: formData.instructions || ''
    };

    try {
      if (editingId && !editingId.startsWith('pm_easypaisa_') && !editingId.startsWith('pm_jazzcash_') && !editingId.startsWith('pm_meezan_')) {
        // Update existing firestore doc
        try {
          await updateDoc(doc(db, 'payment_methods', editingId), {
            ...methodData,
            updatedAt: serverTimestamp()
          });
        } catch (fsErr) {
          console.warn('Firestore direct write fallback', fsErr);
        }

        const updated = methods.map(m => m.id === editingId ? { id: editingId, ...methodData } : m);
        setMethods(updated);
        saveToLocal(updated);
        showToast('Payment account updated successfully!');
      } else {
        // Create new or convert preset to real doc
        let newId = 'pm_' + Date.now();
        try {
          const docRef = await addDoc(collection(db, 'payment_methods'), {
            ...methodData,
            createdAt: serverTimestamp()
          });
          newId = docRef.id;
        } catch (fsErr) {
          console.warn('Firestore addDoc fallback', fsErr);
        }

        const filtered = editingId ? methods.filter(m => m.id !== editingId) : methods;
        const updated = [{ id: newId, ...methodData }, ...filtered];
        setMethods(updated);
        saveToLocal(updated);
        showToast(editingId ? 'Account updated!' : 'New payment account added successfully!');
      }

      setShowModal(false);
      setEditingId(null);
      setFormData({
        providerName: 'Easypaisa',
        accountName: '',
        accountNumber: '',
        iban: '',
        logoUrl: getProviderLogo('Easypaisa'),
        qrBase64: '',
        isActive: true,
        instructions: ''
      });
    } catch (err: any) {
      showToast('Error saving payment method: ' + (err.message || 'Unknown'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: PaymentMethodItem) => {
    const updatedStatus = !item.isActive;
    const updated = methods.map(m => m.id === item.id ? { ...m, isActive: updatedStatus } : m);
    setMethods(updated);
    saveToLocal(updated);
    localStorage.setItem('payment_methods_customized', 'true');
    try {
      if (!item.id.startsWith('pm_')) {
        await updateDoc(doc(db, 'payment_methods', item.id), {
          isActive: updatedStatus,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {}
    showToast(`${item.providerName} is now ${updatedStatus ? 'Active' : 'Disabled'}`);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This account will be removed.`)) return;
    
    localStorage.setItem('payment_methods_customized', 'true');
    const updated = methods.filter(m => m.id !== id);
    setMethods(updated);
    saveToLocal(updated);

    try {
      await deleteDoc(doc(db, 'payment_methods', id));
    } catch (e) {
      console.warn('Delete notice:', e);
    }
    
    showToast(`Deleted "${name}" successfully`);
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      providerName: 'Easypaisa',
      accountName: '',
      accountNumber: '',
      iban: '',
      logoUrl: getProviderLogo('Easypaisa'),
      qrBase64: '',
      isActive: true,
      instructions: 'Send exact amount via Easypaisa and upload screenshot.'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (item: PaymentMethodItem) => {
    setEditingId(item.id);
    setFormData({
      providerName: item.providerName,
      accountName: item.accountName,
      accountNumber: item.accountNumber,
      iban: item.iban || '',
      logoUrl: item.logoUrl || getProviderLogo(item.providerName),
      qrBase64: item.qrBase64 || '',
      isActive: item.isActive !== false,
      instructions: item.instructions || ''
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-950/95 text-emerald-300 border-emerald-500/50 shadow-emerald-900/30' 
            : 'bg-red-950/95 text-red-300 border-red-500/50 shadow-red-900/30'
        }`}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl shadow-black/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Payment Accounts & Methods</h2>
                <p className="text-slate-400 text-sm mt-0.5">Configure your Easypaisa, JazzCash, Bank accounts & Crypto addresses shown at checkout.</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleRestoreDefaults}
              className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white px-4 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm border border-slate-700 transition-all w-full sm:w-auto"
              title="Reset to default Pakistani accounts (Easypaisa, JazzCash, Meezan Bank)"
            >
              <RefreshCw size={16} /> Restore Standard Defaults
            </button>
            <button
              onClick={handleOpenAddModal}
              className="bg-primary-600 hover:bg-primary-500 active:scale-95 text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-lg shadow-primary-600/30 transition-all w-full sm:w-auto"
            >
              <Plus size={18} /> Add Payment Method
            </button>
          </div>
        </div>
      </div>

      {/* Quick Provider Presets Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-5">
        <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-3">Quick Add Popular Pakistani & Crypto Accounts</span>
        <div className="flex flex-wrap gap-2">
          {KNOWN_PAYMENT_PROVIDERS.map(p => {
            const logo = getProviderLogo(p.name);
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  handleOpenAddModal();
                  handleSelectPreset(p);
                }}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-primary-500/50 text-slate-200 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all group"
              >
                {logo ? (
                  <img src={logo} alt={p.name} className="w-4 h-4 object-contain rounded-full bg-white/90 p-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-[10px] font-black">
                    {p.name[0]}
                  </div>
                )}
                <span>{p.name}</span>
                <Plus size={12} className="opacity-40 group-hover:opacity-100 text-primary-400 ml-0.5" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {methods.map((method) => {
          const logo = getProviderLogo(method.providerName, method.logoUrl);
          return (
            <div
              key={method.id}
              className={`bg-slate-900/90 border ${method.isActive ? 'border-slate-800 hover:border-slate-700' : 'border-slate-800/40 opacity-60'} rounded-3xl p-6 relative group transition-all shadow-lg shadow-black/30 flex flex-col justify-between`}
            >
              <div>
                {/* Card Top / Header */}
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    {logo ? (
                      <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-md border border-slate-700 overflow-hidden shrink-0">
                        <img src={logo} alt={method.providerName} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white font-black text-lg flex items-center justify-center shadow-md shrink-0">
                        {method.providerName ? method.providerName.substring(0, 2).toUpperCase() : 'PA'}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-white leading-tight">{method.providerName}</h3>
                      <button
                        onClick={() => handleToggleActive(method)}
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 transition-colors flex items-center gap-1.5 ${
                          method.isActive 
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${method.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
                        {method.isActive ? 'Active at Checkout' : 'Disabled'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(method)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
                      title="Edit Account Details"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id, method.providerName)}
                      className="p-2 bg-primary-500/10 hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 rounded-xl border border-primary-500/20 transition-colors"
                      title="Delete Account"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Account Title</span>
                    <span className="text-white font-bold">{method.accountName}</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-900 pt-2 text-xs">
                    <span className="text-slate-500 font-semibold uppercase tracking-wider">Account / Number</span>
                    <span className="text-primary-400 font-mono font-bold text-sm tracking-wide">{method.accountNumber}</span>
                  </div>

                  {method.iban && (
                    <div className="border-t border-slate-900 pt-2 text-xs space-y-1">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider block">IBAN Number</span>
                      <span className="text-slate-200 font-mono font-bold break-all block bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-[11px]">
                        {method.iban}
                      </span>
                    </div>
                  )}

                  {method.instructions && (
                    <div className="border-t border-slate-900 pt-2 text-xs text-slate-400 italic">
                      "{method.instructions}"
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code section if available */}
              {method.qrBase64 && (
                <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <QrCode size={16} className="text-primary-400" />
                    <span>QR Code Attached</span>
                  </div>
                  <div className="w-10 h-10 bg-white p-1 rounded-lg border border-slate-700 overflow-hidden">
                    <img src={method.qrBase64} alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {methods.length === 0 && (
          <div className="col-span-full text-center py-16 bg-slate-900/60 border border-dashed border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-500">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">No Payment Accounts Configured</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">You have deleted all payment accounts. Add your custom bank/wallet or restore the presets anytime.</p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={handleOpenAddModal}
                className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/30 transition-all"
              >
                + Add Custom Account
              </button>
              <button
                onClick={handleRestoreDefaults}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 px-6 py-3 rounded-2xl font-bold text-sm transition-all flex items-center gap-2"
              >
                <RefreshCw size={16} /> Restore Presets
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl relative max-h-[92vh] overflow-y-auto minimal-scrollbar">
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingId(null);
              }}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">{editingId ? 'Edit Payment Method' : 'Add Payment Method'}</h2>
                <p className="text-xs text-slate-400">Enter account details exactly as they should appear on the customer checkout page.</p>
              </div>
            </div>

            {/* Quick Provider Picker in Modal */}
            <div className="mb-5">
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">Select Provider Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {KNOWN_PAYMENT_PROVIDERS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      formData.providerName.toLowerCase() === p.name.toLowerCase()
                        ? 'bg-primary-600/20 border-primary-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span className="truncate">{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Provider Name <span className="text-primary-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.providerName}
                    onChange={e => {
                      const val = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        providerName: val,
                        logoUrl: prev.logoUrl ? prev.logoUrl : getProviderLogo(val)
                      }));
                    }}
                    placeholder="e.g. Easypaisa, JazzCash, Meezan"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Account Title (Name) <span className="text-primary-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.accountName}
                    onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                    placeholder="e.g. Jerry Automation"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    Account / Phone Number <span className="text-primary-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.accountNumber}
                    onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="e.g. 03189418941"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                    IBAN / Branch (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.iban || ''}
                    onChange={e => setFormData({ ...formData, iban: e.target.value })}
                    placeholder="e.g. PK00MEZN000..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Custom Logo URL (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logoUrl || ''}
                    onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                  />
                  {formData.logoUrl && (
                    <div className="w-12 h-12 bg-white p-1 rounded-xl shrink-0 flex items-center justify-center border border-slate-700">
                      <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-1.5">
                  Payment Instructions (Shown to Buyer)
                </label>
                <input
                  type="text"
                  value={formData.instructions || ''}
                  onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g. Send via Easypaisa and attach transaction screenshot"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500"
                />
              </div>

              {/* QR Code Upload */}
              <div className="border border-slate-800 p-4 rounded-2xl bg-slate-950">
                <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  Account QR Code Image (Optional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="w-full sm:w-auto flex-1 border border-dashed border-slate-700 hover:border-primary-500 rounded-xl p-4 text-center cursor-pointer transition-colors">
                    <Upload size={20} className="mx-auto text-slate-400 mb-1" />
                    <span className="text-xs text-slate-300 font-bold block">Click to Upload QR Image</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG, WebP</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formData.qrBase64 && (
                    <div className="relative w-20 h-20 bg-white p-1.5 rounded-xl border border-slate-700 shrink-0">
                      <img src={formData.qrBase64} alt="QR Preview" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, qrBase64: '' })}
                        className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full text-xs shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-primary-600 rounded bg-slate-950 border-slate-700 focus:ring-primary-500"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-bold text-slate-300 cursor-pointer">
                  Enable and show this payment account on checkout
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                  }}
                  className="px-5 py-3 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 rounded-xl font-bold bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white text-sm shadow-lg shadow-primary-600/30 transition-all flex items-center gap-2"
                >
                  {isSaving ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />}
                  {editingId ? 'Save Changes' : 'Add Payment Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
