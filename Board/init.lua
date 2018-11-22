parts = { "app.lua", "colors.lua", "car.lua", "udp.lua", "car2.lua" }
for i,v in ipairs(parts) do 
    if file.exists(v) then
        print("compiling "..v)
        node.compile(v)
        file.remove(v)
    end
end
dofile('config.lua') --in gitignore
dofile("udp.lc")
app = dofile("app.lc")

