FILE=/root/BlocklyESP8266/BlocklyWeb/climate.rrd
WEB=/share/climate
rrdtool graph $WEB/'graphco2.png' \
--width '400' \
--height '100' \
--start end-1800s \
"DEF:co2=$FILE:co2:AVERAGE" \
"DEF:co2min=$FILE:co2:MIN" \
"DEF:co2max=$FILE:co2:MAX" \
'LINE1:co2#000000:"co2"' \
'LINE1:co2min#00FFFF:"co2 - minimum"' \
'LINE1:co2max#00FF00:"co2 - maximum"' \


rrdtool graph $WEB/'graphco2h.png' \
--width '400' \
--height '100' \
--start end-21600s \
"DEF:co2=$FILE:co2:AVERAGE" \
"DEF:co2min=$FILE:co2:MIN" \
"DEF:co2max=$FILE:co2:MAX" \
'LINE1:co2#000000:"co2"' \
'LINE1:co2min#00FFFF:"co2 - minimum"' \
'LINE1:co2max#00FF00:"co2 - maximum"' \


rrdtool graph $WEB/'graphtemp.png' \
--width '400' \
--height '100' \
--start end-1800s \
"DEF:temp=$FILE:temperature:AVERAGE" \
"DEF:tempmin=$FILE:temperature:MIN" \
"DEF:tempmax=$FILE:temperature:MAX" \
'LINE1:temp#000000:"temperature"' \
'LINE1:tempmin#FF00FF:"temperature - minimum"' \
'LINE1:tempmax#FF0000:"temperature - maximum"'

rrdtool graph $WEB/'graphco2l.png' \
--width '400' \
--height '100' \
--start end-1d \
"DEF:co2=$FILE:co2:AVERAGE" \
"DEF:co2min=$FILE:co2:MIN" \
"DEF:co2max=$FILE:co2:MAX" \
'LINE1:co2#000000:"co2"' \
'LINE1:co2min#00FFFF:"co2 - minimum"' \
'LINE1:co2max#00FF00:"co2 - maximum"' \

rrdtool graph $WEB/'graphtempl.png' \
--width '400' \
--height '100' \
--start end-1d \
"DEF:temp=$FILE:temperature:AVERAGE" \
"DEF:tempmin=$FILE:temperature:MIN" \
"DEF:tempmax=$FILE:temperature:MAX" \
'LINE1:temp#000000:"temperature"' \
'LINE1:tempmin#FF00FF:"temperature - minimum"' \
'LINE1:tempmax#FF0000:"temperature - maximum"'

