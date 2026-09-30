from pathlib import Path
import json, subprocess, sys
ROOT = Path(__file__).resolve().parent
required = ['index.html','styles.css','app.js','README_AR.md','ideas.md','components.json','schema/project.schema.json','start-local.bat','start-local.sh','samples/arduino-standalone.json','samples/esp32-standalone.json']
errors=[]
for rel in required:
    p=ROOT/rel
    if not p.exists() or p.stat().st_size==0: errors.append(f'ملف مفقود أو فارغ: {rel}')
try: registry=json.loads((ROOT/'components.json').read_text(encoding='utf-8'))
except Exception as e: registry={}; errors.append(f'components.json غير صالح: {e}')
for rel in ['samples/arduino-standalone.json','samples/esp32-standalone.json']:
    try:
        data=json.loads((ROOT/rel).read_text(encoding='utf-8'))
        if not all(k in data for k in ('project','components','wires','settings')): errors.append(f'أقسام ناقصة: {rel}')
        ids=[c.get('id') for c in data.get('components',[])]
        if not ids or len(ids)!=len(set(ids)): errors.append(f'IDs غير صحيحة: {rel}')
        for c in data.get('components',[]):
            if c.get('type') not in registry: errors.append(f'نوع مكوّن غير معروف {c.get("type")}: {rel}')
        for w in data.get('wires',[]):
            for side in ('from','to'):
                ref=str(w.get(side,'')); cid,pin=(ref.split('.',1)+[''])[:2]
                comp=next((c for c in data['components'] if c['id']==cid),None)
                pins=[p[0] for p in registry.get(comp.get('type'),{}).get('pins',[])] if comp else []
                if not comp or pin not in pins: errors.append(f'توصيل غير معروف {ref}: {rel}')
    except Exception as exc: errors.append(f'JSON غير صالح في {rel}: {exc}')
if errors:
    print('CHECK FAILED'); print('\n'.join(f'- {e}' for e in errors)); sys.exit(1)
print('CHECK PASSED')
print('العقدة، مكتبة المكونات، عينات JSON، وجميع نقاط الاتصال متوافقة.')
