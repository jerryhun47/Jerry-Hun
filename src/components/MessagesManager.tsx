import React from 'react';
import { updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface MessagesManagerProps {
  contacts: any[];
  refresh: () => void;
}

export default function MessagesManager({ contacts, refresh }: MessagesManagerProps) {
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
