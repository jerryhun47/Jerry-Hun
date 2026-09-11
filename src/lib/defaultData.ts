export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  is_active: boolean;
  badge?: string;
  order_index?: number;
  features?: string[];
  image_url?: string;
  rating?: number;
}

export interface PromptItem {
  id: string;
  title: string;
  shortDesc: string;
  promptLink: string;
  videoLink: string;
  videoId: string;
  imageUrl: string;
  isPremium?: boolean;
  price?: number;
}

export interface ReviewItem {
  id?: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  time?: string;
}

export function calculateYearlyPrice(monthlyPrice: number): number {
  if (monthlyPrice === 2000) return 3500;
  if (monthlyPrice === 3000) return 4500;
  return Math.round((monthlyPrice * 1.5) / 50) * 50;
}

export const DEFAULT_PRODUCTS: Product[] = [
  { 
    id: 't1', 
    name: 'Google Veo 3 Ultra', 
    description: 'Create ultra-realistic cinematic AI videos with sound in seconds. Personal account activation.', 
    price: 3000, 
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'Video', 
    is_active: true, 
    badge: 'Hot', 
    order_index: 0,
    features: ['4K HD Render', 'Instant Generation', '30 Days Warranty', '100% Personal Activation'],
    rating: 5
  },
  { 
    id: 't2', 
    name: 'Grok AI Pro', 
    description: 'X (Twitter) Grok AI Premium with realtime uncensored knowledge and super-fast reasoning.', 
    price: 3000, 
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'AI', 
    is_active: true, 
    badge: 'Popular', 
    order_index: 1,
    features: ['Fast Response', 'Real-time Web Search', 'Uncensored Image Gen', 'Full Warranty'],
    rating: 5
  },
  { 
    id: 't3', 
    name: 'Midjourney v6.1 Pro', 
    description: 'Industry-standard AI image generation for viral YouTube thumbnails and art creation.', 
    price: 3500, 
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'Design', 
    is_active: true, 
    badge: 'Best Seller', 
    order_index: 2,
    features: ['Fast GPU Hours', 'Stealth Mode', 'Commercial License', 'Discord Private Server'],
    rating: 5
  },
  { 
    id: 't4', 
    name: 'HeyGen AI Avatar Studio', 
    description: 'Generate photorealistic AI talking avatars with flawless voice synchronization and studio quality.', 
    price: 4500, 
    yearlyPrice: 6750,
    original_price: 9000,
    category: 'Video', 
    is_active: true, 
    badge: 'Trending', 
    order_index: 3,
    features: ['300+ Avatars', '120+ Languages', 'Voice Cloning', 'Instant Export'],
    rating: 5
  },
  { 
    id: 't5', 
    name: 'ElevenLabs Voice AI Pro', 
    description: 'Ultra-realistic human voiceovers for YouTube faceless channels and storytelling videos.', 
    price: 3000, 
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'Audio', 
    is_active: true, 
    badge: 'Must Have', 
    order_index: 4,
    features: ['Emotional Intonation', 'High Character Limits', 'Custom Voice Clones', 'MP3/WAV Quality'],
    rating: 5
  },
  { 
    id: 't6', 
    name: 'Canva Pro Lifetime', 
    description: 'Unlimited Canva Pro templates, brand kits, magic studio, and background remover unlocked.', 
    price: 2500, 
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'Design', 
    is_active: true, 
    badge: 'Hot', 
    order_index: 5,
    features: ['100M+ Stock Assets', 'Magic Resize', 'Full Pro Access', 'Dedicated Support'],
    rating: 5
  },
  { 
    id: 't7', 
    name: 'CapCut Pro (PC & Mobile)', 
    description: 'Unlock all CapCut Pro effects, auto-captions, 4K smooth slow-mo, and templates.', 
    price: 2500, 
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'Video', 
    is_active: true, 
    order_index: 6,
    features: ['Auto Captions AI', 'Smooth Slow Motion', 'Pro Transitions', 'No Watermark'],
    rating: 5
  },
  { 
    id: 't8', 
    name: 'ChatGPT Plus (GPT-4o & Canvas)', 
    description: 'Full ChatGPT Plus access with DALL-E 3, code interpreter, web browsing, and custom GPTs.', 
    price: 3500, 
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'AI', 
    is_active: true, 
    badge: 'Top Pick', 
    order_index: 7,
    features: ['GPT-4o Access', 'DALL-E 3 Image Generation', 'Code Analysis', 'Voice Mode'],
    rating: 5
  },
  {
    id: 't9',
    name: 'Claude 3.5 Sonnet Pro',
    description: 'Advanced AI coding, artifact creation, and complex reasoning with huge 200k context window.',
    price: 3500,
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'AI',
    is_active: true,
    badge: 'Top Choice',
    order_index: 8,
    features: ['Claude 3.5 Sonnet', 'Artifacts UI Preview', '200K Context Window', 'Priority Access'],
    rating: 5
  },
  {
    id: 't10',
    name: 'Runway Gen-3 Alpha',
    description: 'Cinematic AI video generator with high fidelity motion control and camera pan/zoom.',
    price: 4000,
    yearlyPrice: 6000,
    original_price: 8000,
    category: 'Video',
    is_active: true,
    badge: 'Cinematic',
    order_index: 9,
    features: ['Gen-3 Ultra HD', 'Motion Brush', 'Camera Controls', 'Commercial Rights'],
    rating: 5
  },
  {
    id: 't11',
    name: 'Luma Dream Machine Pro',
    description: 'High-speed realistic AI video generation with consistent physics and characters.',
    price: 3500,
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'Video',
    is_active: true,
    badge: 'Ultra Fast',
    order_index: 10,
    features: ['Fast Queue', 'High Frame Rate', 'Realistic Physics', 'No Watermark'],
    rating: 5
  },
  {
    id: 't12',
    name: 'Kling AI Pro',
    description: 'Top-tier 1080p high definition AI video generation with 10-second extended shots.',
    price: 3500,
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'Video',
    is_active: true,
    badge: 'Realistic',
    order_index: 11,
    features: ['1080p HD', 'Extended Video Gen', 'High Frame Smoothness', 'Full License'],
    rating: 5
  },
  {
    id: 't13',
    name: 'Suno AI v3.5 Music Pro',
    description: 'Generate radio-quality viral songs, background music, and vocals from any lyrics.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'Audio',
    is_active: true,
    badge: 'Music Gen',
    order_index: 12,
    features: ['2,500 Credits/mo', 'Full Commercial Rights', 'High Quality WAV/MP3', 'Stem Separation'],
    rating: 5
  },
  {
    id: 't14',
    name: 'Udio AI Music Studio',
    description: 'Create billboard-quality songs and emotional soundtracks with AI multi-instrumental mix.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'Audio',
    is_active: true,
    badge: 'Hit Maker',
    order_index: 13,
    features: ['High-Fidelity Audio', 'Full Track Extensions', 'Commercial License', 'Priority Queue'],
    rating: 5
  },
  {
    id: 't15',
    name: 'Leonardo AI Pro',
    description: 'Professional AI creative suite for game assets, character design, and photo manipulation.',
    price: 3000,
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'Design',
    is_active: true,
    badge: 'Pro Art',
    order_index: 14,
    features: ['Alchemy v2 Upscaling', 'Unlimited Generations', 'Motion Generation', 'Commercial Use'],
    rating: 5
  },
  {
    id: 't16',
    name: 'Pika 2.0 AI Video',
    description: 'Creative video effects, object melting, inflation animations, and cinematic clips.',
    price: 3000,
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'Video',
    is_active: true,
    badge: 'Effects AI',
    order_index: 15,
    features: ['Pikaffects Included', 'High FPS', 'No Watermark', 'Fast Generation'],
    rating: 5
  },
  {
    id: 't17',
    name: 'Perplexity AI Pro',
    description: 'AI research search engine with cited web sources, Claude 3.5, and GPT-4o models.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'AI',
    is_active: true,
    badge: 'Research',
    order_index: 16,
    features: ['Pro Search Unlimited', 'Claude 3.5 & GPT-4o', 'File Upload & Analysis', 'API Credits'],
    rating: 5
  },
  {
    id: 't18',
    name: 'Freepik Premium Unlimited',
    description: 'Unlimited access to millions of vector graphics, PSD mockups, AI image tools, and photos.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'Design',
    is_active: true,
    badge: 'Vectors & AI',
    order_index: 17,
    features: ['Unlimited Downloads', 'Commercial License', 'Freepik AI Generator', 'No Attribution'],
    rating: 5
  },
  {
    id: 't19',
    name: 'Envato Elements Unlimited',
    description: 'Unlimited download of WordPress themes, sound effects, stock video templates, and 3D assets.',
    price: 3000,
    yearlyPrice: 4500,
    original_price: 6000,
    category: 'Design',
    is_active: true,
    badge: 'Assets Pack',
    order_index: 18,
    features: ['Unlimited Downloads', 'Lifetime Commercial License', 'After Effects Templates', 'Stock Music'],
    rating: 5
  },
  {
    id: 't20',
    name: 'Grammarly Premium',
    description: 'Real-time AI grammar, tone detection, plagiarism checker, and full rewrite suggestions.',
    price: 1500,
    yearlyPrice: 2250,
    original_price: 3000,
    category: 'AI',
    is_active: true,
    badge: 'Writing AI',
    order_index: 19,
    features: ['Advanced Tone Adjustments', 'Plagiarism Detection', 'Word Choice Enhancements', 'Desktop App'],
    rating: 5
  },
  {
    id: 't21',
    name: 'QuillBot Premium',
    description: 'Unlimited AI paraphrasing modes, freeze words, summarizer, and citation generator.',
    price: 1500,
    yearlyPrice: 2250,
    original_price: 3000,
    category: 'AI',
    is_active: true,
    badge: 'Paraphraser',
    order_index: 20,
    features: ['Unlimited Words', 'All 8 Paraphrase Modes', 'Fast Processing', 'Grammar Checker'],
    rating: 5
  },
  {
    id: 't22',
    name: 'Topaz Video AI',
    description: 'Upscale low-resolution videos to 4K/8K, de-noise footage, and interpolate 60 FPS.',
    price: 4000,
    yearlyPrice: 6000,
    original_price: 8000,
    category: 'Video',
    is_active: true,
    badge: '8K Upscaler',
    order_index: 21,
    features: ['4K/8K AI Upscale', '60fps Frame Interpolation', 'De-noise & Shake Removal', 'Full License'],
    rating: 5
  },
  {
    id: 't23',
    name: 'VidIQ Boost Max',
    description: 'YouTube SEO booster, daily AI video ideas, competitor tracking, and tag generator.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'SEO',
    is_active: true,
    badge: 'YouTube Rank',
    order_index: 22,
    features: ['Unlimited AI Video Ideas', 'Keyword Search Volume', 'Top Competitor Analysis', 'SEO Scorecard'],
    rating: 5
  },
  {
    id: 't24',
    name: 'TubeBuddy Legend',
    description: 'A/B thumbnail testing, bulk metadata processing, and high rank search keyword finder.',
    price: 2500,
    yearlyPrice: 3750,
    original_price: 5000,
    category: 'SEO',
    is_active: true,
    badge: 'Tags & SEO',
    order_index: 23,
    features: ['A/B Thumbnail Testing', 'Bulk Title & Tag Updates', 'Search Rank Tracking', 'Full Legend Access'],
    rating: 5
  },
  {
    id: 't25',
    name: 'Adobe Creative Cloud All Apps',
    description: 'Premiere Pro, After Effects, Photoshop, Illustrator, Audition, and Firefly AI unlocked.',
    price: 6500,
    yearlyPrice: 9750,
    original_price: 13000,
    category: 'Design',
    is_active: true,
    badge: '20+ Apps',
    order_index: 24,
    features: ['All 20+ Adobe Desktop Apps', 'Adobe Firefly AI Credits', 'Cloud Sync', '100% Genuine Activation'],
    rating: 5
  },
  {
    id: 't26',
    name: 'Cursor AI IDE Pro',
    description: 'The world-leading AI-powered code editor with codebase indexing and multi-file editing.',
    price: 3500,
    yearlyPrice: 5250,
    original_price: 7000,
    category: 'Developer',
    is_active: true,
    badge: 'Code AI',
    order_index: 25,
    features: ['Claude 3.5 & GPT-4o in Editor', 'Full Codebase Indexing', 'Fast Copilot Autocomplete', 'Terminal AI'],
    rating: 5
  },
  {
    id: 't27',
    name: 'Vizard AI Video Clipper',
    description: 'Turn long YouTube podcasts and videos into 10+ viral TikToks/Shorts with auto AI captions.',
    price: 2800,
    yearlyPrice: 4200,
    original_price: 5600,
    category: 'Video',
    is_active: true,
    badge: 'Viral Shorts',
    order_index: 26,
    features: ['Auto AI Viral Clipping', 'Animated Subtitles', 'Speaker Auto-Framing', '1080p 60fps Export'],
    rating: 5
  }
];

