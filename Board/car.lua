gpio.mode(5, gpio.INT)
gpio.mode(6, gpio.OUTPUT)
gpio.write(6, gpio.LOW)
function distance()
    --262 -- magic number when my sensors starts HIGH pulse
    local now = 0;
    gpio.trig(5, "down",function(evt, when)
       print(evt, when, when - now)
       local diff = when - now - 262;
       local dist = diff / 58
       print(evt, when, now, when - now, dist)
    end)
    gpio.write(6,gpio.HIGH);
    tmr.delay(10);
    gpio.write(6,gpio.LOW);
    now = tmr.now()
end

function initMotors()
    gpio.mode(0,gpio.OUTPUT);--LED Light on
    gpio.write(0,gpio.LOW);
    gpio.mode(1,gpio.OUTPUT);
    gpio.mode(2,gpio.OUTPUT);
    gpio.write(1, gpio.LOW);
    gpio.write(2, gpio.LOW);
    initPWM(3)
    initPWM(4)
end

initMotors();

function controlMotor(pin, v)
    if (v<0) then
        gpio.write(pin, gpio.LOW);
        v = -v;
    else
        gpio.write(pin, gpio.HIGH);            
    end
    duty = math.floor((v/255)*1023);
    pwm.setduty(pin-2, duty)    
end

function driveMotors(rm, lm) 
    controlMotor(3, r);
    controlMotor(4, l);    
end
