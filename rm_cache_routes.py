import re

with open('app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# remove routes
pattern = r"@app\.route\('/api/cache/.*?def \w+\(.*?\):.*?return jsonify.*?500\n"
new_content = re.sub(pattern, "", content, flags=re.DOTALL)

with open('app.py', 'w', encoding='utf-8') as f:
    f.write(new_content)