export const DEFAULT_SAMPLE_ORDERS = [
  {
    id: 'ord_1001',
    customer_name: 'Muhammad Usman Tariq',
    customer_email: 'usman.tariq92@gmail.com',
    customer_phone: '+923001234567',
    tool_name: 'Google Veo 3 Ultra',
    total_price: 3000,
    status: 'completed',
    payment_method: 'Easypaisa',
    transaction_id: 'TRX-8829104',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 3 },
    created_at_formatted: 'Today, 11:30 AM'
  },
  {
    id: 'ord_1002',
    customer_name: 'Zainab Bibi',
    customer_email: 'zainab.creatives@gmail.com',
    customer_phone: '+923219876543',
    tool_name: 'Midjourney v6.1 Pro',
    total_price: 3500,
    status: 'completed',
    payment_method: 'JazzCash',
    transaction_id: 'TRX-9948271',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 6 },
    created_at_formatted: 'Today, 8:15 AM'
  },
  {
    id: 'ord_1003',
    customer_name: 'Hamza Khan',
    customer_email: 'hamzakhan.ai@outlook.com',
    customer_phone: '+923335551234',
    tool_name: 'Grok AI Pro',
    total_price: 3000,
    status: 'completed',
    payment_method: 'Bank Transfer (Meezan)',
    transaction_id: 'MEEZAN-482910',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 12 },
    created_at_formatted: 'Yesterday, 6:45 PM'
  },
  {
    id: 'ord_1004',
    customer_name: 'Ali Raza',
    customer_email: 'aliraza.yt@gmail.com',
    customer_phone: '+923124449876',
    tool_name: 'ElevenLabs Voice AI Pro',
    total_price: 3000,
    status: 'pending',
    payment_method: 'Easypaisa',
    transaction_id: 'EP-5920194',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 1 },
    created_at_formatted: 'Today, 1:20 PM'
  },
  {
    id: 'ord_1005',
    customer_name: 'Bilal Ahmed',
    customer_email: 'bilal.ahmed01@gmail.com',
    customer_phone: '+923456789012',
    tool_name: 'HeyGen AI Avatar Studio',
    total_price: 4500,
    status: 'completed',
    payment_method: 'JazzCash',
    transaction_id: 'JC-8839201',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 24 },
    created_at_formatted: 'Yesterday, 10:00 AM'
  },
  {
    id: 'ord_1006',
    customer_name: 'Fahad Qureshi',
    customer_email: 'fahad.automation@gmail.com',
    customer_phone: '+923159988776',
    tool_name: 'ChatGPT Plus (GPT-4o & Canvas)',
    total_price: 3500,
    status: 'completed',
    payment_method: 'Easypaisa',
    transaction_id: 'EP-7749201',
    screenshot_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
    createdAt: { toMillis: () => Date.now() - 3600000 * 30 },
    created_at_formatted: '2 days ago'
  }
];

