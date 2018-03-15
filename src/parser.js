const readline = require('readline');

module.exports = class Parser {
    constructor(listener) {
        this.listener = listener;
        this.state = 'rule';
    }

    listen() {
        const rlInterface = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        rlInterface.on('line', line => {
            if (line == '') {
                this.state = 'flower';
                return;
            }

            if (this.state == 'rule') {
                this.listener.onRule(line);
                return;
            }

            if (this.state == 'flower') {
                this.listener.onFlower(line);
                return;
            }
        });
    }
};