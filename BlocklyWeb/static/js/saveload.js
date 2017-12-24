function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
function save() {
var xml = Blockly.Xml.workspaceToDom(demoWorkspace);
var xml_text = Blockly.Xml.domToPrettyText(xml);
let d = new Date,
dformat = [d.getMonth()+1,
       d.getDate(),
       d.getFullYear()].join('-')+'-'+
      [d.getHours(),
       d.getMinutes(),
       d.getSeconds()].join('-');
download(`program-${dformat}.xml`, xml_text)
}

function load(event) {
let file = event.target.files[0];
var reader = new FileReader();
reader.onload = (thefile) => {
    let text = thefile.target.result;
    var xml = Blockly.Xml.textToDom(text);
    Blockly.Xml.domToWorkspace(xml, demoWorkspace);
};
reader.readAsText(file);
}
