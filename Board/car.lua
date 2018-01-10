function initMotors()
    gpio.mode(0,gpio.OUTPUT);--LED Light on
    gpio.write(0,gpio.LOW);
    
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