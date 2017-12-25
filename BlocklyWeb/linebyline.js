const { Writable } = require('stream');

module.exports.linebyline = () => {
    return new Writable({
        write(chunk, encoding, callback) {
            this.stringbuffer = this.stringbuffer || "";
            this.stringbuffer += chunk.toString('ascii');
            let index = this.stringbuffer.indexOf('\n');
            if (index != -1) {
                let out = this.stringbuffer.substr(0, index);
                this.emit('line', out);
                this.stringbuffer = this.stringbuffer.substr(index + 1)
            }
        }
    });
}

