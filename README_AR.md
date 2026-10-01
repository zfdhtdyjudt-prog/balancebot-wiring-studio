# BalanceBot Wiring Studio — الإصدار 3.1

محرر دوائر محلي RTL لمشروع روبوت متعدد الأوضاع. يعرض أسماء الأطراف الفعلية على Arduino Uno وESP32، ويستخدم نفس أسماء الـPins في المكتبة، وملفات JSON، والـFirmware، ودليل التوصيل.

> هذه الملفات تصف التصميم وتتحقق من الاتصالات منطقيًا، لكنها لا تستبدل Datasheet أو القياس الفعلي. افصل البطارية قبل تعديل الأسلاك، واختبر المحركات مرفوعة عن الأرض.

## التوصيلات المرجعية المعتمدة

### Arduino Uno — الأسماء المطبوعة

- Digital: `2`, `4`, `7`, `8`, `12`, `13`
- PWM: `~3`, `~5`, `~6`, `~9`, `~10`, `~11`
- Serial: `RX←0`, `TX→1`
- Analog/I²C: `A0`, `A1`, `A2`, `A3`, `A4/SDA`, `A5/SCL`
- Power: `5V`, `3V3`, `VIN`, `GND`

| الوظيفة | طرف Arduino Uno |
|---|---|
| L298N ENA | `~5` |
| L298N IN1 / IN2 | `7` / `8` |
| L298N IN3 / IN4 | `~10` / `A0` |
| L298N ENB | `~6` |
| HC-SR04 TRIG / ECHO | `2` / `~3` |
| MPU6050 SDA / SCL | `A4/SDA` / `A5/SCL` |
| Potentiometer WIPER | `A2` |
| Passive Buzzer + | `~9` |
| IR OUT/S | `A1` |
| LEDs | أحمر 1 `~11`، أحمر 2 `12`، أخضر 1 `13`، أخضر 2 `4` |
| MPU6050 INT | غير موصل عمدًا |

### ESP32 Dev Board — أسماء GPIO صريحة

- L298N: `ENA=GPIO25`, `IN1=GPIO27`, `IN2=GPIO14`, `IN3=GPIO13`, `IN4=GPIO23`, `ENB=GPIO26`
- HC-SR04: `TRIG=GPIO16`, `ECHO=GPIO17` عبر Voltage Divider
- MPU6050: `SDA=GPIO21`, `SCL=GPIO22`، و`INT` غير موصل
- Passive Buzzer: `GPIO4`
- Potentiometer WIPER: `GPIO35`
- IR OUT/S: `GPIO34`
- LEDs: أحمر `GPIO18/GPIO19`، أخضر `GPIO32/GPIO33`

> في الوضع Hybrid تُستخدم `GPIO17` كـTX2 إلى `RX←0` في Uno، و`GPIO16` كـRX2 من `TX→1` في Uno عبر مجزئ/تحويل مستويات. في ESP32 Standalone تُستخدم نفس GPIO16/17 مع HC-SR04؛ لا تُشغّل وظيفتي UART2 وHC-SR04 على الأطراف نفسها في نفس الوقت.

## أوضاع التشغيل

1. **Arduino Only:** Arduino يملك المحركات، HC-SR04، MPU6050، البازر، LEDs وPotentiometer.
2. **Hybrid Arduino + ESP32:** ESP32 يستقبل Bluetooth/Wi‑Fi ويمرر الأوامر عبر UART؛ Arduino يظل مالك المحركات والحساسات.
3. **ESP32 Standalone:** ESP32 يملك جميع المكونات وفق جدول GPIO أعلاه، ويجب استخدام Voltage Divider لـEcho.

## الطاقة والحماية

- حزمة 3S: `9.6V` حد تفريغ محافظ، `11.1V` اسمي، `12.6V` شحن كامل.
- المسار: `B+ → Main Power Switch → L298N VMS/12V`، و`B- → L298N GND`.
- استخدم خرج `L298N 5V` إلى Arduino `5V` أو ESP32 `VIN` فقط بعد التحقق من المنظم والحرارة.
- لا توصل `12.6V` إلى ESP32 أو MPU6050، ولا توصل `5V` إلى ESP32 `3V3`.
- خط Arduino `TX→1` إلى ESP32 `GPIO16` يحتاج Level Shifter أو مجزئ جهد: `1kΩ` علوي و`2kΩ` إلى GND.
- ضع مقاومة `220–330Ω` مع كل LED، وراجع اتجاه 1N4007 ومكثف `100µF/25V` والقطبية.

## Firmware

الملفات الكاملة:

- `firmware/arduino_uno_robot.cpp` — كود Arduino Uno R3 بالتوصيلات النهائية.
- `firmware/esp32_robot.cpp` — كود ESP32 Dev Board مع Bluetooth وWi‑Fi AP وUART2.
  - الوضع الافتراضي Standalone: `BALANCEBOT_HYBRID_MODE=0`. للوضع Hybrid: أضف `-DBALANCEBOT_HYBRID_MODE=1`؛ عندها يستخدم ESP32 `GPIO16/17` لـUART2 ولا يستخدمهما للـHC-SR04.
- `firmware/unified_robot.cpp` — wrapper يختار الملف المناسب حسب تعريف منصة البناء.
- `tools/bridge.py` — إرسال أوامر الحركة عبر Serial أو Wi‑Fi.

الأوامر المشتركة:

| الأمر | الوظيفة |
|---|---|
| `F/B` | تقدم / رجوع |
| `L/R` | دوران يسار / يمين |
| `C/c` | دوران محوري |
| `S` أو مسافة | إيقاف |
| `1..4` و`h` | نغمات البازر |
| `+/-` | زيادة/خفض السرعة |

أمثلة:

```bash
python3 tools/bridge.py --transport serial --port /dev/ttyACM0 --command forward
python3 tools/bridge.py --transport wifi --host 192.168.4.1 --command horn2
```

## ملفات المشروع

```text
components.json                    registry بأسماء الأطراف الفعلية
samples/arduino-only.json          عينة Arduino Only
samples/hybrid-arduino-esp32.json  عينة Hybrid وUART المحمي
samples/esp32-standalone.json      عينة ESP32 وVoltage Divider
firmware/arduino_uno_robot.cpp     مصدر Arduino Uno الكامل
firmware/esp32_robot.cpp            مصدر ESP32 الكامل
firmware/unified_robot.cpp          مدخل البناء الموحد
tools/bridge.py                     جسر Serial/Wi‑Fi
docs/WIRING_GUIDE_AR.md             جدول التوصيل والطاقة والحماية
docs/SCHEMATIC_LAYOUT_AR.md         قواعد التخطيط والمسارات
schema/project.schema.json          عقد ملفات JSON
app.js                              المحرر والـSVG والـsamples المضمنة
check-project.py                    فحص endpoints وJSON
```

## التشغيل والفحص

```bash
./start-local.sh
python3 check-project.py
node --check app.js
python3 -m py_compile tools/bridge.py
```

الموقع المنشور هو نسخة المحرر للتجربة، بينما GitHub هو المصدر القابل للمراجعة:

<https://github.com/zfdhtdyjudt-prog/balancebot-wiring-studio>
