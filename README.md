# BlocklyESP8266
Scratch-like web IDE for esp8266-based NodeMCU boards. Configured for RGB led strip.

## Getting Started

This should work on any machine which can run node-js

### Prerequisites

A NodeMCU-compatible board

Flash it with rom from https://nodemcu-build.com/. Add pwm support, and choose 'float' version.

Flash tools are here https://nodemcu.readthedocs.io/en/master/en/flash/

Get ESPlorer from https://esp8266.ru/esplorer/.

### Installing

Clone this repository, and download submodule.

```
git submodules init
git submodules update
```

## Configuration

edit Board/init.lua with your settings (host and pinout)
Pin notations are for MCU boards, i.e. 1 means D1 label, not GPIO1
```
rpin = 1
bpin = 2
gpin = 5
port = 11337;
host = '192.168.8.14'; -- put your PC ip address here.

ap_ssid,ap_pass = "esp8266","password";
known_fi = {}
known_fi["ssid"]="password"
```

to alter server port settings, see BlocklyWeb/socket.js and main.js

## Deployment

upload Board/init.lua to board with ESPlorer

In BlocklyWeb, do

```
npm install
npm start
```

Open http://localhost:3000/

## Built With

https://developers.google.com/blockly/

http://www.nodemcu.com/index_en.html
