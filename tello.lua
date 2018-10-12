-- TELLO-C64DA9
wiok = false
function wconn(table) 
     gpio.write(4,gpio.LOW)
     print(table.IP)
     wiok = true
end
function wdconn()
    gpio.write(4,gpio.HIGH)
    wiok = false
end
config = {
ssid="TELLO-C64DA9",
auto=true,
save=true,
got_ip_cb=wconn,
disconnected_cb=wdconn
}
wifi.sta.config(config)

gpio.mode(4, gpio.OUTPUT)
gpio.mode(1, gpio.INT, gpio.PULLUP)
gpio.mode(2, gpio.INT, gpio.PULLUP)
gpio.mode(3, gpio.INT, gpio.PULLUP)
gpio.trig(1)
gpio.trig(2)
gpio.trig(3)

oldtime = -1

function takeoff()
    sendcmd("takeoff")
end

function land()
    sendcmd("land")
end

function updown(level, when)
    if ((level == 0) and (oldtime == -1)) then
        oldtime = when
    end
    if ((level == 1) and (oldtime > 1)) then
        diff = (when - oldtime)/1000
        if diff > 1000 then 
            takeoff() 
        else
            land()
        end
        oldtime = -1
    end
end
chana = 0 -- left/right
chanb = 0 -- forward/backward
chanc = 0 -- up/down
chand = 0 -- left/right

function kforward(level)
    if level == 0 then
        chanb = 100
    else
        chanb = 0
    end 
    sendrc()
end
function kbackward(level)
    if level == 0 then
        chanb = -100
    else
        chanb = 0
    end
    sendrc()
end
gpio.trig(1, "both", kforward)
gpio.trig(2, "both", updown)
gpio.trig(3, "both", kbackward)
function rescan()
    local sf = gpio.read(1)
    local sb = gpio.read(3)
    if (sf == 1 and sb == 1) then
       chanb = 0
    end
    sendrc()
end

function ulog(s, data, port, ip)
    print(string.format("received '%s' from %s:%d", data, ip, port))
end
function sendcmd(cmd)
if wiok then
            print(cmd)
            ucommand:send(8889, "192.168.10.1", cmd)
end
end
function sendrc()
    rc = string.format("rc %d %d %d %d", chana, chanb, chanc, chand)
    print(rc)
    sendcmd(rc)
end

if (ucommand==nil) then
    ucommand = net.createUDPSocket()
    ucommand:listen(8889)
    ustate = net.createUDPSocket()
    ustate:listen(8890)
    local ping = tmr.create()
    ping:alarm(5000, tmr.ALARM_AUTO, function() 
        sendcmd("command")
    end)
    local keybd = tmr.create()
    keybd:alarm(100, tmr.ALARM_AUTO, rescan)
end

ucommand:on("receive", ulog)
ustate:on("receive", ulog)



