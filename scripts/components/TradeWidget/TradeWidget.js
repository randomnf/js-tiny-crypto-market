export class TradeWidget {
    constructor({
        element,
        precision,
        onBuy,
        onSell
    }) {
        this._el = element;

        this._PRECISION = precision;
        this._INPUT_MIN = 10 ** -(precision ** 3);

        this._onBuyCallback = onBuy;
        this._onSellCallback = onSell;
        this._render();
    }

    buy({ item, balance }) {
        this._isBuyingCtx = true;

        this._currentItem = item;
        this._balance = balance;

        this._show();
    }

    sell({ item, itemAmount }) {
        this._isBuyingCtx = false;

        this._currentItem = item;
        this._itemAmount = itemAmount;

        this._show();
    }

    close() {
        this._resetState();
        this._modal.close();
    }

    _show() {
        const isBuyingCtx = this._isBuyingCtx;
        const inner = this._innerEls;

        inner.titleText     .textContent = isBuyingCtx ? "Buying" : "Selling";
        inner.titleItem     .textContent = this._currentItem.name;
        inner.currentPrice  .textContent = this._formatPrice(this._currentItem.price_usd);
        inner.tradeText     .textContent = isBuyingCtx ? "Current balance" : "Current amount";
        inner.tradeValue    .textContent = isBuyingCtx ? this._balance : this._itemAmount;
        inner.tradeAllText  .textContent = isBuyingCtx ? "Buy" : "Sell";
        inner.submitBtn     .textContent = isBuyingCtx ? "Buy" : "Sell";

        this._wasFormTouched = false;
        this._updateAmount();

        this._modal.open();
    }

    _updateAmount(amount = 0) {
        this._amount = amount;
        this._total = this._currentItem.price_usd * amount;
        this._innerEls.total.textContent = this._formatPrice(this._total);

        if (this._wasFormTouched) {
            this._reportAmountError();
        }
    }

    _reportAmountError() {
        const isBuyingCtx = this._isBuyingCtx;

        let amountOverflow;
        let amountZero;

        if (isBuyingCtx) {
            amountOverflow = this._total > this._balance;
            amountZero =     this._amount === 0;
        }
        else {
            amountOverflow = this._amount > this._itemAmount;
            amountZero =     this._amount === 0;
        }

        this._isAmountError = amountOverflow || amountZero;

        let errorMsg = "";
        if (this._isAmountError) {
            if (amountZero) {
                errorMsg = `Please enter amount of currency you want to ${isBuyingCtx ? "buy" : "sell"}.`;
            }
            else {
                errorMsg = isBuyingCtx
                    ? "Total sum is more than yor balance."
                    : "Amount of currency entered is more than you have.";
            }
        }

        this._innerEls.amountInp.classList.toggle("invalid", this._isAmountError);

        this._innerEls.formFeedback.classList.toggle("error", this._isAmountError);
        this._innerEls.formFeedback.textContent = errorMsg;

        this._innerEls.submitBtn.disabled = this._isAmountError;

        return !this._isAmountError;
    }

    _reportValidity() {
        return this._reportAmountError() && this._innerEls.form.checkValidity();
    }

    _resetState() {
        this._isAmountError = false;

        this._innerEls.amountInp.value = "";
        this._innerEls.amountInp.classList.remove("invalid");
        this._innerEls.amountLabel.classList.remove("active");
        this._innerEls.formFeedback.textContent = "";
        this._innerEls.formFeedback.classList.remove("error");
    }

    _render() {
        this._el.innerHTML = `
            <div class="widget modal" id="modal">
                <div class="modal-content">
                    <h4><span class="widget__context-text"></span> <span class="widget__title"></span>:</h4>
                    <table class="trade-table">
                        <col class="trade-table__col">
                        <col class="trade-table__col">
                        <col class="trade-table__col">
                        <thead>
                            <th>Current price</th>
                            <th>Total</th>
                            <th class="widget__trade-context-text"></th>
                        </thead>
                        <tbody>
                            <td class="widget__current-price"></td>
                            <td class="widget__total"></td>
                            <td class="widget__trade-context-value"></td>
                        </tbody>
                    </table>
                    <div class="row modal__inner">
                        <form class="trade-form col s12" id="trade-form" action="/" method="post">
                            <div class="input-field col s4 trade-form__inner">
                                <input class="widget__amount-inp" id="amount" type="number" min="${this._INPUT_MIN}" step="any" required>
                                <label class="amount-label" for="amount">Amount</label>
                            </div>
                            <button class="input-field col s3 waves-effect waves-teal btn-flat widget__trade-all-btn" type="button"><span class="widget__trade-all-text"></span> all</button>
                            <div class="widget__form-feedback"></div>
                        </form>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="waves-effect waves-teal btn-flat widget__submit-btn" form="trade-form" type="submit"></button>
                    <button class="modal-close waves-effect waves-teal btn-flat widget__close-btn" type="button" data-target="modal">Cancel</button>
                </div>
            </div>
        `;

        this._innerEls = {
            modal:          this._el.firstElementChild,
            closeBtn:       this._el.querySelector(".widget__close-btn"),

            form:           this._el.querySelector(".trade-form"),
            amountInp:      this._el.querySelector(".widget__amount-inp"),
            amountLabel:    this._el.querySelector(".amount-label"),
            submitBtn:      this._el.querySelector(".widget__submit-btn"),
            formFeedback:   this._el.querySelector(".widget__form-feedback"),

            titleText:      this._el.querySelector(".widget__context-text"),
            titleItem:      this._el.querySelector(".widget__title"),
            tradeText:      this._el.querySelector(".widget__trade-context-text"),
            tradeAllText:   this._el.querySelector(".widget__trade-all-text"),

            tradeAllBtn:    this._el.querySelector(".widget__trade-all-btn"),
            currentPrice:   this._el.querySelector(".widget__current-price"),
            total:          this._el.querySelector(".widget__total"),
            tradeValue:     this._el.querySelector(".widget__trade-context-value"),
        };

        this._modal = M.Modal.init(this._innerEls.modal);

        this._el.addEventListener("input", event => {
            this._wasFormTouched = true;

            const value = +event.target.value;
            this._updateAmount(value);
        });

        this._el.addEventListener("click", event => {
            const isTradeAllBtn = event.target.closest(".widget__trade-all-btn");
            const isCloseBtn = event.target === this._innerEls.closeBtn;

            if (isTradeAllBtn) {
                let inputValue;

                if (this._isBuyingCtx) {
                    inputValue = this._balance / this._currentItem.price_usd;
                }
                else {
                    inputValue = this._itemAmount;
                }

                const input = this._innerEls.amountInp;

                input.value = inputValue;
                input.focus();
                input.dispatchEvent(new Event("input", { bubbles: true }));
            }

            if (isCloseBtn) {
                this.close();
            }
        });

        this._innerEls.form.addEventListener("submit", event => {
            this._onSubmitHandler(event);
        });

        this._isBuyingCtx = true;
    }

    _onSubmitHandler(event) {
        event.preventDefault();

        this._wasFormTouched = true;

        if (this._reportValidity()) {
            if (this._isBuyingCtx) {
                this._onBuyCallback(this._currentItem.id, this._amount);
            }
            else {
                this._onSellCallback(this._currentItem.id, this._amount);
            }

            this.close();
        }
    }

    _formatPrice(num) {
        return Number(num).toFixed(this._PRECISION);
    }
}