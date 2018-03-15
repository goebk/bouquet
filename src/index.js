const Factory = require('./factory.js');
const Parser = require('./parser.js');

class Application {
    static run() {
        const factory = new Factory();
        const parser = new Parser({
            'onRule': line => factory.addRule(line),
            'onFlower': line => factory.addFlower(line)
        });

        parser.listen();
    }
}


Application.run();