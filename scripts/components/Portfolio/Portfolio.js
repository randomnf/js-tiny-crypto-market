export class Portfolio {
    constructor({ element, balance }) {
        this._el = element;
        this._balance = balance;
        this._portfolioWorth = 0;
        this._currencyItems = {};
        this._render();
    }

    getBalance() {
        return this._balance;
    }

    add(item, amount) {
        const items = this._currencyItems;

        if ( !items[item.symbol] ) {
            items[item.symbol] = item;
            items[item.symbol].amount = amount;
        }
        else {
            Object.assign(items[item.symbol], item);
            items[item.symbol].amount += amount;
        }

        let innerHTML = "";

        for (let key in items) {
            let total = items[key].price_usd * items[key].amount;

            this._portfolioWorth += total;

            innerHTML += `
                <tr data-currency="${items[key].symbol}">
                    <td>${items[key].name}</td>
                    <td>${items[key].amount}</td>
                    <td>${items[key].price_usd}</td>
                    <td>${total}</td>
                </tr>
            `;
        }

        this._innerEls.worth.textContent = this._portfolioWorth;
        this._innerEls.tbody.innerHTML = innerHTML;
    }

    _render() {
        this._el.innerHTML = `
            <ul class="collapsible portfolio">
                <li>
                    <p class="collapsible-header">
                        Current balance:&nbsp;<b class="portfolio__balance">$${this._balance}</b>.
                        Portfolio Worth:&nbsp;<b class="portfolio__worth">$${this._portfolioWorth}</b>
                    </p>
                    <div class="collapsible-body">
                        <table class="highlight striped">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Amount</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </li>
            </ul>
        `;

        M.Collapsible.init(this._el.querySelectorAll('.collapsible'));

        this._innerEls = {
            balance:    this._el.querySelector(".portfolio__balance"),
            worth:      this._el.querySelector(".portfolio__balance"),
            tbody:      this._el.querySelector("tbody"),
        };
    }
}
