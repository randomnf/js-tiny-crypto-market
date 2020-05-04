import { CurrencyData } from "../../services/CurrencyData.js";
import { Table } from "../Table/Table.js";
import { Portfolio } from "../Portfolio/Portfolio.js";
import { TradeWidget } from "../TradeWidget/TradeWidget.js";

export class App {
    constructor({ element, precision = 4 }) {
        this._el = element;
        this._PRECISION = Math.trunc(precision);
        this._initDataService();
        this._render();
        this._initTable();
        this._initPortfolio();
        this._initTradeWidget();
    }

    _render() {
        this._el.innerHTML = `
            <div class="row">
                <div class="col s12">
                    <h1>Tiny Crypto Market</h1>
                </div>
            </div>
            <div class="portfolio-wrap"></div>
            <div class="row">
                <div class="col s12 table-wrap"></div>
            </div>
            <div class="trade-widget"></div>
        `;
    }

    _initTable() {
        this._table = new Table({
            element:    this._el.querySelector(".table-wrap"),
            precision:  this._PRECISION,
            onRowClick: currencyId => {
                this._tradeWidget.buy({
                    item: this._currencyData.find(item => currencyId === item.id),
                    balance: this._portfolio.getBalance()
                });
            },
        });
    }

    _initPortfolio() {
        this._portfolio = new Portfolio({
            element:    this._el.querySelector(".portfolio-wrap"),
            precision:  this._PRECISION,
            balance:    1000,
            onRowClick: (currencyId, itemAmount) => {
                this._tradeWidget.sell({
                    item: this._currencyData.find(item => currencyId === item.id),
                    itemAmount,
                });
            },
        });
    }

    _initTradeWidget() {
        this._tradeWidget = new TradeWidget({
            element:    this._el.querySelector(".trade-widget"),
            precision:  this._PRECISION,
            onBuy:      (currencyId, amount) => {
                this._portfolio.add(this._currencyData.find(item => currencyId === item.id), amount);
            },
            onSell:     (currencyId, amount) => {
                this._portfolio.remove(this._currencyData.find(item => currencyId === item.id), amount);
            },
        });
    }

    _initDataService() {
        this._currencyGetter = new CurrencyData({
            onXHRLoad: data => this._onDataUpdate(data)
        });
        this._currencyGetter.request();
        this._updateInterval = setInterval(() => this._currencyGetter.request(), 30000);
    }

    _onDataUpdate(data) {
        if (this._isFatality(data)) {
            clearInterval(this._updateInterval);

            this._el.innerHTML = "New currency detected. App is too weak for dis shet! (author is lazy af)<br>App is dead btw. Расходимся.";

            return;
        }

        this._currencyData = data;
        this._table.updateData(data);
        this._portfolio.updateData(data);

        // TODO
        // удалить "тестовый" код
        // setTimeout(() => {
        //     data[0] = {...data[0]};
        //     data[0].price_usd = 0;
        //     data[2] = {...data[2]};
        //     data[2].price_usd = 10000;
        //     this._table.updateData(data);
        //     this._portfolio.updateData(data);
        // }, 10000);
    }

    // если в данных, пришедших из api'шки присутствует новая монета (поменялся порядок сортировки)
    // ломаем все, ибо мне лень писать доп. логику для всего этого
    _isFatality(data) {
        if (!this._currencyData) {
            this._knownCoins = new Set();
            data.forEach(item => {
                this._knownCoins.add(item.id);
            });

            return false;
        }

        let isFatality = false;
        for (let i = 0; !isFatality && i < data.length; i++) {
            isFatality = !this._knownCoins.has(data[i].id);
        }

        return isFatality;
    }
}
