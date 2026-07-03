import re

with open('src/pages/ToolsStore.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [whatsappNumber, setWhatsappNumber] = useState('');", "const [whatsappNumber, setWhatsappNumber] = useState('');\n  const [telegramSettings, setTelegramSettings] = useState({ token: '', chatId: '' });")

content = content.replace("setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');", "setWhatsappNumber(snap.docs[0].data().whatsappNumber || '');\n            setTelegramSettings({ token: snap.docs[0].data().telegramBotToken || '', chatId: snap.docs[0].data().telegramChatId || '' });")

telegram_send_code = """
        // Send to Telegram in background
        if (telegramSettings.token && telegramSettings.chatId) {
           const message = `🔔 *New Order Received*\n\n*Product:* ${product.name}\n*Plan:* ${selectedPlan}\n*Price:* Rs ${selectedPrice}\n*Customer:* ${name}\n*Phone:* ${phone}\n*Email:* ${email}\n*Payment Mode:* ${paymentMode === 'card' ? 'Credit Card (Failed)' : 'Wallet'}`;
           fetch(`https://api.telegram.org/bot${telegramSettings.token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 chat_id: telegramSettings.chatId,
                 text: message,
                 parse_mode: 'Markdown'
              })
           }).catch(e => console.error("Telegram notification failed", e));
        }
"""

# We have two places where order is saved: one for card and one for wallet.
# Actually, the user says "koi order kre mujh telegram bot me show hona chaye". It should apply to successful orders (Wallet). For cards it fails anyway but we can notify.
# Let's just put it at the end of the try blocks.

content = content.replace("           const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));\n           await Promise.race([addPromise, addTimeout]);\n         } catch (e) {\n           console.warn(\"Save timed out, will complete in background\", e);\n         }\n         setStatus('card_error');", "           const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));\n           await Promise.race([addPromise, addTimeout]);\n         } catch (e) {\n           console.warn(\"Save timed out, will complete in background\", e);\n         }\n" + telegram_send_code + "         setStatus('card_error');")

content = content.replace("          const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));\n          await Promise.race([addPromise, addTimeout]);\n      } catch (e) {\n          console.warn(\"Save timed out, will complete in background\", e);\n      }\n      \n      \n       const { getOrderReceivedEmail }", "          const addTimeout = new Promise((resolve) => setTimeout(resolve, 800));\n          await Promise.race([addPromise, addTimeout]);\n      } catch (e) {\n          console.warn(\"Save timed out, will complete in background\", e);\n      }\n      " + telegram_send_code + "\n      \n       const { getOrderReceivedEmail }")

with open('src/pages/ToolsStore.tsx', 'w') as f:
    f.write(content)
