export class CurrencyData {
    constructor({ onXHRLoadCallback }) {
        this._cb = onXHRLoadCallback;
        this._value = null;
    }

    request() {
        let data = this._value;
        const req = new XMLHttpRequest();
        req.onload = () => {
            try {
                data = JSON.parse(req.response);
            }
            catch (error) {
                console.log(error);
            }

            if (Array.isArray(data)) {
                // т.к. в api'шке можно получить либо все монеты, либо только одну
                // вот таким варварским способом получаем только топ-10 из всех
                data = data.slice(0, 10);
            }

            this._value = data;
            this._cb(data);
        };
        req.open("get", "https://api.coinpaprika.com/v1/ticker");
        req.send();
    }
}