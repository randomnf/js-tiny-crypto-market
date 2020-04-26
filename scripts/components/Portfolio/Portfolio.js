export class Portfolio {
    constructor({
        element,
        precision,
        balance
    }) {
        this._el = element;
        this._animateClasses = ["blink", "value-raised", "value-fallen"];

        this._amountSymbol = Symbol("amount");
        this._rowSymbol = Symbol("row");

        this._PRECISION = precision;

        this._balance = balance;
        this._worth = 0;
        this._currencyItems = {};

        this._render();
    }

    getBalance() {
        return this._balance;
    }

    add(item, amount) {
        const currentItems = this._currencyItems;
        let isItemNew;

        if (!currentItems[item.id]) {
            isItemNew = true;

            currentItems[item.id] = item;
            currentItems[item.id][this._amountSymbol] = amount;
        }
        else {
            isItemNew = false;

            Object.assign(currentItems[item.id], item);
            currentItems[item.id][this._amountSymbol] += amount;
        }

        let total = 0;
        for (let currencyId in currentItems) {
            const currentItem = currentItems[currencyId];
            const isRespectiveItem = currentItem === item;
            const itemTotal = currentItem.price_usd * currentItem[this._amountSymbol];

            if (isRespectiveItem) {
                const row = isItemNew
                    ? this._innerEls.tbody.insertRow(-1)
                    : currentItem[this._rowSymbol];

                const itemTotalFormatted = this._formatPrice(itemTotal);
                const itemPriceFormatted = this._formatPrice(item.price_usd);

                if (isItemNew) {
                    row.dataset.currencyId = item.id;
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item[this._amountSymbol]}</td>
                        <td>${itemPriceFormatted}</td>
                        <td>${itemTotalFormatted}</td>
                    `;

                    currentItem[this._rowSymbol] = row;
                }
                else {
                    row.children[1].textContent = currentItem[this._amountSymbol].toFixed(this._PRECISION);
                    row.children[2].textContent = itemPriceFormatted;
                    row.children[3].textContent = itemTotalFormatted;

                    row.classList.add("blink");
                    row.children[1].classList.add("value-raised");
                }
            }

            total += itemTotal;
        }
        this._worth = total;
        this._balance -= item.price_usd * amount;

        this._innerEls.balance.textContent = `$${this._formatPrice(this._balance)}`;
        this._innerEls.worth.textContent = `$${this._formatPrice(this._worth)}`;
        this._innerEls.balance.classList.add("value-fallen");
        this._innerEls.worth.classList.add("value-raised");
    }

    _render() {
        this._el.innerHTML = `
            <ul class="collapsible portfolio">
                <li>
                    <p class="collapsible-header portfolio__header">
                        <span class="portfolio__col">Current balance:&nbsp;<b class="portfolio__balance">$${this._balance}</b></span>
                        <span class="portfolio__col">Portfolio Worth:&nbsp;<b class="portfolio__worth">$${this._worth}</b></span>
                    </p>
                    <div class="collapsible-body">
                        <table class="highlight">
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

        this._el.addEventListener("animationend", event => {
            this._animateClasses.forEach(cssClass => {
                event.target.classList.remove(cssClass);
            });
        });

        M.Collapsible.init(this._el.querySelectorAll('.collapsible'));

        this._innerEls = {
            balance:    this._el.querySelector(".portfolio__balance"),
            worth:      this._el.querySelector(".portfolio__worth"),
            tbody:      this._el.querySelector("tbody"),
        };
    }

    _formatPrice(num) {
        return Number(num).toFixed(this._PRECISION);
    }
}
