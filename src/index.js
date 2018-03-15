const readline = require('readline');

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

class Parser {
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


class Rule {
    /// Rule definition string like : 'CL20a15c33'
    constructor(definition, storage) {
        this.type = definition.charAt(0);
        this.size = definition.charAt(1);

        // The requirements of a bouquet is represented by a map, eg.: { 'aL': 20, 'cL': 15 }
        this.requirements = new Storage();
        this.requirementsCount = 0;

        // Parse logic
        let numbers = '';
        for (let i = 2; i < definition.length; i++) {
            const c = definition.charAt(i);
            const pRes = parseInt(c, 10);
            if (isNaN(pRes)) {
                // found character: flower definition end
                const n = parseInt(numbers, 10);
                this.requirements.set(c + this.size, n);
                this.requirementsCount += n;
                numbers = '';
            } else {
                numbers += c;
            }
        }

        // Total number of flowers in bouquet
        this.totalCount = parseInt(numbers, 10);
        if (this.totalCount < this.requirementsCount) {
            this.totalCount = this.requirementsCount;
        }
        this.additionalCount = this.totalCount - this.requirementsCount;

        this.storage = storage;
    }

    tryCreate() {
        if (this.checkRequirements() && this.checkAdditional()) {
            // We can make this bouquet!!!!
            // 'used' will contain all of the flowers used for the creation of this bouquet
            // so a copy of the requirements object will be perfect for a start
            // the additional flowers has to be added to this copy-object

            const used = this.requirements.copy();

            var i = this.additionalCount;
            // We need 'i' additional flowers
            while (i != 0) {
                // Get first key which has leftover flowers
                // this logic could be refined, to get flowers which are lot in numbers, or not used at all
                const key = this.storage.keys
                    .filter(k => k[1] == this.size)
                    .filter(k => this.storage.get(k) - used.get(k) > 0)[0]

                const toUseCount = Math.min(i, this.storage.get(key) - used.get(key));
                i -= toUseCount;
                used.incrementBy(key, toUseCount);
            }
            return used;
        }
    }

    checkRequirements() {
        // Check if every requirement is fulfilled.
        for (const flower of this.requirements.keys) {
            if (this.storage.get(flower) < this.requirements.get(flower)) {
                return false;
            }
        }
        return true;
    }

    checkAdditional() {
        // sum all flowers left in storage, which are not in requirements
        const additionalAvailable = this.storage.keys
            .filter(k => k[1] == this.size)
            .map(k => this.storage.get(k) - this.requirements.get(k))
            .reduce((prev, v) => prev + v, 0);

        return this.additionalCount <= additionalAvailable;
    }
}

class Storage {
    constructor() {
        this.internal = {}
        const types = 'abcdefghijklmnopqrstuvwxyz';
        // Zero out storage
        for (let i = 0; i < types.length; i++) {
            this.internal[types.charAt(i) + 'S'] = 0;
            this.internal[types.charAt(i) + 'L'] = 0;
        }
    }

    get keys() {
        return Object.keys(this.internal);
    }

    print() {
        var result = {};
        for (const k in this.internal) {
            if (this.internal[k] > 0) {
                result[k] = this.internal[k];
            }
        }
        console.log(JSON.stringify(result));
    }

    get(key) {
        if (!key in this.keys) {
            throw Error('Key is not found in storage');
        }
        return this.internal[key];
    }

    set(key, value) {
        if (!key in this.keys) {
            throw Error('Key is not found in storage');
        }
        this.internal[key] = value;
    }

    increment(key) {
        if (!key in this.keys) {
            throw Error('Key is not found in storage');
        }
        this.internal[key]++;
    }

    incrementBy(key, value) {
        if (!key in this.keys) {
            throw Error('Key is not found in storage');
        }
        this.internal[key] += value;
    }

    subtractStorage(storage) {
        for (const key of storage.keys) {
            this.internal[key] -= storage.internal[key];
        }
    }

    copy() {
        const s = new Storage();
        s.internal = Object.assign({}, this.internal);
        return s;
    }
}

class Factory {
    constructor() {
        this.rules = [];
        this.storage = new Storage();
    }

    addRule(line) {
        const rule = new Rule(line, this.storage);
        this.rules.push(rule);
    }

    addFlower(flower) {
        this.storage.increment(flower);

        // Check each rule if they can produce a bouquet
        let created;
        for (const rule of this.rules) {
            created = rule.tryCreate();
            if (created) {
                // If it is successful we write it to stdin.
                const flowersStr = created.keys.filter(k => created.get(k) > 0).map(k => created.get(k) + k[0]).join('');
                console.log(`${rule.type}${rule.size}${flowersStr}`);

                this.removeFlowers(created);
                break;
            }
        }
    }

    removeFlowers(flowers) {
        this.storage.subtractStorage(flowers);
    }

}

Application.run();