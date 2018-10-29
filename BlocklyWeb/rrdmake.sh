rrdtool create climate.rrd \
--step '10' \
'DS:co2:GAUGE:30:0:5000' \
'DS:temperature:GAUGE:30:0:100' \
'RRA:AVERAGE:0.5:2:1000' \
'RRA:MIN:0.5:30:100000' \
'RRA:MAX:0.5:30:100000'

