function initRGBStrip()
    gpio.mode(0,gpio.OUTPUT);--LED Light on
    gpio.write(0,gpio.LOW);
    
    initPWM(rpin)
    initPWM(gpin)
    initPWM(bpin)
end

initRGBStrip();

function setColor(rv,gv,bv)
    if (pwm~=nil) then
        pwm.setduty(rpin, rv/255*1023)
        pwm.setduty(gpin, gv/255*1023)
        pwm.setduty(bpin, bv/255*1023)
    else
        gpio.write(rpin, rv>127 and gpio.HIGH or gpio.LOW)
        gpio.write(gpin, gv>127 and gpio.HIGH or gpio.LOW)
        gpio.write(bpin, bv>127 and gpio.HIGH or gpio.LOW)
    end
end

function die() 
    setColor(0,0,0)
end
