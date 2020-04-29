export class TradeWidget {
    constructor({
        element,
        precision,
        onBuy
    }) {
        this._el = element;
        this._PRECISION = precision;
        this._onBuyCallback = onBuy;
        this._render();
    }

    trade({ item, balance }) {
        this._balance = balance;
        this._currentItem = item;
        this._total = item.price_usd * 0;

        this._modal.open();

        this._wasFormTouched = false;
        this._updateDisplay();
    }

    _updateDisplay() {
        this._updateAmount();
        this._innerEls.title.textContent = this._currentItem.name;
        this._innerEls.currentPrice.textContent = this._currentItem.price_usd;
    }

    _updateAmount(value = 0) {
        this._amount = value;
        this._total = this._currentItem.price_usd * this._amount;
        this._innerEls.total.textContent = this._total;

        if (this._wasFormTouched) {
            this._reportAmountError();
        }
    }

    _reportAmountError() {
        console.log(this._amount)
        const amountOverflow =  this._total > this._balance;
        const amountZero =      this._amount === 0;
        this._isAmountError = amountOverflow || amountZero;

        let errorMsg = "";
        if (this._isAmountError) {
            if (amountZero) {
                errorMsg = "Please enter a value you want to buy.";
            }
            else {
                errorMsg = "Total sum is more than yor balance.";
            }
        }

        this._innerEls.amountInp.classList.toggle("invalid", this._isAmountError);

        this._innerEls.formFeedback.classList.toggle("error", this._isAmountError);
        this._innerEls.formFeedback.textContent = errorMsg;

        this._innerEls.buyBtn.disabled = this._isAmountError;

        return !this._isAmountError;
    }

    _reportValidity() {
        return this._reportAmountError() && this._innerEls.form.checkValidity();
    }

    _clearFormReports() {
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
                    <h4>Buying <span class="widget__title"></span>:</h4>
                    <p>
                        Current price: <b class="widget__current-price"></b>.
                        Total: <b class="widget__total"></b>
                    </p>
                    <div class="row">
                        <form class="buy-form col s12" id="buy-form" action="/" method="post">
                            <div class="input-field col s4 buy-form__inner">
                                <input class="widget__amount-inp" id="amount" type="number" min="0.000000000001" step="0.000000000001" required>
                                <label class="amount-label" for="amount">Amount</label>
                            </div>
                            <div class="widget__form-feedback"></div>
                        </form>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="waves-effect waves-teal btn-flat widget__buy-btn" form="buy-form" type="submit">Buy</button>
                    <button class="modal-close waves-effect waves-teal btn-flat widget__close-btn" type="button" data-target="modal">Cancel</button>
                </div>
            </div>
        `;

        this._innerEls = {
            modal:          this._el.firstElementChild,
            form:           this._el.querySelector(".buy-form"),
            buyBtn:         this._el.querySelector(".widget__buy-btn"),
            closeBtn:       this._el.querySelector(".widget__close-btn"),
            title:          this._el.querySelector(".widget__title"),
            currentPrice:   this._el.querySelector(".widget__current-price"),
            total:          this._el.querySelector(".widget__total"),
            amountInp:      this._el.querySelector(".widget__amount-inp"),
            amountLabel:    this._el.querySelector(".amount-label"),
            formFeedback:   this._el.querySelector(".widget__form-feedback"),
        };

        this._modal = M.Modal.init(this._innerEls.modal, {
            onCloseStart: () => this._clearFormReports(),
        });

        this._el.addEventListener("input", event => {
            this._wasFormTouched = true;

            const value = +event.target.value;
            this._updateAmount(value);
        });

        this._el.addEventListener("click", event => {
            if (event.target === this._innerEls.closeBtn) {
                this._modal.close();
            }
        });

        this._innerEls.form.addEventListener("submit", event => {
            this._onSubmitHandler(event);
        });
    }

    _onSubmitHandler(event) {
        event.preventDefault();

        this._wasFormTouched = true;

        if (this._reportValidity()) {
            this._onBuyCallback(this._currentItem, this._amount);
            this._modal.close();
        }
    }
}