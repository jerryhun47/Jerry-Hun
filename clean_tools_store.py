import re

with open('src/pages/ToolsStore.tsx', 'r') as f:
    content = f.read()

# Remove fallback if prods.length === 0
pattern1 = r"if \(prods\.length === 0\) \{.*?prods\.push\(.*?\);.*?\}\s*"
content = re.sub(pattern1, "", content, flags=re.DOTALL)

# Remove fallback on error
pattern2 = r"if \(\!hasResolved\) \{.*?setProducts\(\[.*?\]\);.*?setLoading\(false\);.*?\}"
content = re.sub(pattern2, "setLoading(false);", content, flags=re.DOTALL)

with open('src/pages/ToolsStore.tsx', 'w') as f:
    f.write(content)

