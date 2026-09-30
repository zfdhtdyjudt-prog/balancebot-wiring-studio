from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
required = [
    'index.html', 'styles.css', 'app.js', 'README_AR.md',
    'start-local.bat', 'start-local.sh',
    'samples/arduino-standalone.json', 'samples/esp32-standalone.json'
]
errors = []
for rel in required:
    p = ROOT / rel
    if not p.exists() or p.stat().st_size == 0:
        errors.append(f'ملف مفقود أو فارغ: {rel}')
for rel in ['samples/arduino-standalone.json', 'samples/esp32-standalone.json']:
    try:
        data = json.loads((ROOT / rel).read_text(encoding='utf-8'))
        ids = [x.get('id') for x in data.get('components', [])]
        if not ids or len(ids) != len(set(ids)):
            errors.append(f'IDs غير صحيحة: {rel}')
        for c in data.get('connections', []):
            if c.get('from') not in ids or c.get('to') not in ids:
                errors.append(f'توصيل غير معروف في: {rel}')
    except Exception as exc:
        errors.append(f'JSON غير صالح في {rel}: {exc}')
if errors:
    print('CHECK FAILED')
    print('\n'.join(f'- {e}' for e in errors))
    raise SystemExit(1)
print('CHECK PASSED')
print('كل الملفات موجودة، وعينات JSON صالحة، وIDs والتوصيلات متوافقة.')
