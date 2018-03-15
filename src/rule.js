const Storage = require('./storage.js');

module.exports = class Rule {
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
};