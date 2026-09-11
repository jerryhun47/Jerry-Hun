import { db } from './firebase';
import { collection, getDocs, query, where, orderBy, doc, getDoc, limit } from 'firebase/firestore';
import { 
  DEFAULT_PRODUCTS, 
  DEFAULT_COURSES, 
  DEFAULT_PROMPTS, 
  DEFAULT_REVIEWS, 
  DEFAULT_ANNOUNCEMENTS, 
  Product, 
  PromptItem, 
  ReviewItem 
} from './defaultData';

const CACHE_KEYS = {
  PRODUCTS: 'cached_products_v2',
  COURSES: 'cached_courses_v2',
  PROMPTS: 'cached_prompts_v2',
  REVIEWS: 'cached_reviews_v2',
  ANNOUNCEMENTS: 'cached_announcements_v2',
  SETTINGS: 'cached_settings_v2',
};

function getLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const item = JSON.parse(raw);
    return item?.data || null;
  } catch (e) {
    return null;
  }
}

function setLocal<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    // Ignore storage quota errors
  }
}

function getDeletedIds(): Set<string> {
  try {
    const raw = localStorage.getItem('deleted_product_ids');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
}

export function getInstantProducts(): Product[] {
  const deleted = getDeletedIds();
  const cached = getLocal<Product[]>(CACHE_KEYS.PRODUCTS);
  const list = (cached && cached.length > 0) ? cached : DEFAULT_PRODUCTS;
  return list.filter(p => !deleted.has(p.id));
}

export function getInstantCourses(): Product[] {
  const deleted = getDeletedIds();
  const cached = getLocal<Product[]>(CACHE_KEYS.COURSES);
  const list = (cached && cached.length > 0) ? cached : DEFAULT_COURSES;
  return list.filter(p => !deleted.has(p.id));
}

export function getInstantPrompts(): PromptItem[] {
  const cached = getLocal<PromptItem[]>(CACHE_KEYS.PROMPTS);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_PROMPTS;
}

export function getInstantAnnouncements(): { text: string; isActive: boolean }[] {
  const cached = getLocal<any[]>(CACHE_KEYS.ANNOUNCEMENTS);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_ANNOUNCEMENTS;
}

/**
 * Fetch Tools & Products with fallback and local cache
 */
export async function getCachedProducts(): Promise<Product[]> {
  const deleted = getDeletedIds();
  try {
    const snapDel = await getDocs(collection(db, 'deleted_products'));
    snapDel.forEach(d => deleted.add(d.id));
    try {
      localStorage.setItem('deleted_product_ids', JSON.stringify(Array.from(deleted)));
    } catch(e) {}
  } catch(e) {}

  try {
    const q = query(collection(db, 'products'), limit(50));
    const snap = await getDocs(q);
    const prods: Product[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.is_active !== false && data.category !== 'Course' && !deleted.has(doc.id)) {
        prods.push({ id: doc.id, ...data } as Product);
      }
    });

    if (prods.length > 0) {
      setLocal(CACHE_KEYS.PRODUCTS, prods);
      return prods;
    }
  } catch (err: any) {
    // Graceful fallback for quota exceeded or network disconnect
  }

  // Fallback to local storage or defaults
  const cached = getLocal<Product[]>(CACHE_KEYS.PRODUCTS);
  const base = (cached && cached.length > 0) ? cached : DEFAULT_PRODUCTS;
  return base.filter(p => !deleted.has(p.id));
}

/**
 * Fetch Courses with fallback and local cache
 */
export async function getCachedCourses(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), where('category', '==', 'Course'), limit(20));
    const snap = await getDocs(q);
    const courses: Product[] = [];
    snap.forEach((doc) => {
      courses.push({ id: doc.id, ...doc.data() } as Product);
    });

    if (courses.length > 0) {
      setLocal(CACHE_KEYS.COURSES, courses);
      return courses;
    }
  } catch (err: any) {
    // Graceful fallback
  }

  const cached = getLocal<Product[]>(CACHE_KEYS.COURSES);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_COURSES;
}

/**
 * Fetch Prompts with fallback and local cache
 */
export async function getCachedPrompts(): Promise<PromptItem[]> {
  try {
    const snap = await getDocs(collection(db, 'prompts'));
    const prompts: PromptItem[] = [];
    snap.forEach((doc) => {
      prompts.push({ id: doc.id, ...doc.data() } as PromptItem);
    });

    if (prompts.length > 0) {
      prompts.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      const seenIds = new Set(prompts.map(p => p.id));
      const seenTitles = new Set(prompts.map(p => (p.title || '').toLowerCase().trim()));
      
      const merged = [
        ...prompts,
        ...DEFAULT_PROMPTS.filter(dp => !seenIds.has(dp.id) && !seenTitles.has(dp.title.toLowerCase().trim()))
      ];

      setLocal(CACHE_KEYS.PROMPTS, merged);
      return merged;
    }
  } catch (err: any) {
    console.warn('Could not fetch prompts from firestore, using fallback', err);
  }

  const cached = getLocal<PromptItem[]>(CACHE_KEYS.PROMPTS);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_PROMPTS;
}

/**
 * Fetch Reviews with fallback and local cache
 */
export async function getCachedReviews(): Promise<ReviewItem[]> {
  try {
    const q = query(collection(db, 'reviews'), limit(30));
    const snap = await getDocs(q);
    const reviews: ReviewItem[] = [];
    snap.forEach((doc) => {
      const data = doc.data();
      if (data.approved !== false) {
        reviews.push({ id: doc.id, ...data } as ReviewItem);
      }
    });

    if (reviews.length > 0) {
      setLocal(CACHE_KEYS.REVIEWS, reviews);
      return [...reviews, ...DEFAULT_REVIEWS];
    }
  } catch (err: any) {
    // Graceful fallback
  }

  const cached = getLocal<ReviewItem[]>(CACHE_KEYS.REVIEWS);
  if (cached && cached.length > 0) return [...cached, ...DEFAULT_REVIEWS];
  return DEFAULT_REVIEWS;
}

/**
 * Fetch Announcements with fallback
 */
export async function getCachedAnnouncements(): Promise<{ text: string; isActive: boolean }[]> {
  try {
    const q = query(collection(db, 'announcements'), limit(10));
    const snap = await getDocs(q);
    const list: any[] = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (d.isActive) list.push(d);
    });

    if (list.length > 0) {
      setLocal(CACHE_KEYS.ANNOUNCEMENTS, list);
      return list;
    }
  } catch (err: any) {
    // Graceful fallback
  }

  const cached = getLocal<any[]>(CACHE_KEYS.ANNOUNCEMENTS);
  if (cached && cached.length > 0) return cached;
  return DEFAULT_ANNOUNCEMENTS;
}
