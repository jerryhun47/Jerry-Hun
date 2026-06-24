import { db } from './src/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const promptsData = `
1.
Video: https://www.youtube.com/watch?v=hQHKp7X2VP4
Prompt: https://1drv.ms/w/c/d016762f4a3e27b6/IQCS0QyPyilQSaSLkUGQasQoAekXgo_Hk2qu7tfP8W9crUs?e=4hSrVk

2.
Video: https://www.youtube.com/watch?v=xIhL6BRTMMs
Prompt: https://docs.google.com/document/d/1SQ4nx44otgQh8AcEYc7jOffXo2OTyzOKhBW6X_0MVAk/edit

3.
Video: https://www.youtube.com/watch?v=KgKAxp8BC78
Prompt: https://docs.google.com/document/d/1zFi59mFOgDDDcBQLEbxcRgIEIcb-C-yMmi8TPV4PVmQ/edit

4.
Video: https://www.youtube.com/watch?v=-jB6bG3u6HU
Prompt: https://www.skool.com/aiperson-community

5.
Video: https://www.youtube.com/watch?v=aK9vqjpfNXw
Prompt: https://docs.google.com/document/d/14RS4v_7xxaxfJnHwVc6Y6nvoG9G_2raA0g5pwD3_dSA/edit

6.
Video: https://www.youtube.com/watch?v=GxmQ4FYVhcI
Prompt: https://t.me/tryaipipeline

7.
Video: https://www.youtube.com/watch?v=X-gW0jJy_3A

8.
Video: https://www.youtube.com/watch?v=DjUjDbQpoyc

9.
Video: https://www.youtube.com/watch?v=3rEegtmSHwg

10.
Video: https://www.youtube.com/watch?v=sPNvvCOIDBY

11.
Video: https://www.youtube.com/watch?v=K1X8gz3k0nQ

12.
Video: https://www.youtube.com/watch?v=vswSUU--3WE

13.
Video: https://www.youtube.com/watch?v=FkLDxLovuHI

14.
Video: https://www.youtube.com/watch?v=5isRZsd2VhI

15.
Video: https://www.youtube.com/watch?v=6LmsXtIVNKc

16.
Video: https://www.youtube.com/watch?v=RD0Z9G9HCk0

17.
Video: https://www.youtube.com/watch?v=zxNqpwrIw7c
`;

function extractYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

const lines = promptsData.split('\n').filter(l => l.trim() !== '');
const promptsToAdd = [];
let currentPrompt: any = {};

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  
  if (line.match(/^\d+\.$/)) {
      if (currentPrompt.videoLink) {
        if (!currentPrompt.title) currentPrompt.title = \`Prompt \${promptsToAdd.length + 1}\`;
        promptsToAdd.push(currentPrompt);
        currentPrompt = {};
      }
  } else if (line.toLowerCase().startsWith('video:')) {
      currentPrompt.videoLink = line.substring(6).trim();
  } else if (line.toLowerCase().startsWith('prompt:')) {
      currentPrompt.promptLink = line.substring(7).trim();
  }
}

if (currentPrompt.videoLink) {
  if (!currentPrompt.title) currentPrompt.title = \`Prompt \${promptsToAdd.length + 1}\`;
  promptsToAdd.push(currentPrompt);
}

const defaultDesc = "Create highly engaging AI-generated videos using this proven workflow.\\n\\n🔥 High RPM niche\\n🎯 Low competition market\\n🚀 Strong viral potential\\n💰 Monetization friendly\\n📈 Growing audience demand\\n\\nPerfect for YouTube automation creators looking to scale faster.";

async function importAll() {
  for (const p of promptsToAdd) {
    let videoId = extractYouTubeId(p.videoLink);
    let finalImageUrl = videoId ? \`https://img.youtube.com/vi/\${videoId}/maxresdefault.jpg\` : '';
    
    await addDoc(collection(db, 'prompts'), {
      title: p.title || 'Untitled Prompt',
      shortDesc: defaultDesc,
      promptLink: p.promptLink || '',
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

importAll().catch(console.error);
