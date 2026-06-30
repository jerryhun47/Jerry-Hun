import { db } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export interface BanCheckResult {
  isBanned: boolean;
  reason?: string;
}

export async function checkIsBanned(phone: string, email: string, ipAddress: string): Promise<BanCheckResult> {
  const cleanPhone = phone ? phone.trim() : '';
  const cleanEmail = email ? email.trim().toLowerCase() : '';
  const cleanIp = ipAddress ? ipAddress.trim() : '';

  try {
    if (cleanIp && cleanIp !== 'Unknown') {
      const qIp = query(collection(db, 'banned_users'), where('ip', '==', cleanIp));
      const snapIp = await getDocs(qIp);
      if (!snapIp.empty) {
        return { isBanned: true, reason: snapIp.docs[0].data().reason || 'Banned due to suspicious/spam activity' };
      }
    }

    if (cleanPhone && cleanPhone !== 'N/A' && cleanPhone !== 'Unknown') {
      const qPhone = query(collection(db, 'banned_users'), where('phone', '==', cleanPhone));
      const snapPhone = await getDocs(qPhone);
      if (!snapPhone.empty) {
        return { isBanned: true, reason: snapPhone.docs[0].data().reason || 'Banned phone number' };
      }
    }

    if (cleanEmail) {
      const qEmail = query(collection(db, 'banned_users'), where('email', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      if (!snapEmail.empty) {
        return { isBanned: true, reason: snapEmail.docs[0].data().reason || 'Banned email address' };
      }
    }

    return { isBanned: false };
  } catch (err) {
    console.error('Error checking ban list:', err);
    return { isBanned: false };
  }
}

export async function checkDuplicateOrder(phone: string, email: string, productId: string, productName: string, customerName: string): Promise<BanCheckResult> {
  const cleanPhone = phone ? phone.trim() : '';
  const cleanEmail = email ? email.trim().toLowerCase() : '';

  try {
    let isDuplicate = false;
    
    if (cleanEmail) {
      const qEmail = query(collection(db, 'orders'), where('customer_email', '==', cleanEmail));
      const snapEmail = await getDocs(qEmail);
      snapEmail.forEach(doc => {
         if (doc.data().product_id === productId) {
             isDuplicate = true;
         }
      });
    }

    if (!isDuplicate && cleanPhone && cleanPhone !== 'N/A' && cleanPhone !== 'Unknown') {
      const qPhone = query(collection(db, 'orders'), where('customer_phone', '==', cleanPhone));
      const snapPhone = await getDocs(qPhone);
      snapPhone.forEach(doc => {
         if (doc.data().product_id === productId) {
             isDuplicate = true;
         }
      });
    }

    if (isDuplicate) {
      await addDoc(collection(db, 'duplicate_attempts'), {
         name: customerName,
         email: cleanEmail,
         phone: cleanPhone,
         productName: productName,
         productId: productId,
         createdAt: serverTimestamp()
      });
      return { isBanned: true, reason: 'duplicate order hy apka ap place nhe kr sakty order' };
    }

    return { isBanned: false };
  } catch (err) {
    console.error('Error checking duplicate order:', err);
    return { isBanned: false };
  }
}

export async function checkAndBanIfSpamming(phone: string, email: string, ipAddress: string): Promise<BanCheckResult> {
  const banCheck = await checkIsBanned(phone, email, ipAddress);
  if (banCheck.isBanned) {
    return banCheck;
  }

  const cleanPhone = phone ? phone.trim() : '';
  const cleanIp = ipAddress ? ipAddress.trim() : '';

  let pendingCount = 0;
  const matchIds = new Set<string>();

  try {
    if (cleanPhone && cleanPhone !== 'N/A' && cleanPhone !== 'Unknown') {
      const q = query(
        collection(db, 'orders'),
        where('customer_phone', '==', cleanPhone),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      snap.forEach(doc => matchIds.add(doc.id));
    }

    if (cleanIp && cleanIp !== 'Unknown') {
      const q = query(
        collection(db, 'orders'),
        where('ipAddress', '==', cleanIp),
        where('status', '==', 'pending')
      );
      const snap = await getDocs(q);
      snap.forEach(doc => matchIds.add(doc.id));
    }

    pendingCount = matchIds.size;

    if (pendingCount >= 3) {
      const reason = 'Banned automatically for spamming/multiple fake or unpaid pending orders';
      await addDoc(collection(db, 'banned_users'), {
        ip: cleanIp || '',
        phone: cleanPhone || '',
        email: email ? email.toLowerCase().trim() : '',
        reason,
        createdAt: serverTimestamp()
      });
      return { isBanned: true, reason };
    }

    return { isBanned: false };
  } catch (err) {
    console.error('Error verifying spam count:', err);
    return { isBanned: false };
  }
}
