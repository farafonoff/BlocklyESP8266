Blockly.defineBlocksWithJsonArray([{
    "type": "forward",
    "message0": "Вперед %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "time",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 120,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "backward",
    "message0": "Назад %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "time",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "left",
    "message0": "Поворот налево %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "time",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 65,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "right",
    "message0": "Поворот направо %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "time",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 65,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "stuck",
    "message0": "тупик",
    "output": "Boolean",
    "colour": 160,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "nostuck",
    "message0": "не тупик",
    "output": null,
    "colour": 159,
    "tooltip": "",
    "helpUrl": ""
  },
  {
    "type": "walldistance",
    "message0": "Расстояние до стены, см",
    "output": "Number",
    "colour": 290,
    "tooltip": "",
    "helpUrl": ""
  },{
    "type": "stop",
    "message0": "Стоп %1 %2",
    "args0": [
      {
        "type": "input_dummy"
      },
      {
        "type": "input_value",
        "name": "time",
        "check": "Number"
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "",
    "helpUrl": ""
  }]);

  const run_speed = 255;
  const rot_speed = 255;
  const wall_threshold = 20;

  Blockly.Lua['forward'] = function(block) {
    var value_time = Blockly.Lua.valueToCode(block, 'time', Blockly.Lua.ORDER_MULTIPLICATIVE) || 0.01;
    var code = `driveMotors(${run_speed},${run_speed});\n`+
        `coroutine.yield(${value_time}*1000);\n`+
        `driveMotors(0,0);\n`;
    return code;
  };
  
  Blockly.Lua['backward'] = function(block) {
    var value_time = Blockly.Lua.valueToCode(block, 'time', Blockly.Lua.ORDER_MULTIPLICATIVE) || 0.01;
    var code = `driveMotors(-${run_speed},-${run_speed});\n`+
    `coroutine.yield(${value_time}*1000);\n`+
    `driveMotors(0,0);\n`;
    return code;
  };
  
  Blockly.Lua['left'] = function(block) {
    var value_time = Blockly.Lua.valueToCode(block, 'time', Blockly.Lua.ORDER_MULTIPLICATIVE) || 0.1;
    // TODO: Assemble Lua into code variable.
    var code = `driveMotors(-${rot_speed},${rot_speed});\n`+
    `coroutine.yield(${value_time}*1000);\n`+
    `driveMotors(0,0);\n`;
    return code;
  };
  
  Blockly.Lua['right'] = function(block) {
    var value_time = Blockly.Lua.valueToCode(block, 'time', Blockly.Lua.ORDER_MULTIPLICATIVE) || 0.1;
    var code = `driveMotors(${rot_speed},-${rot_speed});\n`+
    `coroutine.yield(${value_time}*1000);\n`+
    `driveMotors(0,0);\n`;
    return code;
  };
  
  Blockly.Lua['stuck'] = function(block) {
    // TODO: Assemble Lua into code variable.
    var code = `last_distance < ${wall_threshold}`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Lua.ORDER_RELATIONAL];
  };
  
  Blockly.Lua['nostuck'] = function(block) {
    // TODO: Assemble Lua into code variable.
    var code = `last_distance >= ${wall_threshold}`;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Lua.ORDER_RELATIONAL];
  };
  
  Blockly.Lua['walldistance'] = function(block) {
    // TODO: Assemble Lua into code variable.
    var code = 'last_distance';
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Lua.ORDER_ATOMIC];
  };

  Blockly.Lua['stop'] = function(block) {
    var value_time = Blockly.Lua.valueToCode(block, 'time', Blockly.Lua.ORDER_ATOMIC) || 0.5;
    // TODO: Assemble Lua into code variable.
    var code = `driveMotors(0,0);\n`+
    `coroutine.yield(${value_time}*1000);\n`;
    return code;
  };