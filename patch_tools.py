import re

with open('src/pages/ToolsStore.tsx', 'r') as f:
    content = f.read()

# Remove the timeout logic
timeout_pattern = r"timeoutId = setTimeout\(\(\) => \{.*?\},\s*600\);.*?// 600ms timeout for fast UI"
content = re.sub(timeout_pattern, "", content, flags=re.DOTALL)

with open('src/pages/ToolsStore.tsx', 'w') as f:
    f.write(content)
