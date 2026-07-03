with open('src/pages/ToolsStore.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "${paymentMode === 'card' ? 'Credit Card (Failed)' : 'Wallet'}`",
    "${paymentMode}`"
)

with open('src/pages/ToolsStore.tsx', 'w') as f:
    f.write(content)
