function listen_udp(port)
    udpSocket = net.createUDPSocket()
    udpSocket:listen(port)
    udpSocket:on("receive", function(s, data, port, ip)
        if data ~= "discover" then
            processJsonString(data)
            print(last_distance)
            udpSocket:send(port, ip, string.format("distance:%f",last_distance));
        else
            print(string.format("discover: %s:%d", ip, port))    
            udpSocket:send(port, ip, data);
        end 
    end)
    port, ip = udpSocket:getaddr()
    print(string.format("local UDP socket address / port: %s:%d", ip, port))
end
