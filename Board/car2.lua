ang_offset=-20
function position(deg)
    local d1g = 0.00027
    pwm.setduty(6, 1024*(0.075+d1g*(ang_offset+deg)))
end


function initMotors()
    gpio.mode(0,gpio.OUTPUT);--LED Light on
    gpio.write(0,gpio.LOW);
    gpio.mode(3,gpio.OUTPUT);
    gpio.mode(4,gpio.OUTPUT);
    gpio.write(3, gpio.LOW);
    gpio.write(4, gpio.LOW);
    initPWM(1)
    initPWM(2)
    pwm.setup(6, 50, 1024*0.075)
    pwm.start(6)
    position(0)
end

initMotors();

function controlMotor(pin, v)
    if (v<0) then
        gpio.write(pin, gpio.LOW);
        v = -v;
    else
        gpio.write(pin, gpio.HIGH);            
    end
    setPWM(pin-2, v)    
end

function die() 
    position(0)
    controlMotor(3,0)
    controlMotor(4,0)
end
