# دليل التوصيل الكهربائي — BalanceBot v3.1

هذا الدليل هو المرجع المطابق لـ`components.json` وملفات `samples/` وملفات الـFirmware. أسماء الأطراف بين backticks هي أسماء الـPin المطلوبة في المحرر والكود.

## 1. تسميات Arduino Uno المطبوعة

| الفئة | التسميات الصحيحة |
|---|---|
| Digital | `2`, `4`, `7`, `8`, `12`, `13` |
| PWM | `~3`, `~5`, `~6`, `~9`, `~10`, `~11` |
| Serial | `RX←0`, `TX→1` |
| Analog/I²C | `A0`, `A1`, `A2`, `A3`, `A4/SDA`, `A5/SCL` |
| Power | `5V`, `3V3`, `VIN`, `GND` |

## 2. Arduino Only وArduino في الوضع Hybrid

| المكوّن | طرف Uno | الوظيفة |
|---|---|---|
| L298N ENA | `~5` | PWM للمحرك الأيسر، أزل Jumper ENA |
| L298N IN1 / IN2 | `7` / `8` | اتجاه المحرك الأيسر |
| L298N IN3 / IN4 | `~10` / `A0` | اتجاه المحرك الأيمن |
| L298N ENB | `~6` | PWM للمحرك الأيمن، أزل Jumper ENB |
| HC-SR04 TRIG / ECHO | `2` / `~3` | نبضة وإرجاع الموجات فوق الصوتية |
| MPU6050 SDA / SCL | `A4/SDA` / `A5/SCL` | ناقل I²C |
| MPU6050 INT | غير موصل | يُترك مفصولًا عمدًا |
| Potentiometer WIPER | `A2` | قراءة مستوى الصوت/البازر |
| Passive Buzzer + | `~9` | خرج PWM للصوت |
| IR OUT/S | `A1` | إشارة مستقبل IR |
| LED أحمر 1 / 2 | `~11` / `12` | مع مقاومة 220–330Ω |
| LED أخضر 1 / 2 | `13` / `4` | مع مقاومة 220–330Ω |

توصيلات الطاقة:

```text
Battery B+ → Main Power Switch IN
Main Power Switch OUT → L298N VMS/12V
Battery B- → L298N GND
L298N 5V → Arduino 5V
MPU6050 VCC وPotentiometer VCC → Arduino 5V
كل GND → Arduino GND / الأرضي المشترك
```

## 3. Hybrid UART — ESP32 مع Arduino Uno

| ESP32 Dev Board | Arduino Uno | الملاحظة |
|---|---|---|
| `GPIO17` / TX2 | `RX←0` | ESP32 يرسل إلى Arduino؛ توصيل مباشر وفق مستوى الإشارة المناسب |
| `GPIO16` / RX2 | `TX→1` | لا توصل مباشرة؛ استخدم Level Shifter أو مقسم جهد |

مقسم الجهد المقترح على خط `TX→1 → GPIO16`:

```text
Arduino TX→1 ── R1=1kΩ ──●── ESP32 GPIO16
                           │
                         R2=2kΩ
                           │
                          GND
```

يجب توحيد GND بين اللوحتين. يستخدم ESP32 Bluetooth/Wi‑Fi لاستقبال الأوامر، بينما يبقى Arduino مسؤولًا عن L298N وMPU6050 وHC-SR04 والبازر.

## 4. ESP32 Standalone

| المكوّن | طرف ESP32 المطبوع/المسمى GPIO |
|---|---|
| L298N ENA | `GPIO25` |
| L298N IN1 | `GPIO27` |
| L298N IN2 | `GPIO14` |
| L298N IN3 | `GPIO13` |
| L298N IN4 | `GPIO23` |
| L298N ENB | `GPIO26` |
| HC-SR04 TRIG | `GPIO16` |
| HC-SR04 ECHO | `GPIO17` عبر مقسم الجهد |
| MPU6050 SDA / SCL | `GPIO21` / `GPIO22` |
| Passive Buzzer | `GPIO4` |
| Potentiometer WIPER | `GPIO35` |
| IR OUT/S | `GPIO34` |
| LEDs | أحمر `GPIO18/GPIO19`، أخضر `GPIO32/GPIO33` |
| MPU6050 INT | غير موصل |

في هذا الوضع لا تستخدم GPIO16 وGPIO17 لـUART2 في الوقت نفسه؛ هما مخصصان لـHC-SR04 حسب جدول ESP32 Standalone. يختار `firmware/esp32_robot.cpp` الوضع عبر `BALANCEBOT_HYBRID_MODE=0` (Standalone) أو `-DBALANCEBOT_HYBRID_MODE=1` (Hybrid). إذا احتجت UART2، لا تشغّل HC-SR04 على GPIO16/17 في نفس البناء.

## 5. طاقة 3S والحماية

| الحالة | الجهد |
|---|---:|
| حد التفريغ المحافظ | 9.6V |
| الاسمي | 11.1V |
| الشحن الكامل | 12.6V |

- لا توصل البطارية مباشرة إلى GPIO أو ESP32 `3V3` أو MPU6050.
- استخدم `L298N 5V` إلى Arduino `5V` أو ESP32 `VIN` فقط بعد فحص Jumper والمنظم والحرارة.
- استخدم مقاومة 220–330Ω على التوالي مع كل LED.
- راجع اتجاه 1N4007 حول أحمال المحركات على لوحة L298N الفعلية.
- استخدم مكثف 100µF/25V مع مراعاة القطبية.
- افصل البطارية قبل أي تعديل، واختبر المحركات مرفوعة.

## 6. ملفات المصدر المطابقة

- `firmware/arduino_uno_robot.cpp`: Arduino Uno مع `~5`, `7`, `8`, `~10`, `A0`, `~6`, `2`, `~3`, `~9`.
- `firmware/esp32_robot.cpp`: ESP32 مع `GPIO25`, `GPIO27`, `GPIO14`, `GPIO13`, `GPIO23`, `GPIO26`, `GPIO16`, `GPIO17`, `GPIO21`, `GPIO22`, `GPIO4`, `GPIO35`, `GPIO34`.
- `samples/arduino-only.json`, `samples/hybrid-arduino-esp32.json`, `samples/esp32-standalone.json`: نفس أسماء الأطراف في الرسم.
