// AIChatbot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatbot({ isOpen, onClose }: AIChatbotProps) {
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Salam! Main jerry automation ka AI assistant hn. Apko tools, courses ya refund ke baray mein ya koi aur information chahiye? Agar aap ko discount chahiye to wo bhi mil sakta hai.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const saveLog = async (userMsg: string, aiMsg: string) => {
     try {
        let city = 'Unknown';
        try {
           const res = await fetch('https://freeipapi.com/api/json/');
           const data = await res.json();
           if (data.cityName) city = data.cityName;
        } catch(e) {}
        await addDoc(collection(db, 'chat_logs'), {
           userMsg,
           aiMsg,
           city,
           createdAt: serverTimestamp()
        });
     } catch(e) { console.error('Error logging chat', e); }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const systemPrompt = `You are an AI support agent for Jerry Automation. 
Understand the website content (tools, courses, YouTube automation services, refund policy).
Price is in PKR.
Refund options: Easypaisa, JazzCash, Bank Transfer, Card.
User must provide product for refund.
Reply politely. Support languages: English, Roman Urdu, Urdu.
If user asks about discount, provide the code (SAVE30 / JERRY20 / AUTO30 - max 30% discount).
If user asks for a 'cheap tool', strictly suggest: Veo 3 Ultra, Grok AI with a short description and ask them to navigate to the tools store below to buy.
Keep responses concise, helpful, and natural.`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          systemPrompt
        }),
      });

      const data = await response.json();

      if (data.error) {
        setMessages(prev => [...prev, { role: 'model', text: data.error }]);
      } else if (data.response) {
        setMessages(prev => [...prev, { role: 'model', text: data.response }]);
        saveLog(userMessage, data.response);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I am having trouble reaching the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0, y: 20, scale: 0.95 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 20, scale: 0.95 }}
           className="fixed bottom-4 sm:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-[110] flex flex-col h-[500px]"
        >
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white border-b border-slate-800">
             <div className="flex items-center gap-3">
               <div className="bg-red-600 p-2 rounded-xl text-white">
                 <Bot size={20} />
               </div>
               <div>
                  <h3 className="font-bold text-sm">Jerry AI Support</h3>
                  <p className="text-xs text-slate-400">Online & Ready to Help</p>
               </div>
             </div>
             <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors"><Minimize2 size={18} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
             {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                      {m.text}
                   </div>
                </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-white border border-slate-200 p-3 flex gap-1 rounded-2xl rounded-tl-sm shadow-sm">
                   <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
                   <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                   <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
             <input 
               type="text" 
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder="Write a message..."
               className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-500 text-slate-900 font-medium"
             />
             <button 
               onClick={handleSend}
               disabled={isLoading || !input.trim()}
               className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white p-3 rounded-xl transition-colors"
             >
               <Send size={18} />
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