export const DEFAULT_SAMPLE_USERS = [
  { id: 'u1', name: 'Muhammad Usman Tariq', email: 'usman.tariq92@gmail.com', phone: '+923001234567', totalSpent: 6000, ordersCount: 2, role: 'Customer', createdAt: '2026-03-01' },
  { id: 'u2', name: 'Zainab Bibi', email: 'zainab.creatives@gmail.com', phone: '+923219876543', totalSpent: 3500, ordersCount: 1, role: 'Customer', createdAt: '2026-03-02' },
  { id: 'u3', name: 'Hamza Khan', email: 'hamzakhan.ai@outlook.com', phone: '+923335551234', totalSpent: 8000, ordersCount: 3, role: 'VIP Customer', createdAt: '2026-02-15' },
  { id: 'u4', name: 'Ali Raza', email: 'aliraza.yt@gmail.com', phone: '+923124449876', totalSpent: 3000, ordersCount: 1, role: 'Customer', createdAt: '2026-03-05' },
  { id: 'u5', name: 'Bilal Ahmed', email: 'bilal.ahmed01@gmail.com', phone: '+923456789012', totalSpent: 9500, ordersCount: 2, role: 'VIP Customer', createdAt: '2026-02-20' },
  { id: 'u6', name: 'Fahad Qureshi', email: 'fahad.automation@gmail.com', phone: '+923159988776', totalSpent: 6000, ordersCount: 2, role: 'Customer', createdAt: '2026-02-28' }
];

