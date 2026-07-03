with open('src/pages/ToolsStore.tsx', 'r') as f:
    content = f.read()

import re

# Replace Markdown with HTML for safer parsing
content = re.sub(r"\*New Order Received\*", r"<b>New Order Received</b>", content)
content = re.sub(r"\*Product:\*", r"<b>Product:</b>", content)
content = re.sub(r"\*Plan:\*", r"<b>Plan:</b>", content)
content = re.sub(r"\*Price:\*", r"<b>Price:</b>", content)
content = re.sub(r"\*Customer:\*", r"<b>Customer:</b>", content)
content = re.sub(r"\*Phone:\*", r"<b>Phone:</b>", content)
content = re.sub(r"\*Email:\*", r"<b>Email:</b>", content)
content = re.sub(r"\*Payment Mode:\*", r"<b>Payment Mode:</b>", content)
content = re.sub(r"parse_mode: 'Markdown'", r"parse_mode: 'HTML'", content)

with open('src/pages/ToolsStore.tsx', 'w') as f:
    f.write(content)
