dofile('config.lua') --in gitignore

if (udpsocket~=nil) then
    udpsocket:close()
end
function initPWM(id)
    gpio.mode(id,gpio.OUTPUT);gpio.write(id,gpio.LOW);
    if (pwm~=nil) then
        pwm.setup(id,1000,1023);--PWM 1KHz, Duty 1023
        pwm.start(id);
        pwm.setduty(id,0);
    end
end

function setPWM(id, duty) 
    if (pwm~=nil) then
        pwm.setduty(id, duty/255*1023)
    else
        gpio.write(id, duty>127 and gpio.HIGH or gpio.LOW)
    end
end

--dofile('colors.lua')
dofile('car.lua')

function retry_run(wait)
        local mytimer = tmr.create()
        mytimer:register(wait, tmr.ALARM_SINGLE, 
            function (t)
                t:unregister()
                try_run()
            end)
        mytimer:start()    
end

function continue_run()
    if (koroutine == nil) then
        return
    end
    local res, delay = coroutine.resume(koroutine)
    if (res == false or delay == nil) then
        retry_run(100)
        return
    end
    if (delay>0) then
        local mytimer = tmr.create()
        local my_coroutine = koroutine
        mytimer:register(delay, tmr.ALARM_SINGLE, 
            function (t)
                t:unregister()
                if (my_coroutine==koroutine) then
                    continue_run()
                end
            end)
        mytimer:start()
    else
        node.task.post(0, function()
            continue_run()            
        end)    
    end
end

function try_run() 
    local f = loadfile('input.lua')
    if (f) then
        koroutine = coroutine.create(f)
        continue_run()
    else
        retry_run(1000)
    end
end

retry_run(1000);

print('HEAP:',node.heap())

if (file.open('wificonf') == true)then
   ssid = string.gsub(file.readline(), "\n", "");
   pass = string.gsub(file.readline(), "\n", "");
   file.close();
end

wifi.setmode(wifi.STATION)
--wifi.sta.config {ssid=ssid,pwd=pass}
--wifi.sta.autoconnect(1);
selected_config = nil

function car_run()
    if (socket ~=nil) then
        socket.on('disconnection',nil)
        socket.close()
    end
    socket = nil
    init_connection(host, 11337);
end

function init_connection(host, port)
    socket = net.createConnection(net.TCP, 0);
    print('connecting..')
    socket:on("connection", function (sock, c)
        print('connected to hub')
        local mac = wifi.sta.getmac();
        sock:send("mac="..mac.."\n")
    end)
    local buffer = nil
    socket:on("receive", function (sock, c)
        if buffer == nil then
            buffer = c
        else
            buffer = buffer .. c
        end
        s,e = string.find(buffer, '==END==')
        print('got new program')
        if (s~=nil) then
            ss = string.sub(buffer, 1, s-1)
            buffer = string.sub(buffer, e + 1)
            if (file.open("input.lua", "w+")) then
                file.write(ss)
                file.close()
                retry_run(100);
            end            
        end
    end)
    socket:on('disconnection', function(err)
        print('reconnecting to hub')
        socket = nil
        tmr.alarm(0,500,0,function() 
            init_connection(host, port)
        end)
    end)
    socket:connect(port, host);    
end

function run_softap()
        print("hotspot not found, running softap")
        wifi.setmode(wifi.SOFTAP)
        wifi.ap.config{ssid=ap_ssid, pwd=ap_pass}
        tmr.alarm(0,200,0,car_run)
end

wifi.sta.getap(1, function(t)
    print("\n\t\t\tSSID\t\t\t\t\tBSSID\t\t\t  RSSI\t\tAUTHMODE\t\tCHANNEL")
    for bssid,v in pairs(t) do
        local ssid, rssi, authmode, channel = string.match(v, "([^,]+),([^,]+),([^,]+),([^,]*)")
        print(string.format("%32s",ssid).."\t"..bssid.."\t  "..rssi.."\t\t"..authmode.."\t\t\t"..channel)
        if known_fi[ssid] then
            selected_config = {ssid=ssid,pwd=known_fi[ssid]}
        end
    end
    if selected_config then
        wifi.sta.autoconnect(1);
        wifi.sta.config(selected_config)
        wifi.eventmon.register(wifi.eventmon.STA_GOT_IP, function(T)
            print("\n\tSTA - GOT IP".."\n\tStation IP: "..T.IP.."\n\tSubnet mask: "..
                T.netmask.."\n\tGateway IP: "..T.gateway)
            tmr.alarm(0,50,0,car_run)
        end)
    else
        tmr.alarm(0,200,0,run_softap)
    end
end)
