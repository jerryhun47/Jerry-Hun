import re

with open('src/components/PaymentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [whatsappNumber, setWhatsappNumber] = useState('');", "const [whatsappNumber, setWhatsappNumber] = useState('');\n  const [telegramSettings, setTelegramSettings] = useState({ token: '', chatId: '' });")

content = content.replace("setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');", "setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');\n            setTelegramSettings({ token: snap.docs[0].data().telegramBotToken || '', chatId: snap.docs[0].data().telegramChatId || '' });")

telegram_send_code = """
        // Send to Telegram in background
        if (telegramSettings.token && telegramSettings.chatId) {
           const message = `<b>New Order Received</b>\\n\\n<b>Product/Course:</b> ${item.title || item.name}\\n<b>Price:</b> Rs ${item.price || 3000}\\n<b>Customer:</b> ${user?.displayName || 'User'}\\n<b>Phone:</b> ${userPhone}\\n<b>Email:</b> ${user.email}\\n<b>Payment Mode:</b> ${paymentMode}`;
           fetch(`https://api.telegram.org/bot${telegramSettings.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 chat_id: telegramSettings.chatId,
                 text: message,
                 parse_mode: 'HTML'
              })
           }).catch(e => console.error("Telegram notification failed", e));
        }
"""

content = content.replace("         setStatus('card_error');\n         return;\n      }\n\n      const orderData = {", telegram_send_code + "         setStatus('card_error');\n         return;\n      }\n\n      const orderData = {")

content = content.replace("        status: 'pending', // pending, approved, rejected\n        createdAt: serverTimestamp()\n      });\n\n      // Fetch product credentials", "        status: 'pending', // pending, approved, rejected\n        createdAt: serverTimestamp()\n      });\n" + telegram_send_code + "\n      // Fetch product credentials")

with open('src/components/PaymentModal.tsx', 'w') as f:
    f.write(content)
