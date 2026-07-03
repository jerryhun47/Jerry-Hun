import re

with open('src/components/Layout.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Menu, X, MessageCircle } from 'lucide-react';", "import { Menu, X, MessageCircle, Palette } from 'lucide-react';\nimport ThemeSelector from './ThemeSelector';")

content = content.replace("              <MessageCircle size={18} className=\"mr-2 text-indigo-400\" /> \n               Chat with AI\n            </button>", "              <MessageCircle size={18} className=\"mr-2 text-indigo-400\" /> \n               Chat with AI\n            </button>\n            <ThemeSelector />")

with open('src/components/Layout.tsx', 'w') as f:
    f.write(content)
