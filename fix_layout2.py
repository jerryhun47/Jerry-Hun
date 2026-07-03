import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

pattern = r"(<MessageCircle size=\{18\} className=\"mr-2 text-indigo-400\" />\s*Chat with AI\s*</button>)"

content = re.sub(pattern, r"\1\n            <ThemeSelector />", content)

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
