export class Table {
    constructor({
        element,
        precision,
        onRowClick
    }) {
        this._el = element;
        this._onRowClickCallback = onRowClick;
        this._animateClasses = ["blink", "value-raised", "value-fallen"];

        this._PRECISION = precision;

        this._rowSymbol = Symbol("rowEl");

        this._render();
    }

    updateData(data) {
        if (!data) {
            return;
        }

        if (!this._isBodyRendered) {
            this._renderBody(data);
        }
        else {
            this._updateBodyData(data);
        }
    }

    _onRowClick = event => {
        const target = event.target.closest("tr");
        let targetCurrencyId;

        if (target === null || !(targetCurrencyId = target.dataset.currencyId)) {
            return;
        }

        this._onRowClickCallback(this._currentItems[targetCurrencyId]);
    }

    _render() {
        this._el.innerHTML = `
            <table class="data-table highlight"> 
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Symbol</th>
                        <th>Rank</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        this._tableEl = this._el.firstElementChild;
        this._tableEl.addEventListener("click", this._onRowClick);

        this._tableEl.addEventListener("animationend", event => {
            this._animateClasses.forEach(cssClass => {
                event.target.classList.remove(cssClass);
            });
        });

        this._isBodyRendered = false;
        this._currentItems = {};
    }

    _renderBody(data) {
        const tbody = this._tableEl.tBodies[0];
        tbody.remove();

        data.forEach(item => {
            const row = tbody.insertRow(-1);
            row.dataset.currencyId = item.id;

            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.symbol}</td>
                <td>${item.rank}</td>
                <td>${this._formatPrice(item.price_usd)}</td>
            `;

            this._currentItems[item.id] = item;
            this._currentItems[item.id][this._rowSymbol] = row;
        });

        this._tableEl.append(tbody);
        this._isBodyRendered = true;
    }

    _updateBodyData(data) {
        data.forEach(item => {
            const renderedItem = this._currentItems[item.id];

            let diff = item.price_usd - renderedItem.price_usd;
            if (diff !== 0) {
                const row = renderedItem[this._rowSymbol];

                row.lastElementChild.textContent = this._formatPrice(item.price_usd);
                row.classList.add("blink");
                row.lastElementChild.classList.add(diff > 0 ? "value-raised" : "value-fallen");

                Object.assign(renderedItem, item);
            }
        });
    }

    _formatPrice(num) {
        return Number(num).toFixed(this._PRECISION);
    }
}