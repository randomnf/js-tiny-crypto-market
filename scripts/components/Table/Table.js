export class Table {
    constructor({ element, onRowClick }) {
        this._el = element;
        this._render();
        this._onRowClickCallback = onRowClick;
    }

    updateData(data) {
        if (data) {
            this._tableEl.tBodies[0].innerHTML = `
                ${data.map(item => `
                    <tr data-currency="${item.symbol}">
                        <td>${item.name}</td>
                        <td>${item.symbol}</td>
                        <td>${item.rank}</td>
                        <td>${item.price_usd}</td>
                    </tr>
                `).join("")}
            `;
        }
    }

    _onRowClick = event => {
        const target = event.target.closest("tr");
        let targetCurrencySymbol;

        if (target === null || !(targetCurrencySymbol = target.dataset.currency)) {
            return;
        }

        this._onRowClickCallback(targetCurrencySymbol);
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
    }
}