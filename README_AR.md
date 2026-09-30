# BalanceBot Wiring Studio

محرّر دوائر محلي يعمل من ملفات HTML/CSS/JavaScript فقط. يحوّل ملف JSON إلى مخطط SVG تفاعلي، ويعرض نقاط اتصال حقيقية من مكتبة مكونات محلية، ويفحص مجموعة من أخطاء التوصيل الشائعة، ثم يشغّل محاكاة منطقية أولية لحالة النظام.

> هذا المشروع أصلي ومبني على metadata محلية ومراجع تقنية للمكونات. لا ينسخ ملفات أو رسومات Wokwi المحمية.

## ما تم تنفيذه

- **نموذج JSON رسمي** في `schema/project.schema.json`.
- **مكتبة مكونات قابلة للتوسع** في `components.json` وتشمل Arduino Uno وESP32 وMPU6050 وHC-SR04 وL298N ومحركات وLED ومقاومات ومقسم جهد وبطارية.
- **رسم SVG حقيقي** مع pin metadata ونقاط اتصال، وليس مستطيلات عامة فقط.
- **توصيل تفاعلي:** اضغط Pin ثم Pin آخر لإضافة سلك، أو عدّل JSON مباشرة.
- **Auto-router بسيط ومنظم** للمسارات الأفقية/العمودية بين pins.
- **فحص كهربائي:** GND المشترك، مسار Echo للـESP32، مقاومة LED، Driver للمحرك، واتجاهات GPIO المحتملة.
- **واجهة JSON:** فتح، حفظ، رسم تلقائي، أرقام أسطر، رسائل أخطاء، وعينات Arduino وESP32.
- **تصدير SVG وJSON وPDF**؛ PDF يستخدم نافذة الطباعة لحفظ مخطط نظيف.
- **سحب وإفلات:** اسحب مكوّنًا من المكتبة إلى مساحة الرسم، أو اضغط لإضافته.
- **مكونات مخصصة:** زر `+ مكوّن` يستورد تعريف JSON محليًا ويحفظه في `localStorage`. المثال موجود في `samples/custom-wheel-component.json`.
- **محاكاة منطقية تدريجية:** طاقة، منطق تحكم، PWM تجريبي، وقراءة زاوية IMU افتراضية.
- **واجهة RTL متجاوبة** ومكتبة مكونات وبطاقة Pinout وتحذيرات وحالة المشروع.

## التشغيل المحلي

### VS Code + Live Server

1. افتح هذا المجلد في VS Code.
2. افتح `index.html`.
3. شغّل **Open with Live Server**.

### بدون إضافة

Linux/macOS:

```bash
chmod +x start-local.sh
./start-local.sh
```

ثم افتح `http://127.0.0.1:4173`.

Windows: شغّل `start-local.bat`.

لا توجد حاجة إلى npm أو تنزيل مكتبات JavaScript. يجب تشغيل الموقع عبر خادم محلي لأن `components.json` يُقرأ بواسطة `fetch`.

## ملفات المشروع

```text
balancebot-wiring-studio/
├── index.html                 # واجهة التطبيق
├── styles.css                 # نظام التصميم RTL والمتجاوب
├── app.js                     # JSON → SVG، التوصيل، الفحص، المحاكاة
├── components.json             # تعريف المكونات والأرجل والجهود
├── schema/project.schema.json  # عقد JSON الرسمي
├── samples/                    # مشاريع جاهزة للفتح
├── ideas.md                    # اتجاه التصميم وقرارات المنتج
├── ROADMAP_AR.md               # مراحل المحاكاة والتصدير والنشر
├── .github/workflows/pages.yml # نشر GitHub Pages
├── check-project.py            # فحص الملفات وIDs وpins والتوصيلات
├── start-local.sh
├── start-local.bat
└── .vscode/settings.json
```

## شكل JSON الجديد

```json
{
  "project": {"name": "BalanceBot ESP32", "version": "2.0"},
  "components": [
    {"id": "esp_1", "type": "esp32_devkit", "position": {"x": 110, "y": 190}, "rotation": 0}
  ],
  "wires": [
    {"from": "esp_1.GPIO21", "to": "mpu_1.SDA", "signal": "i2c", "color": "i2c"}
  ],
  "settings": {"showPinNumbers": true, "showLabels": true, "showElectricalWarnings": true, "grid": 24}
}
```

كل طرف في `wires` يجب أن يكون بالصيغة `componentId.pinName`. أسماء الـpins لا تُخمن من الرسم؛ تُقرأ من `components.json`، وأي اسم غير معروف يظهر كخطأ.

## خارطة الطريق المتقدمة

التفاصيل المعمارية للمراحل التالية — solver، المحاكاة الفيزيائية، التصدير الهندسي، وحدود Gerber — موجودة في [`ROADMAP_AR.md`](ROADMAP_AR.md). تم تجهيز نشر static عبر `.github/workflows/pages.yml`.

> Gerber لا ينتج من مخطط أسلاك وحده؛ يلزم PCB layout حقيقي، footprints، tracks، وطبقات تصنيع. لذلك سنضيفه بعد بناء محرر PCB، ولن ننتج ملفًا مضللًا باسم Gerber قبل ذلك.

## سير العمل المرحلي

1. تثبيت النطاق والهوية المحلية.
2. اعتماد JSON Schema.
3. بناء مكتبة component metadata.
4. إنشاء رموز SVG أصلية.
5. بناء محرك SVG ونقاط الاتصال.
6. إضافة المسارات والـzoom والشبكة والتصدير.
7. إضافة فحص كهربائي وواجهة JSON.
8. إضافة محاكاة منطقية أولية.
9. توسيع المكتبة واختبار عينات المشروع.
10. حفظ commits قابلة للاسترداد والتحقق النهائي.

كل مرحلة محفوظة في Git داخل المشروع، ويُرفع التغيير إلى `main` بعد التحقق. نسخة GitHub Pages مناسبة لتجربة المحرر static؛ محرك الفيزياء الثقيل يحتاج لاحقًا WebAssembly أو backend منفصل.

## الفحص

```bash
python3 check-project.py
node --check app.js
```

الفحص يتحقق من وجود الملفات، صحة JSON، تعريف component types، uniqueness للـIDs، وصحة كل endpoints في الأسلاك.

## السلامة

التحقق في المتصفح مساعد تصميم وليس شهادة سلامة للدائرة الحقيقية. افصل البطارية قبل تعديل الأسلاك، اختبر العجلات مرفوعة، لا توصل 12V إلى Arduino أو ESP32 أو MPU6050، واستخدم مقسم جهد لإشارة Echo الخاصة بـHC-SR04 عند استعمال ESP32.

## GitHub لاحقًا

المشروع حاليًا محفوظ في Git محلي مع commit خط أساس وcommit تنفيذ. عند اكتمال المراجعة سأطلب تأكيدًا منفصلًا قبل إنشاء مستودع عام أو دفع الملفات، لأن ذلك نشر خارجي لا يمكن التراجع عن ظهوره بالسرعة نفسها. المستودع العام لا يمنح الآخرين تلقائيًا حق تعديل الملفات؛ يجب اختيار ترخيص مفتوح مثل MIT أو Apache-2.0 إذا كان المقصود السماح بالنسخ والتعديل وإعادة الاستخدام.
