last_distance = 0;
us_base_delay = 262

function us_ping()
    gpio.write(6,gpio.HIGH);
    tmr.delay(10);
    gpio.write(6,gpio.LOW);
    return tmr.now()
end

function distance()
    --262 -- magic number when my sensors starts HIGH pulse
    local now = 0;
    gpio.trig(5, "down",function(evt, when)
       local diff = when - now - us_base_delay;
       local dist = diff / 58
       last_distance = dist
    end)
    now = us_ping()
end

function stopDistanceTimer()
    if (distance_tmr~=nil) then
        distance_tmr:stop()
        distance_tmr:unregister()
        distance_tmr = nil
    end
end

function runDistanceTimer()
    stopDistanceTimer()
    distance_tmr = tmr.create()
    distance_tmr:register(100, tmr.ALARM_AUTO, function(timer)
        distance()
    end)
    distance_tmr:start()    
end

function calibrate(count)
    local now
    local sum = 0
    local iter = count
    gpio.trig(5, "up",function(evt, when)
       local diff = when - now;
       if (iter>0) then
        sum = sum + diff
       else
        sum = sum + diff
        us_base_delay = sum/count
        print('calibrated us sensor, delay=', us_base_delay)
       end       
    end)
    stopDistanceTimer()
    local calibration_tmr = tmr.create()
    calibration_tmr:register(100, tmr.ALARM_AUTO, function(timer)
      if (iter > 0) then
        iter = iter - 1;
        now = us_ping()
      else
        calibration_tmr:unregister()
        runDistanceTimer()        
      end                
    end)
    calibration_tmr:start()
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
    gpio.mode(5, gpio.INT)
    gpio.mode(6, gpio.OUTPUT)
    gpio.write(6, gpio.LOW)
    calibrate(10)
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

function driveMotors(rm, lm) 
    controlMotor(3, rm);
    controlMotor(4, lm);    
end

function die() 
    driveMotors(0, 0)
end
