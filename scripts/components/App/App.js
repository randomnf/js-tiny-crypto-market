import { CurrencyData } from "../../services/CurrencyData.js";
import { Table } from "../Table/Table.js";
import { Portfolio } from "../Portfolio/Portfolio.js";
import { TradeWidget } from "../TradeWidget/TradeWidget.js";

export class App {
    constructor({ element }) {
        this._el = element;
        this._currencyFormatted = {};
        this._getData();
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
            <div class="row portfolio-row">
                <div class="col s6 offset-s6 portfolio"></div>
            </div>
            <div class="row">
                <div class="col s12 table-wrap"></div>
            </div>
            <div class="trade-widget"></div>
        `;
    }

    _initTable() {
        this._table = new Table({
            element: this._el.querySelector(".table-wrap"),
            onRowClick: currencySymbol => {
                this._tradeWidget.trade({
                    item: this._currencyFormatted[currencySymbol],
                    balance: this._portfolio.getBalance()
                });
            }
        });
    }

    _initPortfolio() {
        this._portfolio = new Portfolio({
            element: this._el.querySelector(".portfolio"),
            balance: 10000
        });
    }

    _initTradeWidget() {
        this._tradeWidget = new TradeWidget({
            element: this._el.querySelector(".trade-widget"),
            onBuy: (item, amount) => {
                this._portfolio.add(item, amount);
            },
        });
    }

    _onDataUpdate(data) {
        this._table.updateData(data);
        this._formatData(data);
    }

    _getData() {
        this._currencyGetter = new CurrencyData({
            onXHRLoadCallback: (data) => this._onDataUpdate(data)
        });
        this._currencyGetter.get();
        this._updateInterval = setInterval(() => this._currencyGetter.get(), 30000);
    }

    _formatData(data) {
        if (data === null) {
            return;
        }

        const formatted = {};
        data.forEach(item => {
            formatted[item.symbol] = item;
        });

        this._currencyFormatted = formatted;
    }
}
