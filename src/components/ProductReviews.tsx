import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, MessageCircle, Info } from 'lucide-react';

const NAMES = ['Ali', 'Fahad', 'Usman', 'Ahmed', 'Bilal', 'Zain', 'Hamza', 'Saad', 'Hassan', 'Zeeshan', 'Umar', 'Waqas', 'Talha', 'Shaheer', 'Nabeel'];
const CITIES = ['Lahore', 'Rawalpindi', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan', 'Gujranwala', 'Peshawar', 'Sialkot', 'Quetta'];
const TIMES = ['2 hours ago', '5 hours ago', '1 day ago', '2 days ago', '3 days ago', '1 week ago', '2 weeks ago', '1 month ago'];

const GENERAL_TEMPLATES = [
  "bhai account instantly mil gaya, {productName} perfect working hy.",
  "legit seller, highly recommended. Payment karte hi access mil gaya tha.",
  "scene on hy, full working tool {productName}. Koi error nahi aya.",
  "Mene {productName} liya tha, Jerry ne meri personal Gmail pe activate kr ke diya, 30 days warranty bhi mili 🔥",
  "Trusted! {productName} use kar raha hu pichle kafi dino se, 100% stable hy.",
  "Fast delivery aur support. {productName} bohat smooth chal raha hy.",
  "{productName} ke liye best seller. Pricing bhi affordable hy Pakistan me awam k hisab se.",
  "Log in me thora masla tha lekin Jerry ne immediately fix kar diya. Highly recommended.",
  "Very smooth, direct payment ki and fast access mil gya {productName} ka.",
  "100% genuine hy. Mera plan upgrade karne ka irada hy aglay month.",
  "Very reliable. {productName} use karne me koi masla nahi aya mujhe.",
  "Support best hy. Go for {productName} blindly guys.",
  "Mera first time experience tha online software buy krne ka, bohat acha raha.",
  "Premium tool at a cheap price! Thanks for {productName} man."
];

const SPECIFIC_TEMPLATES: Record<string, string[]> = {
  "veo 3 ultra": [
    "Video quality next level hy, ultra smooth output ✨",
    "Generations time fast hy, impressive results from Veo 3 Ultra.",
    "Mene Veo 3 Ultra liya tha, Jerry ne meri personal Gmail pe activate kr ke diya, 30 days warranty bhi mili"
  ],
  "heygen": [
    "HeyGen ka avatar system bohat smooth hy, lip sync perfect lag rhi hy.",
    "Login issue aya tha, refund apply kiya aur thori dair me credit wapus mil gya, support is great.",
    "{productName} ki process speed and avatars realistic hain."
  ],
  "midjourney": [
    "Thumbnails ke liye best hy, insane rendering results 🎨",
    "Fast access mil gaya meri mail pe. {productName} prompt exactly generate kr rha hy.",
    "Bina kisi delay ke access mila discord pe. Awesome."
  ]
};

export default function ProductReviews({ productId, productName }: { productId: string, productName: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', text: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);

  // Generate dynamic fake reviews for the product
  const dynamicReviews = useMemo(() => {
    if (!productName) return [];
    
    // Determine if we have specific templates for this product
    const pNameLower = productName.toLowerCase();
    let specific: string[] = [];
    if (pNameLower.includes("veo")) specific = SPECIFIC_TEMPLATES["veo 3 ultra"];
    else if (pNameLower.includes("heygen")) specific = SPECIFIC_TEMPLATES["heygen"];
    else if (pNameLower.includes("midjourney")) specific = SPECIFIC_TEMPLATES["midjourney"];

    // Combine templates
    const templatesPool = [...GENERAL_TEMPLATES, ...specific, ...specific]; // Weight specific templates higher
    
    // Shuffle helper
    const shuffle = (arr: any[]) => [...arr].sort(() => 0.5 - Math.random());
    
    const count = Math.floor(Math.random() * 3) + 8; // 8 to 10
    const shuffledNames = shuffle(NAMES);
    const shuffledTemplates = shuffle(templatesPool);

    const generated = [];
    for (let i = 0; i < count; i++) {
        const name = shuffledNames[i % shuffledNames.length];
        const city = CITIES[Math.floor(Math.random() * CITIES.length)];
        const time = TIMES[Math.floor(Math.random() * TIMES.length)];
        
        let template = shuffledTemplates[i % shuffledTemplates.length];
        template = template.replace(/{productName}/g, productName);

        // Calculate a 4.7 to 5.0 rating text
        const ratingVal = Math.random() > 0.7 ? 4 : 5;
        const exactRating = ratingVal === 5 ? "5.0" : (4.7 + Math.random() * 0.2).toFixed(1);

        generated.push({
            id: `fake_${i}`,
            name,
            city,
            time,
            text: template,
            rating: ratingVal,
            exactRating,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=0f172a`
        });
    }
    
    // Sort reviews by the time strings roughly to mimic chronologial order (optional, here we just randomly display them)
    return generated;
  }, [productId, productName]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', productId),
          where('approved', '==', true)
        );
        const snap = await getDocs(q);
        const fetched = snap.docs.map(doc => {
            const data = doc.data();
            const timeDiff = Date.now() - (data.createdAt?.toMillis() || Date.now());
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            let timeStr = 'Just now';
            if (days > 0) timeStr = `${days} days ago`;
            else timeStr = 'Today';

            return {
                id: doc.id,
                ...data,
                time: timeStr,
                exactRating: data.rating === 5 ? "5.0" : "4.0"
            };
        });
        
        setReviews([...fetched, ...dynamicReviews]); // Combine real and dynamic fake
      } catch (err) {
        console.error("Failed to load reviews", err);
        setReviews(dynamicReviews); // Fallback to dynamic if db fails
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchReviews();
  }, [productId, dynamicReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.text) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId,
        productName,
        name: newReview.name,
        city: 'Online',
        text: newReview.text,
        rating: newReview.rating,
        image: '', // Can be extended if needed
        approved: false,
        createdAt: serverTimestamp()
      });
      setShowAdd(false);
      setNewReview({ name: '', text: '', rating: 5 });
      alert("Review submitted successfully! It will appear once approved by admin.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit review. Try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
           <h3 className="text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              Customer Reviews
           </h3>
           <p className="text-slate-400 text-sm mt-1">Verified customers share their experience with {productName}</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 active:scale-95"
        >
          {showAdd ? 'Cancel Review' : 'Write a Review'}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="mb-10 bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-in fade-in zoom-in-95 shadow-xl">
          <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
             <MessageCircle size={20} className="text-red-500"/> Submit Your Review
          </h4>
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase block mb-1">Full Name</label>
                <input type="text" required value={newReview.name} onChange={e => setNewReview({ ...newReview, name: e.target.value })} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Ali Khan" />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-bold uppercase block mb-1">City / Location</label>
                <input type="text" value={(newReview as any).city || ''} onChange={e => setNewReview({ ...newReview, city: e.target.value } as any)} className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="e.g. Lahore" />
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase block mb-2">How would you rate it?</label>
              <div className="flex gap-2">
                {[1,2,3,4,5].map(star => (
                   <button 
                     key={star} 
                     type="button"
                     onClick={() => setNewReview({ ...newReview, rating: star })}
                     className="focus:outline-none hover:scale-110 transition-transform"
                   >
                     <Star size={32} className={newReview.rating >= star ? "fill-yellow-400 text-yellow-400" : "text-slate-800"} />
                   </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-bold uppercase block mb-1">Your detailed experience</label>
              <textarea required rows={4} value={newReview.text} onChange={e => setNewReview({ ...newReview, text: e.target.value })} className="w-full resize-none bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500 outline-none" placeholder="Share your experience using this product..." />
            </div>
            <div className="pt-2">
              <button type="submit" disabled={submitting} className="bg-white text-slate-900 font-black px-8 py-3 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 inline-flex w-full sm:w-auto justify-center">
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 animate-pulse">Loading verified reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
           <Info size={32} className="mx-auto text-slate-600 mb-4" />
           <p className="text-slate-400 font-medium">No reviews yet for this product.</p>
           <p className="text-slate-500 text-sm mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, idx) => (
            <div key={r.id || idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl hover:border-slate-700 transition-colors duration-300">
              <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center gap-3">
                   {r.avatar ? (
                     <img src={r.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800" />
                   ) : (
                     <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-white font-black uppercase text-lg shadow-sm border border-slate-700">
                       {r.name?.[0] || 'U'}
                     </div>
                   )}
                   <div>
                     <p className="text-white font-bold text-base leading-tight flex items-center gap-1.5">
                       {r.name}
                     </p>
                     <div className="flex items-center gap-2 mt-0.5">
                       <p className="text-slate-400 text-xs uppercase tracking-wide font-semibold">
                         {r.city || 'Verified Buyer'} • <span className="lowercase">{r.time || '1 day ago'}</span>
                       </p>
                     </div>
                   </div>
                 </div>
                 <div className="flex flex-col items-end gap-1">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < (r.rating || 5) ? "fill-yellow-400 text-yellow-400" : "text-slate-800"} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-yellow-500">{r.exactRating || '5.0'}</span>
                 </div>
              </div>
              <p className="text-slate-300 text-[15px] leading-relaxed whitespace-pre-line font-medium">{r.text}</p>
              {r.image && (
                <div className="mt-4 border border-slate-800 rounded-xl overflow-hidden bg-slate-950 inline-block">
                  <img src={r.image} alt="User attached" className="max-h-48 object-contain" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
