module.exports = class Storage {
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
};