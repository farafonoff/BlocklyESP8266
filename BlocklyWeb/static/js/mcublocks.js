Blockly.defineBlocksWithJsonArray([
    {
        "type": "set_color",
        "message0": "цвет %1",
        "args0": [
            {
                "type": "input_value",
                "name": "Color",
                "check": "Colour"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "set color",
        "helpUrl": "set color"
    }, {
        "type": "sleep",
        "message0": "ждать %1",
        "args0": [
            {
                "type": "input_value",
                "name": "duration",
                "check": "Number"
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "",
        "helpUrl": ""
    }
])

Blockly.Lua['set_color'] = function (block) {
    var parseColor = Blockly.Lua.provideFunction_(
        'set_colour_rgb',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(s)',
            '  local rs,gs,bs = s.match(s, "#(..)(..)(..)");',
            '  setColor(tonumber(rs, 16),tonumber(gs, 16),tonumber(bs, 16));',
            'end']);
    var value_color = Blockly.Lua.valueToCode(block, 'Color', Blockly.Lua.ORDER_ATOMIC);
    var code = `set_colour_rgb(${value_color})\n`;
    return code;
};

Blockly.Lua['sleep'] = function (block) {
    var value_duration = Blockly.Lua.valueToCode(block, 'duration', Blockly.Lua.ORDER_ATOMIC);
    var code = `coroutine.yield(${value_duration * 1000})\n`;
    return code;
};

function MCUPostProcessLua(code) {
    return code.replace(/ do[ ]?\n/, ' do \ncoroutine.yield(0);\n');
}