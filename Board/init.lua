parts = { "json.lua", "app.lua", "colors.lua", "car.lua" }
for i,v in ipairs(parts) do 
    if file.exists(v) then
        print("compiling "..v)
        node.compile(v)
        file.remove(v)
    end
end
dofile('config.lua') --in gitignore
json = dofile("json.lc")
app = dofile("app.lc")
  
