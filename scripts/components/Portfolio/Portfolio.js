export class Portfolio {
    constructor({
        element,
        precision,
        balance,
        onRowClick
    }) {
        this._el = element;
        this._onRowClickCallback = onRowClick;
        this._animateClasses = ["blink", "value-raised", "value-fallen"];

        this._amountSymbol = Symbol("amount");
        this._rowSymbol = Symbol("row");

        this._PRECISION = precision;

        this._balance = balance;
        this._worth = 0;
        this._currentItems = {};

        this._render();
    }

    getBalance() {
        return this._balance;
    }

    add(item, amount) {
        const currentItems = this._currentItems;
        let isItemNew;

        if (!currentItems[item.id]) {
            isItemNew = true;

            currentItems[item.id] = {
                ...item,
                [this._amountSymbol]: amount,
            };
        }
        else {
            isItemNew = false;

            Object.assign(currentItems[item.id], item);
            currentItems[item.id][this._amountSymbol] += amount;
        }

        let total = 0;
        for (const currencyId in currentItems) {
            const currentItem = currentItems[currencyId];
            const isRespectiveItem = currencyId === item.id;
            const itemTotal = currentItem.price_usd * currentItem[this._amountSymbol];

            if (isRespectiveItem) {
                const row = isItemNew
                    ? this._innerEls.tbody.insertRow(-1)
                    : currentItem[this._rowSymbol];

                const itemTotalFormatted = this._formatPrice(itemTotal);
                const itemPriceFormatted = this._formatPrice(currentItem.price_usd);

                if (isItemNew) {
                    row.dataset.currencyId = currentItem.id;
                    row.innerHTML = `
                        <td>${currentItem.name}</td>
                        <td>${currentItem[this._amountSymbol]}</td>
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

        this._isBodyRendered = true;
    }

    remove(item, amount) {
        const respectiveItem = this._currentItems[item.id];
        const row = respectiveItem[this._rowSymbol];

        if (respectiveItem[this._amountSymbol] === amount) {
            row.remove();
            delete this._currentItems[item.id];
            this._innerEls.portfolio.classList.add("blink");
        }
        else {
            respectiveItem[this._amountSymbol] -= amount;
            const itemTotal = item.price_usd * respectiveItem[this._amountSymbol];

            row.children[1].textContent = respectiveItem[this._amountSymbol];
            row.lastElementChild.textContent = this._formatPrice(itemTotal);

            row.classList.add("blink");
            row.children[1].classList.add("value-fallen");
            row.lastElementChild.classList.add("value-fallen");
        }

        const sellPrice = item.price_usd * amount;

        this._balance += sellPrice;
        this._worth -= sellPrice;

        if (Object.values(this._currentItems).length === 0) {
            this._worth = 0;
        }

        this._innerEls.balance.textContent = `$${this._formatPrice(this._balance)}`;
        this._innerEls.balance.classList.add("value-raised");
        this._innerEls.worth.textContent = `$${this._formatPrice(this._worth)}`;
        this._innerEls.worth.classList.add("value-fallen");
    }

    updateData(data) {
        if (!data) {
            return;
        }

        if (this._isBodyRendered) {
            this._updateBodyData(data);
        }
    }

    _onRowClick(event) {
        const target = event.target.closest("tr");
        let targetCurrencyId;

        if (target === null || !(targetCurrencyId = target.dataset.currencyId)) {
            return;
        }

        this._onRowClickCallback(targetCurrencyId, this._currentItems[targetCurrencyId][this._amountSymbol]);
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

        this._el.addEventListener("click", this._onRowClick.bind(this));

        M.Collapsible.init(this._el.querySelectorAll('.collapsible'));

        this._innerEls = {
            portfolio:  this._el.querySelector(".portfolio"),
            balance:    this._el.querySelector(".portfolio__balance"),
            worth:      this._el.querySelector(".portfolio__worth"),
            tbody:      this._el.querySelector("tbody"),
        };

        this._isBodyRendered = false;
    }

    _updateBodyData(data) {
        let hasDataUpdated = false;
        let worthUpdated = 0;

        data.forEach(item => {
            const renderedItem = this._currentItems[item.id];

            if (!renderedItem) {
                return;
            }

            let diff = item.price_usd - renderedItem.price_usd;
            worthUpdated += item.price_usd * renderedItem[this._amountSymbol];
            if (diff !== 0) {
                hasDataUpdated = true;

                const row = renderedItem[this._rowSymbol];

                row.children[2].textContent = this._formatPrice(item.price_usd);
                row.classList.add("blink");
                row.children[2].classList.add(diff > 0 ? "value-raised" : "value-fallen");

                row.lastElementChild.textContent = this._formatPrice(renderedItem[this._amountSymbol] * item.price_usd);

                Object.assign(renderedItem, item);
            }
        });

        if (hasDataUpdated) {
            let diff = worthUpdated - this._worth;

            if (diff !== 0) {
                this._worth = worthUpdated;

                this._innerEls.portfolio.classList.add("blink");
                this._innerEls.worth.textContent = `$${this._formatPrice(worthUpdated)}`;
                this._innerEls.worth.classList.add(diff > 0 ? "value-raised" : "value-fallen");
            }
        }
    }

    _formatPrice(num) {
        return Number(num).toFixed(this._PRECISION);
    }
}
