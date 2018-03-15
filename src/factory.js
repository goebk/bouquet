const Storage = require('./storage.js');
const Rule = require('./rule.js');

module.exports = class Factory {
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

};