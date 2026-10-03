const registry={};
let mode='arduino',zoom=1,showGrid=true,selected=null,wireStart=null,current=null,simTimer=null;
const $=id=>document.getElementById(id);
const colors={power:'#d84f5a',ground:'#243644',i2c:'#8153c8',control:'#d48820',sensor:'#c29109',motor:'#18a774',signal:'#2e7be6',warning:'#d99e27'};
const defs={"arduino":{"name":"Arduino Only BalanceBot","controller":"arduino_uno","subtitle":"USB · Uno R3 · Clean orthogonal layout"},"hybrid":{"name":"Hybrid Arduino + ESP32","controller":"arduino_uno","subtitle":"Mode Switch · TX/RX · exact silkscreen pins"},"esp32":{"name":"ESP32 Standalone BalanceBot","controller":"esp32_devkit","subtitle":"3.3V logic · DevKit"}};
const samples={"arduino":{"project":{"name":"BalanceBot Arduino Only — Clean Orthogonal Layout","version":"3.1","mode":"arduino_only","layout":"spacious_orthogonal"},"components":[{"id":"battery_1","type":"battery_pack_3s","position":{"x":560,"y":80},"rotation":0,"label":"3S 18650 INR 18650-26EC Battery Pack"},{"id":"power_1","type":"power_switch","position":{"x":820,"y":100},"rotation":0,"label":"Main Power Rocker Switch"},{"id":"cap_1","type":"capacitor_100uf","position":{"x":1010,"y":100},"rotation":0,"label":"Electrolytic Capacitor 100µF/25V"},{"id":"pot_1","type":"potentiometer_10k","position":{"x":70,"y":250},"rotation":0,"label":"Rotary Potentiometer 10K"},{"id":"buzzer_1","type":"passive_buzzer","position":{"x":70,"y":420},"rotation":0,"label":"Passive Buzzer"},{"id":"ir_1","type":"ir_receiver","position":{"x":70,"y":590},"rotation":0,"label":"IR Receiver Module"},{"id":"led_red_1","type":"led_red","position":{"x":70,"y":760},"rotation":0,"label":"Red LED"},{"id":"led_green_1","type":"led_green","position":{"x":250,"y":760},"rotation":0,"label":"Green LED"},{"id":"res_red_1","type":"resistor_220","position":{"x":70,"y":900},"rotation":0,"label":"LED Resistor 220–330Ω"},{"id":"res_green_1","type":"resistor_220","position":{"x":250,"y":900},"rotation":0,"label":"LED Resistor 220–330Ω"},{"id":"arduino_1","type":"arduino_uno","position":{"x":535,"y":315},"rotation":0,"label":"Arduino Uno R3 ATmega328P"},{"id":"mpu_1","type":"mpu6050","position":{"x":900,"y":260},"rotation":0,"label":"MPU6050 6-DOF Module"},{"id":"sonar_1","type":"hc_sr04","position":{"x":1120,"y":450},"rotation":0,"label":"HC-SR04 Ultrasonic Sensor"},{"id":"diode1","type":"diode_1n4007","position":{"x":650,"y":760},"rotation":0,"label":"1N4007 Flyback Diode"},{"id":"diode2","type":"diode_1n4007","position":{"x":830,"y":760},"rotation":0,"label":"1N4007 Flyback Diode"},{"id":"driver_1","type":"l298n","position":{"x":555,"y":850},"rotation":0,"label":"L298N Dual H-Bridge Motor Driver"},{"id":"motor_l","type":"tt_motor","position":{"x":430,"y":1110},"rotation":0,"label":"Yellow TT DC Gear Motor"},{"id":"motor_r","type":"tt_motor","position":{"x":790,"y":1110},"rotation":0,"label":"Yellow TT DC Gear Motor"},{"id":"caster_front","type":"caster_wheel","position":{"x":1050,"y":1080},"rotation":0,"label":"Nylon Caster Wheel 30mm"},{"id":"chassis_1","type":"robot_chassis","position":{"x":1050,"y":820},"rotation":0,"label":"Two-Layer Robot Chassis"}],"wires":[{"from":"battery_1.B+","to":"power_1.IN","label":"B+ → main switch","signal":"power","color":"power","routeLane":1180},{"from":"power_1.OUT","to":"driver_1.VMS/12V","label":"11.1–12.6V motor rail","signal":"power","color":"power","routeLane":1240},{"from":"battery_1.B-","to":"driver_1.GND","label":"common ground","signal":"ground","color":"ground","routeLane":1280},{"from":"driver_1.5V","to":"arduino_1.5V","label":"regulated 5V from L298N jumper","signal":"power","color":"power","routeLane":470},{"from":"driver_1.GND","to":"arduino_1.GND","label":"common ground","signal":"ground","color":"ground","routeLane":500},{"from":"battery_1.B+","to":"cap_1.+","label":"100µF smoothing +","signal":"power","color":"power","routeLane":1320},{"from":"battery_1.B-","to":"cap_1.-","label":"100µF smoothing -","signal":"ground","color":"ground","routeLane":1360},{"from":"arduino_1.A4","to":"mpu_1.SDA","label":"I2C SDA","signal":"i2c","color":"i2c","routeLane":850},{"from":"arduino_1.A5","to":"mpu_1.SCL","label":"I2C SCL","signal":"i2c","color":"i2c","routeLane":900},{"from":"arduino_1.5V","to":"mpu_1.VCC","label":"MPU VCC","signal":"power","color":"power","routeLane":950},{"from":"arduino_1.GND","to":"mpu_1.GND","label":"MPU GND","signal":"ground","color":"ground","routeLane":1000},{"from":"arduino_1.2","to":"sonar_1.TRIG","label":"TRIG","signal":"sensor","color":"sensor","routeLane":1060},{"from":"arduino_1.~3","to":"sonar_1.ECHO","label":"ECHO 5V","signal":"sensor","color":"sensor","routeLane":1100},{"from":"arduino_1.A2","to":"pot_1.SIG/WIPER","label":"volume analog input","signal":"sensor","color":"sensor","routeLane":330},{"from":"arduino_1.5V","to":"pot_1.VCC","label":"pot supply","signal":"power","color":"power","routeLane":290},{"from":"arduino_1.GND","to":"pot_1.GND","label":"pot ground","signal":"ground","color":"ground","routeLane":250},{"from":"arduino_1.~9","to":"buzzer_1.SIG/PWM","label":"buzzer PWM","signal":"control","color":"control","routeLane":210},{"from":"buzzer_1.GND","to":"arduino_1.GND","label":"buzzer return","signal":"ground","color":"ground","routeLane":180},{"from":"arduino_1.A1","to":"ir_1.OUT/S","label":"IR signal","signal":"signal","color":"signal","routeLane":140},{"from":"arduino_1.5V","to":"ir_1.VCC","label":"IR VCC","signal":"power","color":"power","routeLane":100},{"from":"ir_1.GND","to":"arduino_1.GND","label":"IR ground","signal":"ground","color":"ground","routeLane":60},{"from":"arduino_1.~11","to":"led_red_1.A","label":"red status","signal":"signal","color":"signal","routeLane":40},{"from":"arduino_1.12","to":"led_red_1.K","label":"red return","signal":"ground","color":"ground","routeLane":20},{"from":"arduino_1.13","to":"led_green_1.A","label":"green status","signal":"signal","color":"signal","routeLane":80},{"from":"arduino_1.4","to":"led_green_1.K","label":"green return","signal":"ground","color":"ground","routeLane":120},{"from":"arduino_1.~11","to":"res_red_1.1","label":"red LED resistor","signal":"signal","color":"signal","routeLane":30},{"from":"res_red_1.2","to":"led_red_1.A","label":"red resistor to A","signal":"signal","color":"signal","routeLane":35},{"from":"arduino_1.13","to":"res_green_1.1","label":"green LED resistor","signal":"signal","color":"signal","routeLane":70},{"from":"res_green_1.2","to":"led_green_1.A","label":"green resistor to A","signal":"signal","color":"signal","routeLane":75},{"from":"arduino_1.~5","to":"driver_1.ENA","label":"left PWM","signal":"control","color":"control","routeLane":530},{"from":"arduino_1.7","to":"driver_1.IN1","label":"left direction A","signal":"control","color":"control","routeLane":570},{"from":"arduino_1.8","to":"driver_1.IN2","label":"left direction B","signal":"control","color":"control","routeLane":610},{"from":"arduino_1.~10","to":"driver_1.IN3","label":"right direction A","signal":"control","color":"control","routeLane":650},{"from":"arduino_1.A0","to":"driver_1.IN4","label":"right direction B","signal":"control","color":"control","routeLane":690},{"from":"arduino_1.~6","to":"driver_1.ENB","label":"right PWM","signal":"control","color":"control","routeLane":730},{"from":"driver_1.OUT1","to":"motor_l.M+","label":"left motor +","signal":"motor","color":"motor","routeLane":450},{"from":"driver_1.OUT2","to":"motor_l.M-","label":"left motor -","signal":"motor","color":"motor","routeLane":490},{"from":"driver_1.OUT3","to":"motor_r.M+","label":"right motor +","signal":"motor","color":"motor","routeLane":810},{"from":"driver_1.OUT4","to":"motor_r.M-","label":"right motor -","signal":"motor","color":"motor","routeLane":850}],"settings":{"showPinNumbers":true,"showLabels":true,"showElectricalWarnings":true,"grid":24,"powerSystem":"3S_18650","sharedGround":true,"routing":"orthogonal_obstacle_avoiding","padding":48,"pinNaming":"physical_silkscreen","esp32Naming":"GPIOxx","wiringTableVersion":"3.1"}},"hybrid":{"project":{"name":"BalanceBot Hybrid Arduino + ESP32","version":"3.1","mode":"hybrid"},"components":[{"id":"arduino_1","type":"arduino_uno","position":{"x":130,"y":180},"rotation":0,"label":"Arduino Uno R3 ATmega328P"},{"id":"esp_1","type":"esp32_devkit","position":{"x":400,"y":160},"rotation":0,"label":"ESP32 Dev Board 30-pin"},{"id":"driver_1","type":"l298n","position":{"x":700,"y":390},"rotation":0,"label":"L298N Dual H-Bridge Motor Driver"},{"id":"mode_1","type":"mode_switch","position":{"x":360,"y":40},"rotation":0,"label":"Mode Selector Toggle SPST"},{"id":"battery_1","type":"battery_pack_3s","position":{"x":700,"y":60},"rotation":0,"label":"3S 18650 INR 18650-26EC Battery Pack"},{"id":"power_1","type":"power_switch","position":{"x":900,"y":220},"rotation":0,"label":"Main Power Rocker Switch"},{"id":"mpu_1","type":"mpu6050","position":{"x":430,"y":430},"rotation":0,"label":"MPU6050 6-DOF Module"},{"id":"pot_1","type":"potentiometer_10k","position":{"x":80,"y":420},"rotation":0,"label":"Rotary Potentiometer 10K"},{"id":"buzzer_1","type":"passive_buzzer","position":{"x":180,"y":560},"rotation":0,"label":"Passive Buzzer"},{"id":"motor_l","type":"tt_motor","position":{"x":650,"y":620},"rotation":0,"label":"Yellow TT DC Gear Motor"},{"id":"motor_r","type":"tt_motor","position":{"x":850,"y":620},"rotation":0,"label":"Yellow TT DC Gear Motor"}],"wires":[{"from":"battery_1.B+","to":"power_1.IN","label":"battery to main switch","signal":"power","color":"power"},{"from":"power_1.OUT","to":"driver_1.VMS/12V","label":"motor rail","signal":"power","color":"power"},{"from":"battery_1.B-","to":"driver_1.GND","label":"common ground","signal":"ground","color":"ground"},{"from":"driver_1.5V","to":"arduino_1.5V","label":"regulated 5V","signal":"power","color":"power"},{"from":"driver_1.5V","to":"esp_1.VIN","label":"5V to ESP32 VIN through mode switch","signal":"power","color":"power"},{"from":"mode_1.COM","to":"driver_1.5V","label":"mode supply common","signal":"control","color":"control"},{"from":"mode_1.NO/ON","to":"esp_1.VIN","label":"hybrid mode ON","signal":"control","color":"control"},{"from":"esp_1.GPIO17","to":"arduino_1.RX←0","label":"ESP32 TX to Arduino RX","signal":"serial","color":"serial"},{"from":"arduino_1.TX→1","to":"esp_1.GPIO16","label":"Arduino TX to ESP32 RX","signal":"serial","color":"serial"},{"from":"arduino_1.A4","to":"mpu_1.SDA","label":"I2C SDA owned by Arduino","signal":"i2c","color":"i2c"},{"from":"arduino_1.A5","to":"mpu_1.SCL","label":"I2C SCL owned by Arduino","signal":"i2c","color":"i2c"},{"from":"arduino_1.A2","to":"pot_1.SIG/WIPER","label":"buzzer volume input","signal":"sensor","color":"sensor"},{"from":"arduino_1.~3","to":"buzzer_1.SIG/PWM","label":"buzzer PWM","signal":"control","color":"control"},{"from":"buzzer_1.GND","to":"arduino_1.GND","label":"buzzer ground","signal":"ground","color":"ground"},{"from":"driver_1.OUT1","to":"motor_l.M+","label":"left motor","signal":"motor","color":"motor"},{"from":"driver_1.OUT2","to":"motor_l.M-","label":"left motor return","signal":"motor","color":"motor"},{"from":"driver_1.OUT3","to":"motor_r.M+","label":"right motor","signal":"motor","color":"motor"},{"from":"driver_1.OUT4","to":"motor_r.M-","label":"right motor return","signal":"motor","color":"motor"}],"settings":{"showPinNumbers":true,"showLabels":true,"showElectricalWarnings":true,"grid":24,"powerSystem":"3S_18650","sharedGround":true,"pinNaming":"physical_silkscreen","esp32Naming":"GPIOxx","wiringTableVersion":"3.1"}},"esp32":{"project":{"name":"BalanceBot ESP32 Standalone","version":"3.1","mode":"esp32_standalone"},"components":[{"id":"esp_1","type":"esp32_devkit","position":{"x":260,"y":170},"rotation":0,"label":"ESP32 Dev Board 30-pin"},{"id":"driver_1","type":"l298n","position":{"x":590,"y":390},"rotation":0,"label":"L298N Dual H-Bridge Motor Driver"},{"id":"mpu_1","type":"mpu6050","position":{"x":530,"y":80},"rotation":0,"label":"MPU6050 6-DOF Module"},{"id":"sonar_1","type":"hc_sr04","position":{"x":800,"y":80},"rotation":0,"label":"HC-SR04 Ultrasonic Sensor"},{"id":"level_1","type":"voltage_divider","position":{"x":950,"y":180},"rotation":0,"label":"Echo Voltage Divider 1kΩ/2kΩ"},{"id":"pot_1","type":"potentiometer_10k","position":{"x":60,"y":100},"rotation":0,"label":"Rotary Potentiometer 10K"},{"id":"buzzer_1","type":"passive_buzzer","position":{"x":60,"y":270},"rotation":0,"label":"Passive Buzzer"},{"id":"battery_1","type":"battery_pack_3s","position":{"x":600,"y":80},"rotation":0,"label":"3S 18650 INR 18650-26EC Battery Pack"},{"id":"power_1","type":"power_switch","position":{"x":800,"y":300},"rotation":0,"label":"Main Power Rocker Switch"},{"id":"motor_l","type":"tt_motor","position":{"x":520,"y":620},"rotation":0,"label":"Yellow TT DC Gear Motor"},{"id":"motor_r","type":"tt_motor","position":{"x":800,"y":620},"rotation":0,"label":"Yellow TT DC Gear Motor"}],"wires":[{"from":"battery_1.B+","to":"power_1.IN","label":"3S B+ to switch","signal":"power","color":"power"},{"from":"power_1.OUT","to":"driver_1.VMS/12V","label":"motor rail","signal":"power","color":"power"},{"from":"battery_1.B-","to":"driver_1.GND","label":"common ground","signal":"ground","color":"ground"},{"from":"driver_1.5V","to":"esp_1.VIN","label":"regulated 5V to ESP32 VIN","signal":"power","color":"power"},{"from":"esp_1.GND","to":"driver_1.GND","label":"common ground","signal":"ground","color":"ground"},{"from":"esp_1.GPIO21","to":"mpu_1.SDA","label":"I2C SDA","signal":"i2c","color":"i2c"},{"from":"esp_1.GPIO22","to":"mpu_1.SCL","label":"I2C SCL","signal":"i2c","color":"i2c"},{"from":"esp_1.3V3","to":"mpu_1.VCC","label":"3.3V sensor supply","signal":"power","color":"power"},{"from":"esp_1.GPIO16","to":"sonar_1.TRIG","label":"TRIG","signal":"sensor","color":"sensor"},{"from":"sonar_1.ECHO","to":"level_1.IN/ECHO","label":"5V Echo into divider","signal":"warning","color":"warning"},{"from":"level_1.OUT/ESP32","to":"esp_1.GPIO17","label":"safe 3.3V Echo","signal":"sensor","color":"sensor"},{"from":"esp_1.GPIO35","to":"pot_1.SIG/WIPER","label":"volume analog input","signal":"sensor","color":"sensor"},{"from":"esp_1.GPIO4","to":"buzzer_1.SIG/PWM","label":"buzzer PWM","signal":"control","color":"control"},{"from":"esp_1.GPIO25","to":"driver_1.ENA","label":"left PWM","signal":"control","color":"control"},{"from":"esp_1.GPIO27","to":"driver_1.IN1","label":"left direction A","signal":"control","color":"control"},{"from":"esp_1.GPIO14","to":"driver_1.IN2","label":"left direction B","signal":"control","color":"control"},{"from":"esp_1.GPIO13","to":"driver_1.IN3","label":"right direction A","signal":"control","color":"control"},{"from":"esp_1.GPIO23","to":"driver_1.IN4","label":"right direction B","signal":"control","color":"control"},{"from":"driver_1.OUT1","to":"motor_l.M+","label":"left motor +","signal":"motor","color":"motor"},{"from":"driver_1.OUT2","to":"motor_l.M-","label":"left motor -","signal":"motor","color":"motor"},{"from":"driver_1.OUT3","to":"motor_r.M+","label":"right motor +","signal":"motor","color":"motor"},{"from":"driver_1.OUT4","to":"motor_r.M-","label":"right motor -","signal":"motor","color":"motor"}],"settings":{"showPinNumbers":true,"showLabels":true,"showElectricalWarnings":true,"grid":24,"powerSystem":"3S_18650","sharedGround":true,"pinNaming":"physical_silkscreen","esp32Naming":"GPIOxx","wiringTableVersion":"3.1"}}};
function toProject(key){const s=samples[key];return JSON.parse(JSON.stringify(s))}
function toJson(){return JSON.stringify(current,null,2)}
function pinMap(c){return registry[c.type]?.pins.reduce((o,p)=>{o[p[0]]={kind:p[1],direction:p[2]};return o}, {})||{}}
function parse(){try{const data=JSON.parse($('jsonEditor').value);const ids=(data.components||[]).map(c=>c.id);if(!data.project||!Array.isArray(data.components)||!Array.isArray(data.wires))throw Error('يجب أن يحتوي الملف على project و components و wires');if(ids.some((id,i)=>!id||ids.indexOf(id)!==i))throw Error('كل component يحتاج id فريدًا غير فارغ');const known=new Set(ids);for(const w of data.wires){for(const side of ['from','to']){const [cid,pin]=String(w[side]||'').split('.');if(!known.has(cid)||!pinMap(data.components.find(c=>c.id===cid))[pin])throw Error(`نقطة اتصال غير معروفة: ${w[side]}`)}}current=data;$('errorBox').hidden=true;$('editorStatus').textContent='تم التحليل وفق العقد المحلي';return data}catch(e){$('errorBox').hidden=false;$('errorBox').textContent='خطأ في JSON: '+e.message;$('editorStatus').textContent='يحتاج الملف إلى تصحيح';return null}}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function pinPosition(c,pin,index){const d=registry[c.type],i=d.pins.findIndex(p=>p[0]===pin),side=i%2?'right':'left',row=Math.floor(i/2),count=Math.ceil(d.pins.length/2);return {x:c.position.x+(side==='left'?0:d.width),y:c.position.y+40+(row+1)*(Math.max(22,(d.height-52)/(count+1)))} }
function pinDef(c,pin){return registry[c.type]?.pins.find(p=>p[0]===pin)||[pin,'unknown','UNKNOWN']}
function pinRole(p){return ({POWER:'طاقة',GND:'أرضي',INPUT:'دخل',OUTPUT:'خرج',I2C:'I²C',PASSIVE:'سلبي'})[p[2]]||p[1]}
function pinText(c,pin){const p=pinDef(c,pin);return `${c.label||registry[c.type]?.name} · الطرف ${p[0]}`}
function parseRef(ref){const [cid,...rest]=ref.split('.');return {cid,pin:rest.join('.')}}
function endpoint(ref){const r=parseRef(ref),c=current.components.find(x=>x.id===r.cid);return c&&pinPosition(c,r.pin)}
function nodeShape(c){const d=registry[c.type],x=c.position.x,y=c.position.y,fill=c.type.includes('motor')?'#e9f7f0':c.type.includes('battery')?'#fff5cc':c.category==='Controllers'?'#e8f2ff':'#f7fbfd';let art='';
if(c.type==='arduino_uno'||c.type==='esp32_devkit')art=`<rect x="${x+20}" y="${y+42}" width="${d.width-40}" height="${d.height-65}" rx="8" fill="#153a58"/><text x="${x+d.width/2}" y="${y+d.height/2}" text-anchor="middle" fill="#cce9ff" font-size="15" font-weight="700">${c.type==='arduino_uno'?'UNO R3':'ESP32'}</text>`;
else if(c.type==='mpu6050')art=`<circle cx="${x+d.width/2-25}" cy="${y+49}" r="16" fill="#fff" stroke="#68859a" stroke-width="3"/><circle cx="${x+d.width/2+25}" cy="${y+49}" r="16" fill="#fff" stroke="#68859a" stroke-width="3"/>`;
else if(c.type==='hc_sr04')art=`<circle cx="${x+50}" cy="${y+48}" r="20" fill="#fff" stroke="#68859a" stroke-width="3"/><circle cx="${x+120}" cy="${y+48}" r="20" fill="#fff" stroke="#68859a" stroke-width="3"/>`;
else if(c.type==='tt_motor')art=`<circle cx="${x+d.width/2}" cy="${y+42}" r="24" fill="#f6c84d" stroke="#b78518" stroke-width="4"/><path d="M${x+d.width/2-8} ${y+42}h16M${x+d.width/2} ${y+34}v16" stroke="#8d6916" stroke-width="3"/>`;
else if(c.type==='led_red'||c.type==='led_green')art=`<circle cx="${x+d.width/2}" cy="${y+42}" r="20" fill="${c.type==='led_red'?'#ef5962':'#37c982'}" stroke="#365c77" stroke-width="3"/>`;
else if(c.type==='voltage_divider')art=`<path d="M${x+28} ${y+53}h22l9-20 14 40 14-40 14 20h26" fill="none" stroke="#2e7be6" stroke-width="3"/>`;
else if(c.type==='battery_pack_3s')art=`<rect x="${x+30}" y="${y+30}" width="28" height="42" rx="10" fill="#555"/><rect x="${x+68}" y="${y+30}" width="28" height="42" rx="10" fill="#555"/><rect x="${x+106}" y="${y+30}" width="28" height="42" rx="10" fill="#555"/><path d="M${x+40} ${y+24}v8M${x+118} ${y+24}v8" stroke="#d84f5a" stroke-width="3"/>`;
else if(c.type==='power_switch'||c.type==='mode_switch')art=`<rect x="${x+34}" y="${y+32}" width="${d.width-68}" height="28" rx="8" fill="#405464"/><path d="M${x+d.width/2-18} ${y+46}l18-10v20z" fill="#ee7944"/>`;
else if(c.type==='capacitor_100uf')art=`<line x1="${x+58}" y1="${y+28}" x2="${x+58}" y2="${y+70}" stroke="#2e7be6" stroke-width="5"/><line x1="${x+78}" y1="${y+28}" x2="${x+78}" y2="${y+70}" stroke="#2e7be6" stroke-width="5"/><text x="${x+68}" y="${y+20}" text-anchor="middle" fill="#d84f5a" font-size="15">+</text>`;
else if(c.type==='passive_buzzer')art=`<circle cx="${x+d.width/2}" cy="${y+42}" r="22" fill="#303942" stroke="#d99e27" stroke-width="3"/><path d="M${x+d.width/2-8} ${y+33}q16 9 0 18M${x+d.width/2+2} ${y+28}q22 14 0 28" fill="none" stroke="#f4d28a" stroke-width="2"/>`;
else if(c.type==='potentiometer_10k')art=`<circle cx="${x+d.width/2}" cy="${y+42}" r="22" fill="#405464" stroke="#d99e27" stroke-width="3"/><line x1="${x+d.width/2}" y1="${y+42}" x2="${x+d.width/2+12}" y2="${y+28}" stroke="#fff" stroke-width="3"/>`;
else if(c.type==='resistor_220'||c.type==='resistor_1k'||c.type==='resistor_2k')art=`<path d="M${x+28} ${y+42}h18l8-14 14 28 14-28 14 28 8-14h20" fill="none" stroke="#b77928" stroke-width="3"/>`;
else if(c.type==='diode_1n4007')art=`<path d="M${x+46} ${y+28}l28 14-28 14z" fill="#d84f5a"/><line x1="${x+80}" y1="${y+25}" x2="${x+80}" y2="${y+59}" stroke="#243644" stroke-width="4"/>`;
else if(c.type==='ir_receiver')art=`<rect x="${x+45}" y="${y+25}" width="${d.width-90}" height="35" rx="8" fill="#28333b"/><circle cx="${x+d.width/2}" cy="${y+42}" r="9" fill="#7aa1b8"/>`;
else if(c.type==='l298n')art=`<rect x="${x+20}" y="${y+42}" width="${d.width-40}" height="${d.height-66}" rx="6" fill="#28333b"/><text x="${x+d.width/2}" y="${y+79}" text-anchor="middle" fill="#f6cf82" font-size="16" font-weight="700">L298N</text>`;
else if(c.type==='caster_wheel')art=`<circle cx="${x+d.width/2}" cy="${y+42}" r="22" fill="#9ca7ad" stroke="#365c77" stroke-width="3"/>`;
else if(c.type==='robot_chassis')art=`<rect x="${x+28}" y="${y+28}" width="${d.width-56}" height="38" rx="12" fill="#c6d5dd" stroke="#365c77" stroke-width="3"/>`;
return `<g class="svg-node ${selected===c.id?'selected':''}" data-node="${c.id}"><rect x="${x}" y="${y}" width="${d.width}" height="${d.height}" rx="12" fill="${fill}" stroke="${selected===c.id?'#2e7be6':'#365c77'}" stroke-width="${selected===c.id?3:1.8}"/><text x="${x+d.width/2}" y="${y+24}" text-anchor="middle" fill="#173b56" font-size="13" font-weight="700">${esc(c.label||d.name)}</text>${art}<text x="${x+d.width/2}" y="${y+d.height-12}" text-anchor="middle" fill="#71889a" font-size="9">${esc(d.voltage)}</text>${d.pins.map((p,i)=>{const pt=pinPosition(c,p[0],i),left=pt.x===x,connected=current.wires.some(w=>w.from===`${c.id}.${p[0]}`||w.to===`${c.id}.${p[0]}`),active=wireStart===`${c.id}.${p[0]}`,col=p[2]==='POWER'?'#d84f5a':p[2]==='GND'?'#111820':p[2]==='OUTPUT'?'#2e7be6':'#18a774',labelX=pt.x+(left?-12:12);return `<g class="pin ${connected?'connected':''} ${active?'pin-active':''}" data-ref="${c.id}.${p[0]}" tabindex="0" role="button" aria-label="${esc(pinText(c,p[0]))}"><title>${esc(pinText(c,p[0]))} · ${esc(pinRole(p))}</title><line x1="${pt.x}" y1="${pt.y}" x2="${pt.x+(left?-15:15)}" y2="${pt.y}" stroke="${active?'#ee7944':col}" stroke-width="${active?4:2}"/><circle cx="${pt.x}" cy="${pt.y}" r="${active?8:6}" fill="${active?'#ee7944':col}" stroke="#fff" stroke-width="2"/><rect x="${left?labelX-58:labelX-3}" y="${pt.y-10}" width="61" height="20" rx="5" fill="${active?'#fff0e8':connected?'#eef8f2':'#fff'}" stroke="${active?'#ee7944':col}" stroke-width="1"/><text x="${labelX+(left?-28:29)}" y="${pt.y+4}" text-anchor="middle" fill="#173b56" font-size="9" font-weight="800" direction="ltr">${esc(p[0])}</text></g>`}).join('')}</g>`}
function rectFor(c){const d=registry[c.type]||{width:140,height:90};return {x:c.position.x,y:c.position.y,w:d.width,h:d.height,id:c.id}}
function intersects(seg,r){const pad=18;const minX=Math.min(seg.x1,seg.x2),maxX=Math.max(seg.x1,seg.x2),minY=Math.min(seg.y1,seg.y2),maxY=Math.max(seg.y1,seg.y2);return !(maxX<r.x-pad||minX>r.x+r.w+pad||maxY<r.y-pad||minY>r.y+r.h+pad)}
function pathScore(points,skip){let score=0;const obs=current.components.map(rectFor).filter(r=>!skip.includes(r.id));for(let i=1;i<points.length;i++){const seg={x1:points[i-1].x,y1:points[i-1].y,x2:points[i].x,y2:points[i].y};if(obs.some(r=>intersects(seg,r)))score+=100000;score+=Math.hypot(seg.x2-seg.x1,seg.y2-seg.y1)}return score}
function route(a,b,w){if(window.balancebotRoute)return window.balancebotRoute(a,b,w,current.components,registry);const src=parseRef(w.from).cid,dst=parseRef(w.to).cid;const xs=[Number(w?.routeLane),-80,Math.max(...current.components.map(c=>c.position.x+(registry[c.type]?.width||140)))+80,...current.components.flatMap(c=>{const r=rectFor(c);return [r.x-32,r.x+r.w+32]})].filter(Number.isFinite);const ys=[-30,Math.max(...current.components.map(c=>c.position.y+(registry[c.type]?.height||90)))+60,...current.components.flatMap(c=>{const r=rectFor(c);return [r.y-32,r.y+r.h+32]})];let best=null;for(const x of xs){const pts=[a,{x,y:a.y},{x,y:b.y},b],score=pathScore(pts,[src,dst]);if(!best||score<best.score)best={pts,score}}for(const y of ys){const pts=[a,{x:a.x,y},{x:b.x,y},b],score=pathScore(pts,[src,dst]);if(!best||score<best.score)best={pts,score}}return best.pts.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ')}
function render(){const data=parse();if(!data)return;const maxX=Math.max(980,...data.components.map(c=>c.position.x+(registry[c.type]?.width||140)+40)),maxY=Math.max(690,...data.components.map(c=>c.position.y+(registry[c.type]?.height||90)+40));const wires=data.wires.map((w,i)=>{const a=endpoint(w.from),b=endpoint(w.to);if(!a||!b)return '';const col=colors[w.signal]||colors[w.color]||colors.signal;return `<g class="wire" data-wire="${i}"><path d="${route(a,b)}" fill="none" stroke="${col}" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${a.x}" cy="${a.y}" r="3" fill="${col}"/><circle cx="${b.x}" cy="${b.y}" r="3" fill="${col}"/><text x="${a.x+18}" y="${a.y-8}" text-anchor="start" fill="${col}" font-size="9" font-weight="700">${esc(w.label||w.signal||'signal')}</text></g>`}).join('');$('diagram').innerHTML=`<svg viewBox="0 0 ${maxX} ${maxY}" xmlns="http://www.w3.org/2000/svg"><rect x="16" y="16" width="${maxX-32}" height="${maxY-32}" rx="18" fill="#fff" stroke="#c2d5e2" stroke-width="2"/><text x="${maxX/2}" y="42" text-anchor="middle" fill="#173b56" font-size="17" font-weight="800">${esc(data.project.name)}</text>${wires}${data.components.map(nodeShape).join('')}</svg>`;document.dispatchEvent(new CustomEvent('balancebot-diagram-rendered',{detail:{data}}));bindCanvas();updateCounts();renderLegend();renderMeta();validate();}
function bindCanvas(){document.querySelectorAll('[data-node]').forEach(el=>el.onclick=e=>{if(e.target.closest('.pin'))return;e.stopPropagation();selected=el.dataset.node;render();showProperties(selected)});document.querySelectorAll('.pin').forEach(el=>{const choose=()=>{const ref=el.dataset.ref,parts=parseRef(ref),c=current.components.find(x=>x.id===parts.cid),p=pinDef(c,parts.pin);selected=parts.cid;showProperties(parts.cid,parts.pin);if(!wireStart){wireStart=ref;$('canvasHint').textContent=`تم اختيار ${pinText(c,parts.pin)} · اختر طرف النهاية الآن`;}else if(wireStart!==ref){const a=parseRef(wireStart),fromC=current.components.find(x=>x.id===a.cid),label=`${a.pin} → ${parts.pin}`;current.wires.push({from:wireStart,to:ref,label,signal:p[2]==='GND'?'ground':p[2]==='POWER'?'power':'signal',color:p[2]==='GND'?'ground':p[2]==='POWER'?'power':'signal'});wireStart=null;$('jsonEditor').value=toJson();$('canvasHint').textContent=`تم توصيل ${pinText(fromC,a.pin)} → ${pinText(c,parts.pin)}`;render();}else{wireStart=null;$('canvasHint').textContent='أُلغي اختيار الطرف. اختر طرفًا للبدء'};render()};el.onclick=e=>{e.stopPropagation();choose()};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose()}}})}
function updateCounts(){$('componentCount').textContent=current.components.length;$('wireCount').textContent=current.wires.length}
function renderLegend(){const list=[['power','طاقة'],['ground','أرضي'],['i2c','I2C'],['control','تحكم'],['sensor','حساس'],['motor','محركات'],['signal','إشارة']];$('legend').innerHTML=list.map(([k,t])=>`<span class="legend-item"><i class="legend-line" style="background:${colors[k]||colors.signal}"></i>${t}</span>`).join('')}
function renderMeta(){$('projectMeta').innerHTML=`<div class="meta-row"><b>الاسم</b><span>${esc(current.project.name)}</span></div><div class="meta-row"><b>الإصدار</b><span>${esc(current.project.version)}</span></div><div class="meta-row"><b>النمط</b><span>${mode==='arduino'?'Arduino Uno':'ESP32 DevKit'}</span></div><div class="meta-row"><b>الشبكة</b><span>${current.settings?.grid||24}px</span></div>`}
function showProperties(id,pinName){const c=current.components.find(x=>x.id===id),d=registry[c?.type];if(!c||!d)return;const wiresFor=pin=>current.wires.filter(w=>w.from===`${c.id}.${pin}`||w.to===`${c.id}.${pin}`);$('propertiesBody').innerHTML=`<div class="selected-title"><b>${esc(c.label||d.name)}</b><span>${esc(c.id)} · ${esc(d.category)} · الجهة المطبوعة على اللوحة</span></div><div class="pinout-caption">${pinName?`الطرف المحدد: <strong>${esc(pinName)}</strong>`:'كل المخارج والأقطاب الفعلية'}</div>${d.pins.map(p=>{const links=wiresFor(p[0]);return `<div class="pin-row ${pinName===p[0]?'pin-row-selected':''}"><div><b class="board-pin-name">${esc(p[0])}</b><span>${esc(pinRole(p))}</span></div><div class="pin-links">${links.length?links.map(w=>`<small>${esc(w.from===`${c.id}.${p[0]}`?w.to:w.from)}</small>`).join(''):'<small class="unconnected">غير موصل</small>'}</div></div>`}).join('')}` }
function validate(){const issues=[],comps=current.components,wires=current.wires,has=(ref)=>wires.some(w=>w.from===ref||w.to===ref),allRefs=wires.flatMap(w=>[w.from,w.to]);const gnd=comps.some(c=>c.type==='arduino_uno'||c.type==='esp32_devkit')&&allRefs.some(r=>r.endsWith('.GND'));if(!gnd)issues.push({kind:'error-kind',title:'لا يوجد GND مشترك',body:'أضف سلكًا من GND المتحكم إلى GND كل وحدة قبل تشغيل الدائرة.'});if(mode==='esp32'&&wires.some(w=>w.from==='sonar_1.ECHO'&&w.to==='esp_1.GPIO34'))issues.push({kind:'error-kind',title:'Echo 5V → GPIO34 مباشرة',body:'استخدم voltage_divider بين HC-SR04 وESP32. هذا الاتصال قد يتلف مدخل 3.3V.'});if(comps.some(c=>c.type==='led')&&!comps.some(c=>c.type==='resistor'))issues.push({kind:'warning',title:'LED بلا مقاومة ظاهرة',body:'ضع مقاومة 220Ω على الأقل مع كل LED لتحديد التيار.'});if(comps.some(c=>c.type==='dc_motor')&&!comps.some(c=>c.type==='l298n'))issues.push({kind:'error-kind',title:'محرك بلا Driver',body:'لا توصل محرك DC مباشرة إلى GPIO؛ استخدم L298N أو Driver مناسبًا.'});const outToOut=wires.filter(w=>{const a=endpoint(w.from),b=endpoint(w.to);return a&&b&&parseRef(w.from).pin.startsWith('GPIO')&&parseRef(w.to).pin.startsWith('GPIO')});if(outToOut.length)issues.push({kind:'warning',title:'راجع اتجاه GPIO',body:'يوجد اتصال بين مخارج محتملة. تأكد من أن الطرف الآخر Input أو Driver.'});if(!issues.length)issues.push({kind:'ok',title:'الفحص الأساسي سليم',body:'المكونات والتوصيلات معروفة، ولم تظهر قاعدة تحذير حرجة في النموذج الحالي.'});$('warnings').innerHTML=issues.map(x=>`<div class="warning ${x.kind}"><strong>${x.title}</strong>${x.body}</div>`).join('');$('warningCount').textContent=issues.filter(x=>x.kind!=='ok').length;$('healthText').textContent=issues.some(x=>x.kind==='error-kind')?'يحتاج مراجعة':issues.some(x=>x.kind==='warning')?'تحذير':'سليم';$('healthText').style.color=issues.some(x=>x.kind==='error-kind')?'var(--red)':issues.some(x=>x.kind==='warning')?'var(--yellow)':'var(--green)'}
function load(key){mode=key;document.querySelectorAll('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));current=toProject(key);$('jsonEditor').value=toJson();$('canvasTitle').textContent=defs[key].name;updateLines();render();stopSim()}
function updateLines(){$('lineNumbers').textContent=$('jsonEditor').value.split('\n').map((_,i)=>i+1).join('\n')}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function startSim(){if(simTimer)return;$('simBadge').textContent='يعمل';$('simBadge').className='badge on';$('simLogic').textContent='يقرأ الإشارات';$('powerMeter').style.width='78%';$('logicMeter').style.width='64%';$('simPower').textContent='5V / 3.3V منطقي';$('simMotors').textContent='PWM تجريبي';$('simMotor')?.classList.add('on');$('simImu').textContent='قراءة زاوية افتراضية';$('imu-bars')?.classList.add('on');document.querySelector('.motor-state').classList.add('on');document.querySelector('.imu-bars').classList.add('on');simTimer=setInterval(()=>{$('simImu').textContent='ميل '+(Math.random()*4-2).toFixed(1)+'°';},900)}
function stopSim(){clearInterval(simTimer);simTimer=null;$('simBadge').textContent='متوقف';$('simBadge').className='badge idle';$('simLogic').textContent='جاهز للفحص';$('simPower').textContent='غير متصلة';$('simMotors').textContent='متوقفة';$('simImu').textContent='في الانتظار';$('powerMeter').style.width='0';$('logicMeter').style.width='0';document.querySelector('.motor-state')?.classList.remove('on');document.querySelector('.imu-bars')?.classList.remove('on')}
function addComponentAt(type,x=360,y=180){const id=type+'_new_'+Date.now().toString().slice(-4);current.components.push({id,type,position:{x:Math.max(40,Math.round(x)),y:Math.max(70,Math.round(y))},rotation:0,label:registry[type].name});$('jsonEditor').value=toJson();render();selected=id;showProperties(id)}
function renderLibrary(){const q=$('librarySearch').value.toLowerCase();const entries=Object.entries(registry).filter(([,d])=>(d.name+d.category).toLowerCase().includes(q));$('libraryList').innerHTML=entries.map(([type,d])=>`<div class="library-item" draggable="true" data-add="${type}"><div class="lib-icon">${type.includes('controller')?'▣':type.includes('motor')?'◉':type.includes('sensor')?'⌁':'·'}</div><div><b>${d.name}</b><small>${d.category} · ${d.voltage}</small></div></div>`).join('');document.querySelectorAll('[data-add]').forEach(el=>{el.onclick=()=>addComponentAt(el.dataset.add);el.ondragstart=e=>e.dataTransfer.setData('component-type',el.dataset.add)})}
$('renderBtn').onclick=render;$('resetBtn').onclick=()=>load(mode);$('runSim').onclick=()=>simTimer?stopSim():startSim();$('saveJson').onclick=()=>download(`${mode}-balancebot.json`,toJson(),'application/json');$('exportSvg').onclick=()=>{const svg=$('diagram').innerHTML;download(`${mode}-wiring.svg`,svg,'image/svg+xml')};$('exportPdf').onclick=()=>{document.body.classList.add('print-diagram');window.print();setTimeout(()=>document.body.classList.remove('print-diagram'),500)};$('jsonFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{$('jsonEditor').value=r.result;updateLines();render()};r.readAsText(f);e.target.value=''};$('jsonEditor').oninput=()=>{updateLines();if($('autoRender').checked)render()};$('jsonEditor').onscroll=()=>{$('lineNumbers').scrollTop=$('jsonEditor').scrollTop};document.querySelectorAll('.mode').forEach(b=>b.onclick=()=>load(b.dataset.mode));$('librarySearch').oninput=renderLibrary;$('diagramWrap').ondragover=e=>e.preventDefault();$('diagramWrap').ondrop=e=>{e.preventDefault();const type=e.dataTransfer.getData('component-type');if(type&&registry[type])addComponentAt(type,360,180)};$('componentFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.id||!d.name||!Array.isArray(d.pins))throw Error('يجب أن يحتوي تعريف المكوّن على id وname وpins');d.id=d.id.startsWith('custom_')?d.id:'custom_'+d.id;registry[d.id]={name:d.name,category:d.category||'Custom',voltage:d.voltage||'—',width:d.width||150,height:d.height||100,pins:d.pins};localStorage.setItem('balancebot-custom-components',JSON.stringify(Object.fromEntries(Object.entries(registry).filter(([k])=>k.startsWith('custom_')))));renderLibrary();$('libraryCount').textContent=Object.keys(registry).length;alert('تمت إضافة المكوّن المخصص إلى المكتبة المحلية.');}catch(err){alert('تعريف المكوّن غير صالح: '+err.message)}};r.readAsText(f);e.target.value=''};$('gridBtn').onclick=()=>{$('diagramWrap').classList.toggle('no-grid');showGrid=!showGrid};$('zoomIn').onclick=()=>{zoom=Math.min(1.5,zoom+.1);$('diagram').style.transform=`scale(${zoom})`;$('zoomLabel').textContent=Math.round(zoom*100)+'%'};$('zoomOut').onclick=()=>{zoom=Math.max(.6,zoom-.1);$('diagram').style.transform=`scale(${zoom})`;$('zoomLabel').textContent=Math.round(zoom*100)+'%'};$('fitBtn').onclick=()=>{zoom=1;$('diagram').style.transform='scale(1)';$('zoomLabel').textContent='100%'};document.addEventListener('keydown',e=>{if(e.target.tagName==='TEXTAREA')return;if(e.key.toLowerCase()==='r')render();if(e.key==='+')$('zoomIn').click()});
fetch('components.json').then(r=>r.json()).then(data=>{Object.assign(registry,data);try{Object.assign(registry,JSON.parse(localStorage.getItem('balancebot-custom-components')||'{}'))}catch{};$('libraryCount').textContent=Object.keys(registry).length;renderLibrary();load('arduino')}).catch(()=>{alert('تعذر تحميل components.json. شغّل المشروع عبر Live Server أو start-local.sh.')});
(() => {
  var __typeError = (msg) => {
    throw TypeError(msg);
  };
  var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
  var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

  // simulation/compile-service.js
  var CompileService = class {
    constructor({ endpoint = "/api/compile", fetchImpl = globalThis.fetch } = {}) {
      this.endpoint = endpoint;
      this.fetchImpl = fetchImpl;
    }
    async compileArduinoCode(sketchCode, { signal, board = "arduino:avr:uno" } = {}) {
      if (typeof sketchCode !== "string" || sketchCode.trim() === "") throw new Error("\u0627\u0643\u062A\u0628 \u0643\u0648\u062F Arduino \u0623\u0648\u0644\u064B\u0627.");
      const response = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ board, code: sketchCode }),
        signal
      });
      let payload;
      try {
        payload = await response.json();
      } catch {
        throw new Error(`Compiler returned non-JSON HTTP ${response.status}.`);
      }
      if (!response.ok || payload.ok === false) {
        const details = payload.buildErrors || payload.error || `Compiler returned HTTP ${response.status}.`;
        throw new Error(details);
      }
      if (typeof payload.hex !== "string") throw new Error("Compiler response is missing the hex field.");
      return payload;
    }
  };

  // simulation/intel-hex.js
  function parseIntelHex(text, flashBytes = 32768) {
    if (typeof text !== "string" || text.trim() === "") throw new Error("Intel HEX output is empty.");
    const bytes = new Uint8Array(flashBytes);
    bytes.fill(255);
    let baseAddress = 0;
    let sawData = false;
    let sawEnd = false;
    const lines = text.replace(/\r/g, "").split("\n").map((line) => line.trim()).filter(Boolean);
    for (const [index, line] of lines.entries()) {
      if (!line.startsWith(":")) throw new Error(`Intel HEX line ${index + 1} must start with ':'.`);
      if (line.length < 11 || (line.length - 1) % 2 !== 0) throw new Error(`Intel HEX line ${index + 1} has an invalid length.`);
      const raw = line.slice(1);
      const record = new Uint8Array(raw.length / 2);
      for (let i = 0; i < record.length; i += 1) {
        const pair = raw.slice(i * 2, i * 2 + 2);
        const value = Number.parseInt(pair, 16);
        if (!Number.isInteger(value)) throw new Error(`Intel HEX line ${index + 1} contains invalid hexadecimal data.`);
        record[i] = value;
      }
      const byteCount = record[0];
      if (record.length !== byteCount + 5) throw new Error(`Intel HEX line ${index + 1} byte count is inconsistent.`);
      let checksum = 0;
      for (const value of record) checksum = checksum + value & 255;
      if (checksum !== 0) throw new Error(`Intel HEX line ${index + 1} has a checksum error.`);
      const address = record[1] << 8 | record[2];
      const type = record[3];
      if (type === 0) {
        const absolute = baseAddress + address;
        for (let i = 0; i < byteCount; i += 1) {
          const target = absolute + i;
          if (target >= bytes.length) throw new Error(`Intel HEX data exceeds the configured AVR flash size at 0x${target.toString(16)}.`);
          bytes[target] = record[4 + i];
        }
        sawData = true;
      } else if (type === 1) {
        if (byteCount !== 0) throw new Error("Intel HEX EOF record must contain zero data bytes.");
        sawEnd = true;
      } else if (type === 2) {
        if (byteCount !== 2) throw new Error("Intel HEX extended segment address record must contain two data bytes.");
        baseAddress = (record[4] << 8 | record[5]) << 4;
      } else if (type === 4) {
        if (byteCount !== 2) throw new Error("Intel HEX extended linear address record must contain two data bytes.");
        baseAddress = (record[4] << 8 | record[5]) << 16;
      } else if (type !== 3 && type !== 5) {
        throw new Error(`Intel HEX record type 0x${type.toString(16).padStart(2, "0")} is not supported.`);
      }
    }
    if (!sawData) throw new Error("Intel HEX contains no data records.");
    if (!sawEnd) throw new Error("Intel HEX is missing its EOF record.");
    const words = new Uint16Array(Math.ceil(bytes.length / 2));
    for (let i = 0; i < words.length; i += 1) words[i] = bytes[i * 2] | bytes[i * 2 + 1] << 8;
    return { bytes, words };
  }
  function parseHexResponse(payload) {
    if (!payload || typeof payload !== "object") throw new Error("Compiler response must be a JSON object.");
    if (typeof payload.hex !== "string") throw new Error(payload.buildErrors || "Compiler response does not contain Intel HEX.");
    return parseIntelHex(payload.hex, Number(payload.flashBytes) || 32768);
  }

  // simulation/avr8js-runner.js
  var AVR8JS_URL = "https://cdn.jsdelivr.net/npm/avr8js@1.2.1/dist/esm/index.js";
  var Avr8jsRunner = class {
    constructor({ onPortChange = () => {
    }, onStateChange = () => {
    }, moduleUrl = AVR8JS_URL } = {}) {
      this.onPortChange = onPortChange;
      this.onStateChange = onStateChange;
      this.moduleUrl = moduleUrl;
      this.module = null;
      this.cpu = null;
      this.program = null;
      this.running = false;
      this.portValues = { B: 0, C: 0, D: 0 };
    }
    async load(hexImage) {
      if (!hexImage?.words || !(hexImage.words instanceof Uint16Array)) throw new Error("AVR runner requires parsed flash words.");
      this.module = this.module || await import(this.moduleUrl);
      const { CPU, AVRGPIO, portBConfig, portCConfig, portDConfig } = this.module;
      if (!CPU || !AVRGPIO || !portBConfig || !portCConfig || !portDConfig) throw new Error("The avr8js CDN module does not expose the expected AVR API.");
      this.program = new Uint16Array(16384);
      this.program.set(hexImage.words.subarray(0, this.program.length));
      this.cpu = new CPU(this.program);
      this.portValues = { B: 0, C: 0, D: 0 };
      this.attachPort("B", new AVRGPIO(this.cpu, portBConfig));
      this.attachPort("C", new AVRGPIO(this.cpu, portCConfig));
      this.attachPort("D", new AVRGPIO(this.cpu, portDConfig));
      this.onStateChange({ state: "loaded", cycles: this.cpu.cycles || 0 });
    }
    attachPort(name, port) {
      port.addListener((value, oldValue) => {
        const next = Number(value) & 255;
        const previous = Number(oldValue) & 255;
        this.portValues[name] = next;
        this.onPortChange({ port: name, value: next, previous, changedMask: next ^ previous, pins: this.mapPortPins(name, next) });
      });
    }
    mapPortPins(port, value) {
      const pins = {};
      const ranges = { B: [8, 6], C: [14, 6], D: [0, 8] };
      const [start3, count] = ranges[port];
      for (let bit = 0; bit < count; bit += 1) pins[start3 + bit] = Boolean(value & 1 << bit);
      return pins;
    }
    executeCycles(cycles) {
      if (!this.cpu || !this.module) throw new Error("Load a compiled HEX image before executing cycles.");
      const { avrInstruction } = this.module;
      const bounded = Math.max(0, Math.min(Math.floor(cycles), 2e6));
      for (let index = 0; index < bounded; index += 1) {
        avrInstruction(this.cpu);
        this.cpu.tick();
      }
      this.onStateChange({ state: "paused", cycles: this.cpu.cycles || 0, executed: bounded });
      return bounded;
    }
    start({ cyclesPerFrame = 16e3 } = {}) {
      if (this.running) return;
      this.running = true;
      this.onStateChange({ state: "running", cycles: this.cpu?.cycles || 0 });
      const frame2 = () => {
        if (!this.running) return;
        try {
          this.executeCycles(cyclesPerFrame);
        } catch (error) {
          this.running = false;
          this.onStateChange({ state: "error", error });
          return;
        }
        requestAnimationFrame(frame2);
      };
      requestAnimationFrame(frame2);
    }
    pause() {
      this.running = false;
      this.onStateChange({ state: "paused", cycles: this.cpu?.cycles || 0 });
    }
    getDigitalPin(pin) {
      if (pin >= 8 && pin <= 13) return Boolean(this.portValues.B & 1 << pin - 8);
      if (pin >= 14 && pin <= 19) return Boolean(this.portValues.C & 1 << pin - 14);
      if (pin >= 0 && pin <= 7) return Boolean(this.portValues.D & 1 << pin);
      throw new Error(`Arduino digital pin ${pin} is not mapped.`);
    }
  };

  // simulation/monaco-editor.js
  var MONACO_LOADER = "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs/loader.js";
  var MonacoSourceEditor = class {
    constructor({ host, fallback, initialValue, language = "cpp" }) {
      this.host = host;
      this.fallback = fallback;
      this.initialValue = initialValue;
      this.language = language;
      this.editor = null;
      this.ready = false;
    }
    async mount() {
      if (this.ready) return this;
      try {
        await this.loadScript(MONACO_LOADER);
        const monaco = await new Promise((resolve, reject) => {
          window.require.config({ paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs" } });
          window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
        });
        this.editor = monaco.editor.create(this.host, { value: this.initialValue, language: this.language, theme: "vs-dark", automaticLayout: true, minimap: { enabled: false }, fontSize: 13, wordWrap: "on", scrollBeyondLastLine: false });
        this.fallback.hidden = true;
        this.ready = true;
      } catch (error) {
        this.host.hidden = true;
        this.fallback.hidden = false;
        this.fallback.value = this.initialValue;
        this.ready = true;
        this.fallback.dataset.editorError = error.message;
      }
      return this;
    }
    loadScript(src) {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
          if (window.require) resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error("\u062A\u0639\u0630\u0631 \u062A\u062D\u0645\u064A\u0644 Monaco Editor \u0645\u0646 CDN."));
        document.head.appendChild(script);
      });
    }
    getValue() {
      return this.editor ? this.editor.getValue() : this.fallback.value;
    }
    setValue(value) {
      if (this.editor) this.editor.setValue(value);
      else this.fallback.value = value;
    }
    onChange(callback) {
      if (this.editor) this.editor.onDidChangeModelContent(() => callback(this.getValue()));
      else this.fallback.addEventListener("input", () => callback(this.getValue()));
    }
  };

  // simulation/digital-core.js
  var DigitalCore = class {
    constructor({ editorHost, fallback, status, log, sketch, compilerEndpoint = "/api/compile" }) {
      this.status = status;
      this.log = log;
      this.compileService = new CompileService({ endpoint: compilerEndpoint });
      this.editor = new MonacoSourceEditor({ host: editorHost, fallback, initialValue: sketch });
      this.runner = new Avr8jsRunner({ onPortChange: (event) => this.handlePort(event), onStateChange: (event) => this.handleState(event) });
      this.lastHex = null;
      this.abortController = null;
    }
    async mount() {
      await this.editor.mount();
      this.editor.onChange(() => this.setStatus("\u0643\u0648\u062F Arduino \u062C\u0627\u0647\u0632 \u0644\u0644\u062A\u062C\u0645\u064A\u0639", "ready"));
      this.setStatus("\u0645\u062D\u0631\u0631 \u0627\u0644\u0643\u0648\u062F \u062C\u0627\u0647\u0632", "ready");
    }
    async compile() {
      this.abortController?.abort();
      this.abortController = new AbortController();
      this.setStatus("\u062C\u0627\u0631\u064D \u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0643\u0648\u062F \u0625\u0644\u0649 \u062E\u062F\u0645\u0629 \u0627\u0644\u062A\u062C\u0645\u064A\u0639\u2026", "busy");
      this.log("compile:start");
      try {
        const payload = await this.compileService.compileArduinoCode(this.editor.getValue(), { signal: this.abortController.signal });
        this.lastHex = parseHexResponse(payload);
        this.setStatus(`\u062A\u0645 \u0627\u0644\u062A\u062C\u0645\u064A\u0639: ${this.lastHex.words.length} \u0643\u0644\u0645\u0629 Flash`, "success");
        this.log(`compile:success bytes=${this.lastHex.bytes.length}`);
        return this.lastHex;
      } catch (error) {
        if (error.name === "AbortError") return null;
        this.setStatus(`\u0641\u0634\u0644 \u0627\u0644\u062A\u062C\u0645\u064A\u0639: ${error.message}`, "error");
        this.log(`compile:error ${error.message}`);
        throw error;
      }
    }
    async loadLastHex() {
      if (!this.lastHex) throw new Error("Compile the sketch before loading the AVR emulator.");
      this.setStatus("\u062C\u0627\u0631\u064D \u062A\u062D\u0645\u064A\u0644 avr8js\u2026", "busy");
      await this.runner.load(this.lastHex);
      this.setStatus("\u062A\u0645 \u062A\u062D\u0645\u064A\u0644 ATmega328P \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A", "success");
      this.log("avr8js:loaded atmega328p");
    }
    async compileAndLoad() {
      await this.compile();
      await this.loadLastHex();
    }
    run() {
      this.runner.start();
      this.setStatus("\u0627\u0644\u0645\u0639\u0627\u0644\u062C \u064A\u0639\u0645\u0644 \u062F\u0627\u062E\u0644 \u0627\u0644\u0645\u062A\u0635\u0641\u062D", "success");
      this.log("avr8js:run");
    }
    pause() {
      this.runner.pause();
      this.setStatus("\u0627\u0644\u0645\u0639\u0627\u0644\u062C \u0645\u062A\u0648\u0642\u0641 \u0645\u0624\u0642\u062A\u064B\u0627", "ready");
      this.log("avr8js:pause");
    }
    step(cycles = 16e3) {
      const executed = this.runner.executeCycles(cycles);
      this.log(`avr8js:step cycles=${executed}`);
      return executed;
    }
    handlePort(event) {
      this.log(`gpio:PORT${event.port}=0b${event.value.toString(2).padStart(8, "0")}`);
      document.dispatchEvent(new CustomEvent("balancebot-gpio-change", { detail: event }));
    }
    handleState(event) {
      document.dispatchEvent(new CustomEvent("balancebot-digital-state", { detail: event }));
    }
    setStatus(message, kind) {
      this.status.textContent = message;
      this.status.dataset.kind = kind;
    }
  };

  // simulation/default-sketch.js
  var defaultSketch = `const int LED_PIN = 13;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(250);
  digitalWrite(LED_PIN, LOW);
  delay(250);
}
`;

  // simulation/main.js
  var byId = (id) => document.getElementById(id);
  var appendLog = (message) => {
    const target = byId("digitalLog");
    if (!target) return;
    const line = document.createElement("div");
    line.textContent = `${(/* @__PURE__ */ new Date()).toLocaleTimeString()} \xB7 ${message}`;
    target.prepend(line);
    while (target.children.length > 40) target.lastElementChild.remove();
  };
  var core = new DigitalCore({ editorHost: byId("monacoHost"), fallback: byId("arduinoSource"), status: byId("digitalStatus"), log: appendLog, sketch: defaultSketch, compilerEndpoint: document.body.dataset.compileEndpoint || "/api/compile" });
  async function start() {
    await core.mount();
    byId("digitalCompile").addEventListener("click", () => core.compileAndLoad().catch(() => {
    }));
    byId("digitalRun").addEventListener("click", () => {
      try {
        core.run();
      } catch (error) {
        core.setStatus(error.message, "error");
        appendLog(`run:error ${error.message}`);
      }
    });
    byId("digitalPause").addEventListener("click", () => core.pause());
    byId("digitalStep").addEventListener("click", () => {
      try {
        core.step();
      } catch (error) {
        core.setStatus(error.message, "error");
        appendLog(`step:error ${error.message}`);
      }
    });
    document.addEventListener("balancebot-gpio-change", (event) => {
      const pins = event.detail.pins;
      byId("digitalGpio").textContent = Object.entries(pins).map(([pin, state]) => `D${pin}:${state ? "HIGH" : "LOW"}`).join(" \xB7 ");
    });
    appendLog("phase1:ready");
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  // simulation/orthogonal-router.js
  var DEFAULT_CELL = 24;
  function key(x, y) {
    return `${x},${y}`;
  }
  function snap(value, cell) {
    return Math.round(value / cell) * cell;
  }
  function distance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  function intersectsCell(x, y, obstacles, padding) {
    return obstacles.some((r) => x >= r.x - padding && x <= r.x + r.w + padding && y >= r.y - padding && y <= r.y + r.h + padding);
  }
  function simplify(points) {
    const output = [];
    for (const point of points) {
      const previous = output[output.length - 1];
      const before = output[output.length - 2];
      if (previous && before && (before.x === previous.x && previous.x === point.x || before.y === previous.y && previous.y === point.y)) output.pop();
      output.push(point);
    }
    return output;
  }
  function toPath(points) {
    return points.map((point, index) => `${index ? "L" : "M"}${point.x},${point.y}`).join(" ");
  }
  function orthogonalAStarPath(start3, end, components, sourceId, targetId, options = {}) {
    const cell = options.cell || DEFAULT_CELL;
    const padding = options.padding || 18;
    const obstacles = components.filter((component) => component.id !== sourceId && component.id !== targetId).map((component) => ({ x: component.position.x, y: component.position.y, w: component.width || options.registry?.[component.type]?.width || 140, h: component.height || options.registry?.[component.type]?.height || 90 }));
    const maxX = Math.max(1200, ...components.map((component) => component.position.x + (component.width || options.registry?.[component.type]?.width || 140) + 120));
    const maxY = Math.max(900, ...components.map((component) => component.position.y + (component.height || options.registry?.[component.type]?.height || 90) + 120));
    const startNode = { x: snap(start3.x, cell), y: snap(start3.y, cell) };
    const endNode = { x: snap(end.x, cell), y: snap(end.y, cell) };
    const open = [{ x: startNode.x, y: startNode.y, g: 0, f: distance(startNode, endNode), previous: null }];
    const scores = /* @__PURE__ */ new Map([[key(startNode.x, startNode.y), 0]]);
    const closed = /* @__PURE__ */ new Set();
    const directions = [{ x: cell, y: 0 }, { x: -cell, y: 0 }, { x: 0, y: cell }, { x: 0, y: -cell }];
    let goal = null;
    while (open.length) {
      open.sort((a, b) => a.f - b.f || a.g - b.g);
      const current = open.shift();
      const currentKey = key(current.x, current.y);
      if (closed.has(currentKey)) continue;
      closed.add(currentKey);
      if (distance(current, endNode) <= cell) {
        goal = current;
        break;
      }
      for (const direction of directions) {
        const next = { x: current.x + direction.x, y: current.y + direction.y };
        if (next.x < 0 || next.y < 0 || next.x > maxX || next.y > maxY || intersectsCell(next.x, next.y, obstacles, padding)) continue;
        const nextKey = key(next.x, next.y);
        if (closed.has(nextKey)) continue;
        const g = current.g + cell;
        if (g >= (scores.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;
        scores.set(nextKey, g);
        open.push({ x: next.x, y: next.y, g, f: g + distance(next, endNode), previous: current });
      }
    }
    if (!goal) return toPath([start3, { x: start3.x, y: end.y }, end]);
    const gridPoints = [];
    for (let node = goal; node; node = node.previous) gridPoints.push({ x: node.x, y: node.y });
    gridPoints.reverse();
    const points = [start3, ...gridPoints.slice(1, -1), end];
    return toPath(simplify(points));
  }
  var routeHost = globalThis.window || globalThis;
  routeHost.balancebotRoute = function balancebotRoute(start3, end, wire2, components, registry) {
    const fromId = String(wire2.from || "").split(".")[0];
    const toId = String(wire2.to || "").split(".")[0];
    return orthogonalAStarPath(start3, end, components, fromId, toId, { registry, cell: 24, padding: 18 });
  };

  // simulation/interactive-components.js
  var OPTIONAL_WOKWI_CDN = "https://cdn.jsdelivr.net/npm/wokwi-elements@0.52.0/+esm";
  var externalWokwiLoaded = false;
  var BalanceBotLed = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.on = false;
    }
    connectedCallback() {
      this.render();
      this.addEventListener("click", () => {
        this.on = !this.on;
        this.render();
        this.dispatchEvent(new CustomEvent("component-change", { bubbles: true, detail: { property: "on", value: this.on } }));
      });
    }
    render() {
      this.shadowRoot.innerHTML = `<style>:host{display:inline-grid;place-items:center;width:48px;height:48px;cursor:pointer}i{width:22px;height:22px;border-radius:50%;background:${this.on ? "#ff4545" : "#602d35"};box-shadow:${this.on ? "0 0 20px #ff4545" : "none"};border:2px solid #f7c6c9}</style><i aria-label="${this.on ? "LED on" : "LED off"}"></i>`;
    }
  };
  var BalanceBotMotor = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.speed = 0;
    }
    connectedCallback() {
      this.render();
      this.addEventListener("click", () => {
        this.speed = this.speed ? 0 : 180;
        this.render();
        this.dispatchEvent(new CustomEvent("component-change", { bubbles: true, detail: { property: "speed", value: this.speed } }));
      });
    }
    render() {
      this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;cursor:pointer;color:#dbeaf5;font:11px sans-serif}b{width:30px;height:30px;border:3px solid ${this.speed ? "#20c997" : "#587386"};border-radius:50%;display:grid;place-items:center;transform:rotate(${this.speed ? 180 : 0}deg);transition:transform .35s}small{font-size:10px}</style><b>\u21BB</b><small>${this.speed ? `${this.speed} PWM` : "\u0645\u062A\u0648\u0642\u0641"}</small>`;
    }
  };
  var BalanceBotPotentiometer = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.value = 512;
    }
    connectedCallback() {
      this.render();
    }
    render() {
      this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;color:#dbeaf5;font:11px sans-serif}input{accent-color:#e2a93b;width:100px}</style><span>WIPER</span><input type="range" min="0" max="1023" value="${this.value}"><output>${this.value}</output>`;
      this.shadowRoot.querySelector("input").addEventListener("input", (event) => {
        this.value = Number(event.target.value);
        this.shadowRoot.querySelector("output").textContent = this.value;
        this.dispatchEvent(new CustomEvent("component-change", { bubbles: true, detail: { property: "analog", value: this.value } }));
      });
    }
  };
  var BalanceBotSonar = class extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.distance = 80;
    }
    connectedCallback() {
      this.render();
    }
    render() {
      this.shadowRoot.innerHTML = `<style>:host{display:inline-flex;align-items:center;gap:6px;color:#dbeaf5;font:11px sans-serif}input{accent-color:#d99e27;width:100px}</style><span>ECHO</span><input type="range" min="2" max="400" value="${this.distance}"><output>${this.distance}cm</output>`;
      this.shadowRoot.querySelector("input").addEventListener("input", (event) => {
        this.distance = Number(event.target.value);
        this.shadowRoot.querySelector("output").textContent = `${this.distance}cm`;
        this.dispatchEvent(new CustomEvent("component-change", { bubbles: true, detail: { property: "distanceCm", value: this.distance } }));
      });
    }
  };
  customElements.define("balancebot-led", BalanceBotLed);
  customElements.define("balancebot-motor", BalanceBotMotor);
  customElements.define("balancebot-potentiometer", BalanceBotPotentiometer);
  customElements.define("balancebot-sonar", BalanceBotSonar);
  async function detectOptionalWokwiElements() {
    try {
      await import(OPTIONAL_WOKWI_CDN);
      externalWokwiLoaded = true;
    } catch {
      externalWokwiLoaded = false;
    }
    document.dispatchEvent(new CustomEvent("balancebot-interactive-runtime", { detail: { externalWokwiLoaded, runtime: externalWokwiLoaded ? "wokwi-elements-cdn" : "local-web-components" } }));
  }
  function componentElement(type) {
    if (type.includes("led")) return "balancebot-led";
    if (type === "tt_motor") return "balancebot-motor";
    if (type === "potentiometer_10k") return "balancebot-potentiometer";
    if (type === "hc_sr04") return "balancebot-sonar";
    return null;
  }
  function renderPlayground(data) {
    const host = document.getElementById("interactivePlayground");
    if (!host) return;
    host.innerHTML = "";
    const title = document.createElement("div");
    title.className = "interactive-runtime-note";
    title.textContent = externalWokwiLoaded ? "Wokwi Elements CDN \u0645\u062A\u0627\u062D \xB7 \u062A\u062D\u0643\u0645 \u062A\u0641\u0627\u0639\u0644\u064A" : "Local Web Components fallback \xB7 \u062A\u062D\u0643\u0645 \u062A\u0641\u0627\u0639\u0644\u064A";
    host.append(title);
    data.components.filter((component) => componentElement(component.type)).slice(0, 8).forEach((component) => {
      const card = document.createElement("div");
      card.className = "interactive-card";
      const label = document.createElement("b");
      label.textContent = component.label || component.id;
      const element = document.createElement(componentElement(component.type));
      element.dataset.componentId = component.id;
      element.addEventListener("component-change", (event) => document.dispatchEvent(new CustomEvent("balancebot-component-change", { detail: { component, ...event.detail } })));
      card.append(label, element);
      host.append(card);
    });
  }
  document.addEventListener("balancebot-diagram-rendered", (event) => renderPlayground(event.detail.data));
  document.addEventListener("balancebot-component-change", (event) => {
    const log = document.getElementById("interactiveEventLog");
    if (log) log.textContent = `${event.detail.component.id} \xB7 ${event.detail.property} = ${event.detail.value}`;
  });
  detectOptionalWokwiElements();

  // simulation/analog-engine.js
  var _AnalogEngine_instances, motor_fn;
  var AnalogEngine = class {
    constructor({ supplyVoltage = 11.1, capacitanceFarads = 1e-4 } = {}) {
      __privateAdd(this, _AnalogEngine_instances);
      this.supplyVoltage = supplyVoltage;
      this.capacitanceFarads = capacitanceFarads;
      this.capacitorVoltage = 0;
      this.time = 0;
      this.left = { pwm: 0, voltage: 0, rpm: 0, current: 0 };
      this.right = { pwm: 0, voltage: 0, rpm: 0, current: 0 };
    }
    reset() {
      this.capacitorVoltage = 0;
      this.time = 0;
      this.left = { pwm: 0, voltage: 0, rpm: 0, current: 0 };
      this.right = { pwm: 0, voltage: 0, rpm: 0, current: 0 };
    }
    step(dtSeconds, leftPwm = 0, rightPwm = 0) {
      const dt = Math.max(1e-4, Math.min(0.1, dtSeconds));
      this.time += dt;
      const rail = this.supplyVoltage * 0.92;
      const chargeTarget = this.supplyVoltage;
      const chargeRate = (chargeTarget - this.capacitorVoltage) / (0.33 + this.capacitanceFarads * 1e3);
      this.capacitorVoltage = Math.max(0, Math.min(chargeTarget, this.capacitorVoltage + chargeRate * dt));
      this.left = __privateMethod(this, _AnalogEngine_instances, motor_fn).call(this, leftPwm, rail);
      this.right = __privateMethod(this, _AnalogEngine_instances, motor_fn).call(this, rightPwm, rail);
      return this.snapshot();
    }
    snapshot() {
      return { time: this.time, supplyVoltage: this.supplyVoltage, capacitorVoltage: this.capacitorVoltage, left: { ...this.left }, right: { ...this.right }, totalCurrent: this.left.current + this.right.current };
    }
  };
  _AnalogEngine_instances = new WeakSet();
  motor_fn = function(pwm, rail) {
    const duty = Math.max(-1, Math.min(1, Number(pwm) / 255));
    const voltage = duty * Math.max(0, rail - 2);
    const rpm = voltage * 280;
    const current = Math.abs(duty) * 0.42 + (Math.abs(duty) > 0.02 ? 0.08 : 0);
    return { pwm: Math.round(duty * 255), voltage, rpm, current };
  };

  // simulation/physics-world.js
  var MATTER_URL = "https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm";
  var RobotPhysicsWorld = class {
    constructor(canvas, onStatus = () => {
    }) {
      this.canvas = canvas;
      this.onStatus = onStatus;
      this.matter = null;
      this.engine = null;
      this.runner = null;
      this.render = null;
      this.chassis = null;
      this.leftWheel = null;
      this.rightWheel = null;
      this.ready = false;
    }
    async init() {
      try {
        this.matter = await import(MATTER_URL);
        const { Engine, Render, Runner, Bodies, Composite, Constraint } = this.matter;
        this.engine = Engine.create({ gravity: { x: 0, y: 0 } });
        this.chassis = Bodies.rectangle(300, 150, 190, 90, { frictionAir: 0.06, density: 2e-3, chamfer: { radius: 16 }, render: { fillStyle: "#183b56", strokeStyle: "#8ed1dc", lineWidth: 3 } });
        this.leftWheel = Bodies.circle(235, 150, 27, { friction: 0.7, frictionAir: 0.08, density: 4e-3, render: { fillStyle: "#202d38", strokeStyle: "#f3b64d", lineWidth: 3 } });
        this.rightWheel = Bodies.circle(365, 150, 27, { friction: 0.7, frictionAir: 0.08, density: 4e-3, render: { fillStyle: "#202d38", strokeStyle: "#f3b64d", lineWidth: 3 } });
        Composite.add(this.engine.world, [this.chassis, this.leftWheel, this.rightWheel, Constraint.create({ bodyA: this.chassis, bodyB: this.leftWheel, length: 65, stiffness: 0.8 }), Constraint.create({ bodyA: this.chassis, bodyB: this.rightWheel, length: 65, stiffness: 0.8 })]);
        this.render = Render.create({ canvas: this.canvas, engine: this.engine, options: { width: 600, height: 300, wireframes: false, background: "#071a2c", pixelRatio: 1 } });
        Render.run(this.render);
        this.runner = Runner.create();
        Runner.run(this.runner, this.engine);
        this.ready = true;
        this.onStatus("Matter.js loaded \xB7 physics running");
        return true;
      } catch (error) {
        this.ready = false;
        this.onStatus("Matter.js unavailable \xB7 physics offline");
        return false;
      }
    }
    drive(leftVoltage, rightVoltage) {
      if (!this.ready) return;
      const { Body } = this.matter;
      const left = Number(leftVoltage) / 10;
      const right = Number(rightVoltage) / 10;
      const forward = (left + right) * 45e-5;
      const turn = (right - left) * 18e-6;
      Body.applyForce(this.chassis, this.chassis.position, { x: Math.cos(this.chassis.angle) * forward, y: Math.sin(this.chassis.angle) * forward });
      Body.setAngularVelocity(this.chassis, this.chassis.angularVelocity + turn);
    }
    pause() {
      if (!this.matter || !this.runner) return;
      this.matter.Runner.stop(this.runner);
      if (this.render) this.matter.Render.stop(this.render);
      this.ready = false;
      this.paused = true;
    }
    resume() {
      if (!this.matter || !this.engine || this.ready) return;
      const { Render, Runner } = this.matter;
      this.render = Render.create({ canvas: this.canvas, engine: this.engine, options: { width: 600, height: 300, wireframes: false, background: "#071a2c", pixelRatio: 1 } });
      Render.run(this.render);
      this.runner = Runner.create();
      Runner.run(this.runner, this.engine);
      this.ready = true;
      this.paused = false;
      this.onStatus("Matter.js resumed \xB7 physics running");
    }
    reset() {
      if (!this.matter || !this.chassis) return;
      const { Body } = this.matter;
      Body.setPosition(this.chassis, { x: 300, y: 150 });
      Body.setAngle(this.chassis, 0);
      Body.setVelocity(this.chassis, { x: 0, y: 0 });
      Body.setAngularVelocity(this.chassis, 0);
      Body.setPosition(this.leftWheel, { x: 235, y: 150 });
      Body.setPosition(this.rightWheel, { x: 365, y: 150 });
    }
    stop() {
      if (!this.matter || !this.runner || !this.engine) return;
      this.matter.Runner.stop(this.runner);
      this.matter.Render.stop(this.render);
      this.ready = false;
    }
  };

  // simulation/hybrid-engine.js
  var $ = (id) => document.getElementById(id);
  var analog = new AnalogEngine();
  var world = null;
  var running = false;
  var last = performance.now();
  function setText(id, value) {
    const node = $(id);
    if (node) node.textContent = value;
  }
  function updateTelemetry(state) {
    setText("analogSupply", `${state.supplyVoltage.toFixed(2)} V`);
    setText("analogCapacitor", `${state.capacitorVoltage.toFixed(2)} V`);
    setText("analogLeft", `${state.left.rpm.toFixed(0)} RPM \xB7 ${state.left.voltage.toFixed(2)} V`);
    setText("analogRight", `${state.right.rpm.toFixed(0)} RPM \xB7 ${state.right.voltage.toFixed(2)} V`);
    setText("analogCurrent", `${state.totalCurrent.toFixed(2)} A`);
  }
  function controls() {
    return { left: Number($("physicsLeft")?.value || 0), right: Number($("physicsRight")?.value || 0) };
  }
  function frame(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1e3);
    last = now;
    const values = controls();
    const state = analog.step(dt, values.left, values.right);
    updateTelemetry(state);
    world?.drive(state.left.voltage, state.right.voltage);
    requestAnimationFrame(frame);
  }
  async function start2() {
    if (running) return;
    if (!world) {
      world = new RobotPhysicsWorld($("physicsCanvas"), (message) => setText("physicsStatus", message));
      await world.init();
    } else if (!world.ready) {
      world.resume();
    }
    running = true;
    last = performance.now();
    $("physicsBadge")?.classList.add("on");
    setText("physicsBadge", "\u064A\u0639\u0645\u0644");
    requestAnimationFrame(frame);
  }
  function pause() {
    running = false;
    world?.pause();
    $("physicsBadge")?.classList.remove("on");
    setText("physicsBadge", "\u0645\u062A\u0648\u0642\u0641");
  }
  function reset() {
    pause();
    analog.reset();
    updateTelemetry(analog.snapshot());
    world?.reset();
    setText("physicsStatus", world?.ready ? "Matter.js \u062C\u0627\u0647\u0632 \xB7 \u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0648\u0636\u0639" : "\u062C\u0627\u0647\u0632 \u0644\u0644\u0628\u062F\u0621");
  }
  function wire() {
    $("physicsStart")?.addEventListener("click", start2);
    $("physicsPause")?.addEventListener("click", pause);
    $("physicsReset")?.addEventListener("click", reset);
    ["physicsLeft", "physicsRight"].forEach((id) => $(id)?.addEventListener("input", () => setText(`${id}Value`, $(id).value)));
    updateTelemetry(analog.snapshot());
  }
  wire();
  window.balancebotPhysics = { start: start2, pause, reset, analog, getWorld: () => world };
})();
