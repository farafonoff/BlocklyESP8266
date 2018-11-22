pwm.setup(1, 50, 1024*0.075)
pwm.start(1)

function position(deg)
    local d1g = 0.00027
    pwm.setduty(1, 1024*(0.075+d1g*deg))
end