export const DEFAULT_SAMPLE_CONTACTS = [
  { id: 'c1', name: 'Tariq Mehmood', email: 'tariq.m@gmail.com', phone: '+923012345678', subject: 'Account Activation Time', message: 'Assalam o Alaikum Jerry bhai, payment karne ke baad Veo 3 kitni der me activate ho jata hai?', is_read: false, createdAt: { toMillis: () => Date.now() - 3600000 * 2 } },
  { id: 'c2', name: 'Saad Malik', email: 'saadmalik.yt@yahoo.com', phone: '+923349876543', subject: 'Course Support', message: 'YouTube automation course me live session ka time kya hoga?', is_read: true, createdAt: { toMillis: () => Date.now() - 3600000 * 18 } }
];

export const DEFAULT_COURSES: Product[] = [
  {
    id: 'c1',
    name: 'Master YouTube AI Automation (2026 Edition)',
    description: 'Complete step-by-step masterclass on building faceless YouTube channels from zero to $5,000/mo using latest AI video tools, automated workflows, and viral niche blueprints.',
    price: 5000,
    original_price: 15000,
    category: 'Course',
    is_active: true,
    badge: 'Best Seller',
    order_index: 0,
    features: [
      'Over 25+ HD Video Lessons',
      'Tested High-RPM Viral Niches',
      'Automated Scripting & Voiceover Templates',
      'Private VIP Community & Live Weekly Q&A',
      'Lifetime Access & Regular Updates'
    ],
    rating: 5
  },
  {
    id: 'c2',
    name: 'Faceless Cash Cow YouTube Blueprint',
    description: 'Learn the exact strategies used to generate millions of views with AI video generators, thumbnail psychology, and SEO algorithms without showing your face.',
    price: 4000,
    original_price: 10000,
    category: 'Course',
    is_active: true,
    badge: 'Popular',
    order_index: 1,
    features: [
      'Complete Channel Setup & SEO',
      'High Click-Through Rate (CTR) Thumbnail Masterclass',
      'Monetization & Sponsorship Playbook',
      'Direct Support on WhatsApp'
    ],
    rating: 5
  }
];

