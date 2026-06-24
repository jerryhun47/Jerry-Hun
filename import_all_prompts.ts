import { db } from './src/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, serverTimestamp, doc } from 'firebase/firestore';

const rawData = `
PROMPT 1
Title
ASMR Jungle Survival Videos
Prompt Link
https://1drv.ms/w/c/d016762f4a3e27b6/IQCS0QyPyilQSaSLkUGQasQoAekXgo_Hk2qu7tfP8W9crUs?e=4hSrVk
YouTube Video Link
https://www.youtube.com/watch?v=hQHKp7X2VP4
Short Description
Create viral AI-generated ASMR jungle survival videos with realistic scenes, cinematic storytelling, and high engagement potential.

PROMPT 2
Title
Viral Renovation AI Videos (Method 1)
Prompt Link
https://docs.google.com/document/d/1SQ4nx44otgQh8AcEYc7jOffXo2OTyzOKhBW6X_0MVAk/edit?usp=sharing
YouTube Video Link
https://www.youtube.com/watch?v=xIhL6BRTMMs
Short Description
Learn how to create viral AI renovation videos using a proven workflow with strong audience retention.

PROMPT 3
Title
Forest Survival Viral Videos (Urdu Style)
Prompt Link
https://docs.google.com/document/d/1zFi59mFOgDDDcBQLEbxcRgIEIcb-C-yMmi8TPV4PVmQ/edit?usp=sharing
YouTube Video Link
https://www.youtube.com/watch?v=KgKAxp8BC78
Short Description
Generate viral forest survival videos with Urdu-style storytelling and cinematic AI visuals.

PROMPT 4
Title
Home Renovation Timelapse AI
Prompt Link
https://www.skool.com/aiperson-community
YouTube Video Link
https://www.youtube.com/watch?v=-jB6bG3u6HU
Short Description
Create realistic AI home renovation timelapse videos with before-and-after transformations.

PROMPT 5
Title
Viral Renovation Fast Method
Prompt Link
https://docs.google.com/document/d/14RS4v_7xxaxfJnHwVc6Y6nvoG9G_2raA0g5pwD3_dSA/edit?usp=sharing
YouTube Video Link
https://www.youtube.com/watch?v=aK9vqjpfNXw
Short Description
Fast workflow for creating high-performing AI renovation content.

PROMPT 6
Title
AI Renovation Community Prompt Pack
Prompt Link
https://t.me/tryaipipeline
YouTube Video Link
https://www.youtube.com/watch?v=GxmQ4FYVhcI
Short Description
Premium renovation prompt collection used by AI content creators.

PROMPT 7
Title
AI Home Renovation Viral (Free Tools)
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=X-gW0jJy_3A
Short Description
Learn to create viral AI home renovation videos using free AI tools.

PROMPT 8
Title
Hyper-Speed AI Renovation
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=DjUjDbQpoyc
Short Description
Create hyper-speed renovation transformations using AI automation.

PROMPT 9
Title
Viral Renovation Timelapse (Free AI)
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=3rEegtmSHwg
Short Description
Free AI workflow for creating renovation timelapse content.

PROMPT 10
Title
AI Renovation Step-by-Step
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=sPNvvCOIDBY
Short Description
Complete step-by-step renovation video creation process.

PROMPT 11
Title
Viral Home Makeover AI
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=K1X8gz3k0nQ
Short Description
Generate realistic AI home makeover videos for social media.

PROMPT 12
Title
AI Home Build Viral Style
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=vswSUU--3WE
Short Description
Create viral home building transformations with AI.

PROMPT 13
Title
Before/After AI House Viral
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=FkLDxLovuHI
Short Description
Create dramatic before-and-after AI property transformations.

PROMPT 14
Title
AI Property Selling Videos
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=5isRZsd2VhI
Short Description
AI-generated real estate and property marketing videos.

PROMPT 15
Title
Abandoned House to Dream Home
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=6LmsXtIVNKc
Short Description
Transform abandoned houses into dream homes using AI-generated visuals.

PROMPT 16
Title
Viral Aesthetic AI Homes
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=RD0Z9G9HCk0
Short Description
Create aesthetic AI home videos with strong viral potential.

PROMPT 17
Title
Exterior AI House Videos
Prompt Link
Check Video Description For Prompt
YouTube Video Link
https://www.youtube.com/watch?v=zxNqpwrIw7c
Short Description
Generate realistic exterior home showcase videos using AI.
`;

function extractYouTubeId(url: string) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function run() {
  // Parse
  const blocks = rawData.split(/PROMPT \d+/).filter(b => b.trim());
  const prompts = blocks.map(block => {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    let title = '';
    let promptLink = '';
    let videoLink = '';
    let shortDesc = '';

    const titleIdx = lines.indexOf('Title');
    if (titleIdx !== -1) title = lines[titleIdx + 1];

    const linkIdx = lines.indexOf('Prompt Link');
    if (linkIdx !== -1) promptLink = lines[linkIdx + 1];

    const videoIdx = lines.indexOf('YouTube Video Link');
    if (videoIdx !== -1) videoLink = lines[videoIdx + 1];

    const descIdx = lines.indexOf('Short Description');
    if (descIdx !== -1) shortDesc = lines[descIdx + 1];

    return { title, promptLink, videoLink, shortDesc };
  });

  // Delete all existing prompts
  console.log("Deleting old prompts...");
  const snap = await getDocs(collection(db, 'prompts'));
  for (const docSnap of snap.docs) {
    await deleteDoc(doc(db, 'prompts', docSnap.id));
  }
  console.log("Deleted old prompts");

  // Insert new
  for (const p of prompts) {
    let videoId = extractYouTubeId(p.videoLink);
    let finalImageUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    let pLink = p.promptLink === 'Check Video Description For Prompt' ? '' : p.promptLink;
    
    await addDoc(collection(db, 'prompts'), {
      title: p.title || 'Untitled Prompt',
      shortDesc: p.shortDesc || '',
      promptLink: pLink,
      videoLink: p.videoLink || '',
      videoId: videoId || '',
      imageUrl: finalImageUrl || '',
      createdAt: serverTimestamp()
    });
    console.log("Added", p.title);
  }
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
