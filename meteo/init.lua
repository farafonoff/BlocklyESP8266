parts = { "app.lua", "meteo.lua" }
for i,v in ipairs(parts) do 
    if file.exists(v) then
        print("compiling "..v)
        node.compile(v)
        file.remove(v)
    end
end
dofile('config.lua') --in gitignore
app = dofile("app.lc")
  
