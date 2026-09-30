# دليل التوصيل الكهربائي — BalanceBot v3

> هذا الدليل يطابق ملفات `samples/` و`components.json`. أسماء الأطراف بين backticks هي أسماء الـPin كما تظهر في المحرّر، وليست أسماء تخمينية.

## تحذير الطاقة الأساسي

حزمة البطاريات هي **3S Series** من خلايا INR 18650-26EC:

| الحالة | الجهد |
|---|---:|
| حد التفريغ المحافظ | 9.6V |
| الاسمي | 11.1V |
| الشحن الكامل | 12.6V |

المسار المقترح هو:

`battery_pack_3s.B+ → power_switch.IN → power_switch.OUT → l298n.VMS/12V`

و:

`battery_pack_3s.B- → l298n.GND`

يجب أن يكون Jumper منظم 5V في L298N في الوضع الصحيح، ثم يستخدم خرج `l298n.5V` لتغذية منطق Arduino عبر `5V` أو ESP32 عبر `VIN` فقط. **لا توصل 12.6V مباشرة إلى ESP32 أو MPU6050، ولا توصل 5V إلى ESP32 `3V3`.** تحقق من نسخة L298N الفعلية وتيار منظمها قبل تغذية لوحتين وحساسات؛ قد يلزم منظم 5V خارجي إذا ارتفعت الحرارة أو لم يكف التيار.

## الوضع 1 — Arduino Only

- `Arduino A4 → MPU6050 SDA`
- `Arduino A5 → MPU6050 SCL`
- `Arduino 5V → MPU6050 VCC` و`Potentiometer VCC`
- `Arduino GND → MPU6050 GND`, `Potentiometer GND`, `Buzzer GND`
- `Arduino A0 → HC-SR04 TRIG`
- `Arduino A1 ← HC-SR04 ECHO` (5V logic مناسب للأردوينو)
- `Arduino A2 ← Potentiometer SIG/WIPER`
- `Arduino D3 → Passive Buzzer SIG/PWM`
- `Arduino D5 → L298N ENA`
- `Arduino D6/D7 → L298N IN1/IN2`
- `Arduino D9/D10 → L298N IN3/IN4`
- `L298N OUT1/OUT2 → left TT Motor M+/M-`
- `L298N OUT3/OUT4 → right TT Motor M+/M-`

سلك `MPU6050 INT` **غير موجود عمدًا**؛ لا تضفه إلى D2.

## الوضع 2 — Hybrid Arduino + ESP32

- مفتاح `mode_switch.COM` يأخذ خرج 5V المنظم.
- `mode_switch.NO/ON → ESP32 VIN` لتفعيل وضع الجسر اللاسلكي.
- `ESP32 GPIO17/TX2 → Arduino D0/RX`.
- `Arduino D1/TX → ESP32 GPIO16/RX2`.
- استخدم أرضيًا مشتركًا بين اللوحتين.
- Arduino يبقى مالك المحركات وMPU6050 والبازر في هذا الوضع.
- ESP32 تستقبل من Wi‑Fi/Bluetooth وتنقل أوامر التحكم عبر TX/RX.

> عند توصيل UART بين 5V Arduino و3.3V ESP32 استخدم تحويل مستويات منطقي مناسبًا على خط Arduino TX → ESP32 RX. لا تعتمد على سلك مباشر عند التشغيل الفعلي دون التحقق من مستوى الجهد.

## الوضع 3 — ESP32 Standalone

- `L298N 5V → ESP32 VIN` وليس `3V3`.
- `ESP32 GPIO21/SDA → MPU6050 SDA`.
- `ESP32 GPIO22/SCL → MPU6050 SCL`.
- `ESP32 GPIO5 → HC-SR04 TRIG`.
- `HC-SR04 ECHO → Voltage Divider IN/ECHO`.
- `Voltage Divider OUT/ESP32 → ESP32 GPIO34`.
- مقسم الجهد: `R1=1kΩ` من ECHO إلى OUT، و`R2=2kΩ` من OUT إلى GND، والنسبة التقريبية `2/3`.
- `ESP32 GPIO32 ← Potentiometer SIG/WIPER`.
- `ESP32 GPIO33 → Passive Buzzer SIG/PWM`.
- `ESP32 GPIO25 → L298N ENA`.
- `ESP32 GPIO26/GPIO14 → L298N IN1/IN2`.
- `ESP32 GPIO18/GPIO19 → L298N IN3/IN4`.

## الحماية

- أربعة مقاومات `220Ω–330Ω`، واحدة على التوالي مع كل LED بين GPIO و`A`; طرف `K` إلى GND.
- أربعة `1N4007` كمسارات Flyback حول أحمال المحركات وفق مخطط L298N الفعلي؛ اتجاه الدايود يراجع على اللوحة قبل التركيب.
- مكثف `100µF/25V`: `+` على خط البطارية بعد المفتاح أو مدخل VMS حسب تصميم التوزيع، و`-` إلى GND. راعِ القطبية.
- الأرضي المشترك: البطارية `B-`، L298N `GND`، Arduino `GND`، ESP32 `GND`، الحساسات والبازر.

## التحكم

| المصدر | الأمر |
|---|---|
| Left stick | `F`, `B`, `L`, `R` |
| Right stick center | `h` |
| Right stick up/right/down/left | `1`, `2`, `3`, `4` |
| A / X | زيادة/تقليل السرعة حتى 10 مستويات |
| R1 / L1 | عجلة يمنى/يسرى |
| Y + R2/L2 | `C` / `c` دوران كامل |
| D-pad up/down | دفعة تعتمد على زاوية MPU6050 |
| D-pad right/left | دوران 45° |

تطبيق عكس اتجاه الحركة مضبوط في `firmware/unified_robot.cpp` عبر `REVERSE_MOTOR_DIRECTION=true` دون تغيير أوامر `F/B/L/R`.
