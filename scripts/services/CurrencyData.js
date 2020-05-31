export class CurrencyData {
    constructor() {
        this._value = null;
    }

    fetch() {
        return fetch("https://api.coinpaprika.com/v1/ticker")
            .then(response => response.json())
            // т.к. в api'шке можно получить либо все монеты, либо только одну
            // вот таким варварским способом получаем только топ-10 из всех
            .then(data => this._value = data.slice(0, 10))
            .catch(() => this._value);
    }
}