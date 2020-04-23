export class CurrencyData {
    constructor({ onXHRLoadCallback }) {
        this._cb = onXHRLoadCallback;
        this.value = null;
    }

    get() {
        let data = this.value;
        const req = new XMLHttpRequest();
        req.onload = () => {
            try {
                data = JSON.parse(req.response);
            }
            catch (error) {
                console.log(error);
            }

            if (Array.isArray(data)) {
                data = data.slice(0, 10);
            }

            this.value = data;
            this._cb(data);
        };
        req.open("get", "/data/coins.json");
        req.send();

        return this.value;
    }
}