export const DEFAULT_PROMPTS: PromptItem[] = [
  {
    id: 'p1',
    title: 'ASMR Jungle Survival Videos',
    shortDesc: 'Create viral AI-generated ASMR jungle survival videos with realistic scenes, cinematic storytelling, and high engagement potential.',
    promptLink: 'https://1drv.ms/w/c/d016762f4a3e27b6/IQCS0QyPyilQSaSLkUGQasQoAekXgo_Hk2qu7tfP8W9crUs?e=4hSrVk',
    videoLink: 'https://www.youtube.com/watch?v=hQHKp7X2VP4',
    videoId: 'hQHKp7X2VP4',
    imageUrl: 'https://img.youtube.com/vi/hQHKp7X2VP4/maxresdefault.jpg'
  },
  {
    id: 'p2',
    title: 'Viral Renovation AI Videos (Method 1)',
    shortDesc: 'Learn how to create viral AI renovation videos using a proven workflow with strong audience retention.',
    promptLink: 'https://docs.google.com/document/d/1SQ4nx44otgQh8AcEYc7jOffXo2OTyzOKhBW6X_0MVAk/edit?usp=sharing',
    videoLink: 'https://www.youtube.com/watch?v=xIhL6BRTMMs',
    videoId: 'xIhL6BRTMMs',
    imageUrl: 'https://img.youtube.com/vi/xIhL6BRTMMs/maxresdefault.jpg'
  },
  {
    id: 'p3',
    title: 'Forest Survival Viral Videos (Urdu Style)',
    shortDesc: 'Generate viral forest survival videos with Urdu-style storytelling and cinematic AI visuals.',
    promptLink: 'https://docs.google.com/document/d/1zFi59mFOgDDDcBQLEbxcRgIEIcb-C-yMmi8TPV4PVmQ/edit?usp=sharing',
    videoLink: 'https://www.youtube.com/watch?v=KgKAxp8BC78',
    videoId: 'KgKAxp8BC78',
    imageUrl: 'https://img.youtube.com/vi/KgKAxp8BC78/maxresdefault.jpg'
  },
  {
    id: 'p4',
    title: 'Home Renovation Timelapse AI',
    shortDesc: 'Create realistic AI home renovation timelapse videos with before-and-after transformations.',
    promptLink: 'https://www.skool.com/aiperson-community',
    videoLink: 'https://www.youtube.com/watch?v=-jB6bG3u6HU',
    videoId: '-jB6bG3u6HU',
    imageUrl: 'https://img.youtube.com/vi/-jB6bG3u6HU/maxresdefault.jpg'
  },
  {
    id: 'p5',
    title: 'Viral Renovation Fast Method',
    shortDesc: 'Fast workflow for creating high-performing AI renovation content.',
    promptLink: 'https://docs.google.com/document/d/14RS4v_7xxaxfJnHwVc6Y6nvoG9G_2raA0g5pwD3_dSA/edit?usp=sharing',
    videoLink: 'https://www.youtube.com/watch?v=aK9vqjpfNXw',
    videoId: 'aK9vqjpfNXw',
    imageUrl: 'https://img.youtube.com/vi/aK9vqjpfNXw/maxresdefault.jpg'
  },
  {
    id: 'p6',
    title: 'AI Renovation Community Prompt Pack',
    shortDesc: 'Premium renovation prompt collection used by AI content creators.',
    promptLink: 'https://t.me/tryaipipeline',
    videoLink: 'https://www.youtube.com/watch?v=GxmQ4FYVhcI',
    videoId: 'GxmQ4FYVhcI',
    imageUrl: 'https://img.youtube.com/vi/GxmQ4FYVhcI/maxresdefault.jpg'
  },
  {
    id: 'p7',
    title: 'AI Home Renovation Viral (Free Tools)',
    shortDesc: 'Learn to create viral AI home renovation videos using free AI tools.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=X-gW0jJy_3A',
    videoId: 'X-gW0jJy_3A',
    imageUrl: 'https://img.youtube.com/vi/X-gW0jJy_3A/maxresdefault.jpg'
  },
  {
    id: 'p8',
    title: 'Hyper-Speed AI Renovation',
    shortDesc: 'Create hyper-speed renovation transformations using AI automation.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=DjUjDbQpoyc',
    videoId: 'DjUjDbQpoyc',
    imageUrl: 'https://img.youtube.com/vi/DjUjDbQpoyc/maxresdefault.jpg'
  },
  {
    id: 'p9',
    title: 'Viral Renovation Timelapse (Free AI)',
    shortDesc: 'Free AI workflow for creating renovation timelapse content.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=3rEegtmSHwg',
    videoId: '3rEegtmSHwg',
    imageUrl: 'https://img.youtube.com/vi/3rEegtmSHwg/maxresdefault.jpg'
  },
  {
    id: 'p10',
    title: 'AI Renovation Step-by-Step',
    shortDesc: 'Complete step-by-step renovation video creation process.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=sPNvvCOIDBY',
    videoId: 'sPNvvCOIDBY',
    imageUrl: 'https://img.youtube.com/vi/sPNvvCOIDBY/maxresdefault.jpg'
  },
  {
    id: 'p11',
    title: 'Viral Home Makeover AI',
    shortDesc: 'Generate realistic AI home makeover videos for social media.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=K1X8gz3k0nQ',
    videoId: 'K1X8gz3k0nQ',
    imageUrl: 'https://img.youtube.com/vi/K1X8gz3k0nQ/maxresdefault.jpg'
  },
  {
    id: 'p12',
    title: 'AI Home Build Viral Style',
    shortDesc: 'Create viral home building transformations with AI.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=vswSUU--3WE',
    videoId: 'vswSUU--3WE',
    imageUrl: 'https://img.youtube.com/vi/vswSUU--3WE/maxresdefault.jpg'
  },
  {
    id: 'p13',
    title: 'Before/After AI House Viral',
    shortDesc: 'Create dramatic before-and-after AI property transformations.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=FkLDxLovuHI',
    videoId: 'FkLDxLovuHI',
    imageUrl: 'https://img.youtube.com/vi/FkLDxLovuHI/maxresdefault.jpg'
  },
  {
    id: 'p14',
    title: 'AI Property Selling Videos',
    shortDesc: 'AI-generated real estate and property marketing videos.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=5isRZsd2VhI',
    videoId: '5isRZsd2VhI',
    imageUrl: 'https://img.youtube.com/vi/5isRZsd2VhI/maxresdefault.jpg'
  },
  {
    id: 'p15',
    title: 'Abandoned House to Dream Home',
    shortDesc: 'Transform abandoned houses into dream homes using AI-generated visuals.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=6LmsXtIVNKc',
    videoId: '6LmsXtIVNKc',
    imageUrl: 'https://img.youtube.com/vi/6LmsXtIVNKc/maxresdefault.jpg'
  },
  {
    id: 'p16',
    title: 'Viral Aesthetic AI Homes',
    shortDesc: 'Create aesthetic AI home videos with strong viral potential.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=RD0Z9G9HCk0',
    videoId: 'RD0Z9G9HCk0',
    imageUrl: 'https://img.youtube.com/vi/RD0Z9G9HCk0/maxresdefault.jpg'
  },
  {
    id: 'p17',
    title: 'Exterior AI House Videos',
    shortDesc: 'Generate realistic exterior home showcase videos using AI.',
    promptLink: '',
    videoLink: 'https://www.youtube.com/watch?v=zxNqpwrIw7c',
    videoId: 'zxNqpwrIw7c',
    imageUrl: 'https://img.youtube.com/vi/zxNqpwrIw7c/maxresdefault.jpg'
  }
];

