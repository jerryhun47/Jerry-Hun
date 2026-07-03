import re

with open('src/components/PaymentModal.tsx', 'r') as f:
    content = f.read()

content = content.replace("useEffect(() => {\n    if (typeof window", "useEffect(() => {\n    let isMounted = true;\n    if (typeof window")

content = content.replace("fetchSettings();\n  }, []);", "fetchSettings();\n    return () => { isMounted = false; };\n  }, []);")

with open('src/components/PaymentModal.tsx', 'w') as f:
    f.write(content)

