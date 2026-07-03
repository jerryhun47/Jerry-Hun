with open('src/index.css', 'r') as f:
    content = f.read()

import_lines = []
other_lines = []

for line in content.split('\n'):
    if line.startswith('@import'):
        import_lines.append(line)
    else:
        other_lines.append(line)

new_content = '\n'.join(import_lines + other_lines)

with open('src/index.css', 'w') as f:
    f.write(new_content)