export const DEFAULT_REVIEWS: ReviewItem[] = [
  { name: 'Ali Raza', city: 'Lahore', text: 'Bhai zabardast tool hai, highly recommended! Delivery 5 minutes me mil gayi. 💯', rating: 5, time: '2 hours ago' },
  { name: 'Usman Tariq', city: 'Karachi', text: 'Service bohat fast thi, Veo 3 Ultra meri personal mail par instantly activate ho gaya.', rating: 5, time: '4 hours ago' },
  { name: 'Zainab Bibi', city: 'Islamabad', text: 'Meri YouTube automation bilkul set chal rahi hai ab. Highly satisfied!', rating: 5, time: '6 hours ago' },
  { name: 'Hamza Khan', city: 'Peshawar', text: 'Best investment mene apni life me ki hai! Grok AI pro seamlessly working.', rating: 5, time: '8 hours ago' },
  { name: 'Bilal Ahmed', city: 'Multan', text: 'Bohat zabardast system banaya hai Jerry ne. Support team WhatsApp par bohat helpful hai.', rating: 5, time: '12 hours ago' },
  { name: 'Ayesha Gul', city: 'Faisalabad', text: 'Meri channel views me 4x izafa hua hai in prompts aur tools ki wajah se.', rating: 5, time: '1 day ago' },
  { name: 'Fahad Qureshi', city: 'Rawalpindi', text: 'Support system super responsive hai, issue solve instantly ho jata hai.', rating: 5, time: '1 day ago' },
  { name: 'Omer Farooq', city: 'Quetta', text: 'Worth every single penny. Completely automated tools.', rating: 5, time: '2 days ago' }
];

export const DEFAULT_ANNOUNCEMENTS = [
  { text: '🔥 Flash Sale: 50% OFF on all 27 AI Video Tools today! Limited Time Offer.', isActive: true },
  { text: '⚡ Instant Account Activation on your Personal Gmail with 30-Day Replacement Warranty.', isActive: true },
  { text: '🚀 New: Google Veo 3 Ultra & Grok AI Pro Now Available in Store!', isActive: true },
  { text: '💬 24/7 WhatsApp Support: +92 318 9418941 for instant order confirmation.', isActive: true }
];

