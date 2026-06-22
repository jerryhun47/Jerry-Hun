import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import * as fs from 'fs';

const serviceAccount = JSON.parse(fs.readFileSync('firebase-service-account.json', 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

async function run() {
  try {
    const user = await auth.getUserByEmail('jerryhun47@gmail.com');
    await db.collection('admins').doc(user.uid).set({
      email: 'jerryhun47@gmail.com',
      role: 'admin',
      createdAt: new Date()
    });
    console.log("Admin added:", user.uid);
  } catch(e) {
    console.error(e);
  }
}
run();
