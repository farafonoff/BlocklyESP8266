for count = 1, 10 do 
coroutine.yield(0);
  while last_distance >= 20 do 
coroutine.yield(0);
    driveMotors(255,255);
    coroutine.yield(0.01*1000);
    driveMotors(0,0);
    if last_distance < 50 then
      driveMotors(0,0);
      coroutine.yield(0.1*1000);
    end
  end
  driveMotors(-255,255);
  coroutine.yield(0.1*1000);
  driveMotors(0,0);
  driveMotors(0,0);
  coroutine.yield(0.5*1000);
end

driveMotors(0,0);
coroutine.yield(0.5*1000);