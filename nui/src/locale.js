class LocaleManager {
    constructor() {
        this.data = {};
        this.currentLanguage = 'en';
    }


    load(localeData, language = 'en') {
        this.data = localeData;
        this.currentLanguage = language;
    }

    get(key, ...args) {
        if (!this.data) {
            return key;
        }

        const keys = key.split('.');
        let value = this.data;

        for (const k of keys) {
            if (typeof value === 'object' && value !== null && value.hasOwnProperty(k)) {
                value = value[k];
            } else {
                return key; 
            }
        }

        if (typeof value === 'string') {
            if (args.length > 0) {
                return value.replace(/%s/g, () => args.shift() || '');
            }
            return value;
        }

        return key;
    }

    _(key, ...args) {
        return this.get(key, ...args);
    }
}

const locale = new LocaleManager();

export { LocaleManager };
export default locale;

window._ = (key, ...args) => locale.get(key, ...args);