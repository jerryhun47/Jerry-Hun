import re
def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    pattern = r"const fetchSettings = async \(\) => \{.*?\n\s+try \{.*?\n\s+const settingsPromise = getDocs\(collection\(db, 'settings'\)\);\s*\n.*?const res = await Promise\.race.*?\} catch \(e\) \{.*?\n\s+console\.error.*?\}?\s*\n\s+\}"
    
    replacement = """const fetchSettings = async () => {
      try {
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty && isMounted) {
            setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');
            setTelegramSettings({ token: snap.docs[0].data().telegramBotToken || '', chatId: snap.docs[0].data().telegramChatId || '' });
        }
      } catch (e) {
        console.error(e);
      }
    }"""
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

patch_file('src/pages/ToolsStore.tsx')

