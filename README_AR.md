# BalanceBot Wiring Studio — منظومة روبوت متعددة الأوضاع

محرر دوائر محلي RTL يعرض أسماء الأطراف الفعلية للمكونات، ويربطها بصيغة `componentId.pinName`، ويدعم ثلاث عينات تشغيل مطابقة لمشروع الروبوت متعدد الأوضاع.

> النسخة الحالية هي محرر وتحقق منطقي/كهربائي أولي. لا تعتبر المحاكاة شهادة أمان للدائرة الحقيقية. افصل البطارية قبل تعديل الأسلاك، واختبر المحركات مرفوعة.

## ما تم تحديثه في الإصدار 3.0

- مكتبة موسعة في `components.json` تشمل Arduino Uno، ESP32 30-pin، L298N، MPU6050، HC-SR04، Potentiometer 10K، Passive Buzzer، LEDs، مقاومات، Voltage Divider، 1N4007، Capacitor، بطارية 3S، المفاتيح، TT Motors، العجلات، الهيكل، Breadboard، USB، PS1 وLaptop Bridge.
- كل مكوّن يضم أسماء الـPin الفعلية ووظيفة الطرف واتجاهه وجهده/حدوده.
- ثلاث واجهات تشغيل: **Arduino Only**، **Hybrid Arduino + ESP32**، **ESP32 Standalone**.
- تحديث منظومة الطاقة: `9.6V cutoff / 11.1V nominal / 12.6V full charge`.
- مسار الطاقة الموثق: 3S battery → Main Power Switch → `L298N VMS/12V`، وخرج `L298N 5V` المنظم إلى منطق اللوحات وفق القيود المذكورة في دليل التوصيل.
- حماية HC-SR04 Echo للـESP32 عبر `1kΩ + 2kΩ`.
- توثيق إلغاء MPU6050 `INT` عمدًا.
- Firmware موحد في `firmware/unified_robot.cpp` باستخدام `#if defined ( ESP32 )` و`#elif defined ( __AVR_ATmega328P__ )`.
- جسر Python في `tools/bridge.py` للنقل Serial أو Wi‑Fi وبروتوكول الأوامر نفسه.

## التشغيل

```bash
./start-local.sh
# ثم افتح http://127.0.0.1:4173
```

أو شغّل أي static server من جذر المشروع. لا يحتاج الموقع إلى npm؛ يقرأ `components.json` عبر `fetch`.

## الملفات المهمة

```text
index.html                         واجهة المحرر وثلاثة أوضاع
app.js                             JSON → SVG، pin-aware wiring، التحقق والمحاكاة
styles.css                         واجهة RTL وعرض أسماء الأطراف
components.json                    سجل المكونات والـpins والجهود
samples/arduino-only.json          وضع Arduino عبر USB
samples/hybrid-arduino-esp32.json  وضع Arduino + ESP32 عبر Mode Switch وTX/RX
samples/esp32-standalone.json      وضع ESP32 المستقل مع Voltage Divider
firmware/unified_robot.cpp         كود C++ موحد للمنصتين
tools/bridge.py                    PS1/x360ce إلى Serial أو Wi‑Fi
docs/WIRING_GUIDE_AR.md            دليل التوصيل والطاقة والحماية
schema/project.schema.json         عقد JSON
check-project.py                   فحص الملفات والـendpoints
```

## التوصيل في المحرر

1. اختر الوضع من التبويبات.
2. كل نقطة على اللوحة تحمل الاسم المطبوع مثل `A4`, `SDA`, `VMS/12V`, `GPIO34`.
3. اضغط الطرف الأول ثم الطرف الثاني لإنشاء سلك.
4. لوحة `PINOUT` تعرض وظيفة الطرف واتصالاته.
5. راجع `docs/WIRING_GUIDE_AR.md` قبل تنفيذ دائرة حقيقية.

## Firmware وBridge

الكود الموحد يقرأ Potentiometer للتحكم غير المباشر في مستوى/شدة نغمة Passive Buzzer، يعكس اتجاه المحركات برمجيًا، ويدعم أوامر الحركة والزمارات والسرعة والدوران.

مثال:

```bash
python3 tools/bridge.py --transport serial --port /dev/ttyACM0 --command forward
python3 tools/bridge.py --transport wifi --host 192.168.4.1 --command horn2
```

لتثبيت Serial اختياريًا:

```bash
python3 -m pip install pyserial
```

## الفحص

```bash
python3 check-project.py
node --check app.js
python3 -m py_compile tools/bridge.py
```

## GitHub

كل تحديث وظيفي يحفظ في commit مستقل ثم يدفع إلى `main` في المستودع العام:

<https://github.com/zfdhtdyjudt-prog/balancebot-wiring-studio>

لن يتم اعتبار الموقع منشورًا دائمًا إلا بعد نجاح عقد البناء والنشر، أما Preview فهو للتجربة فقط.
