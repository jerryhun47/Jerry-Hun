def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    import re
    # We will search for fetchMethods = async () => { ... } 
    # until fetchSettings or similar
    pattern = r"const fetchMethods = async \(\) => \{.*?(?=const fetchSettings = async \(\) => \{)"
    
    replacement = """const fetchMethods = async () => {
      try {
        const snap = await getDocs(collection(db, 'payment_methods'));
        const methods = snap.docs.map((d: any) => ({ id: d.id, ...d.data() })).filter((m: any) => m.isActive !== false);
        if (isMounted) {
            setPaymentMethods(methods);
        }
      } catch (err) {
        console.error("Failed to fetch payment methods", err);
      }
    };
    """
    
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w') as f:
        f.write(new_content)

patch_file('src/pages/ToolsStore.tsx')
try:
    patch_file('src/components/PaymentModal.tsx')
except Exception as e:
    print(e)
