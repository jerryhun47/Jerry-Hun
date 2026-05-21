import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs, updateDoc } from 'firebase/firestore';
import * as fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = initializeFirestore(app, {}, config.firestoreDatabaseId);

const highValue = ["Sora 2 AI Video Generator", "Runway ML Pro", "Midjourney Pro Plan", "Synthesia AI Pro", "Luma AI Pro", "Adobe Firefly Pro", "Google Veo 3 Ultra (45K Credits)"];
const midValue = ["ElevenLabs Pro Voice AI", "Leonardo AI Pro", "Pika Labs Pro", "Canva Pro", "Grok AI Super Account", "HeyGen AI Avatar Pro", "Kling AI Premium"];
const lowValue = ["Copy AI Pro", "Jasper AI Pro", "Descript Pro AI", "Hugging Face Pro", "DeepSeek AI Pro", "PlayHT AI Voice Pro", "CapCut Pro Subscription", "D-ID AI Avatar Pro", "ChatGPT Plus (GPT-4/5 Access)"];

async function updatePricing() {
  const snap = await getDocs(collection(db, 'products'));
  for (const doc of snap.docs) {
    const p = doc.data();
    let mPrice = 3200;
    let yPrice = 5000;
    
    if (highValue.includes(p.name)) { mPrice = 3500; yPrice = 5500; }
    else if (midValue.includes(p.name)) { mPrice = 3000; yPrice = 4800; }
    else if (lowValue.includes(p.name)) { mPrice = 2600; yPrice = 4200; }
    else { mPrice = 3200; yPrice = 5000; }

    let det = p.detail || "";
    // Remove old hardcoded pricing texts gracefully
    det = det.replace(/💰 Monthly Plan:.*?\n/ig, '');
    det = det.replace(/📅 Yearly Plan:.*?\n/ig, '');
    
    try {
      await updateDoc(doc.ref, { price: mPrice, yearlyPrice: yPrice, detail: det });
      console.log(`Updated pricing for ${p.name}: Monthly=${mPrice}, Yearly=${yPrice}`);
    } catch (err: any) {
      console.error(`Failed to update ${p.name} (ID: ${doc.id}):`, err.message);
    }
  }
  process.exit();
}

updatePricing().catch(console.error);
