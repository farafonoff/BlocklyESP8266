function sendData(t,c)
    local msg=('{ "type": "carbon", "temp": '..t..', "carbon": '..c..'}\n')
    print(msg)
    hubSocket:send(msg)
end