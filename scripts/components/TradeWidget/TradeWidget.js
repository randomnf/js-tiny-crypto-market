export class TradeWidget {
    constructor({ element, onBuy }) {
        this._el = element;
        this._onBuyCallback = onBuy;
        this._render();
    }

    trade({ item, balance }) {
        this._balance = balance;
        this._currentItem = item;
        this._total = item.price_usd * 0;
        this._modal.open();
        this._updateDisplay();
    }

    _updateAmount(value = 0) {
        this._amount = value;
        this._total = this._currentItem.price_usd * this._amount;
        this._innerEls.total.textContent = this._total;

        this._reportAmountError();
    }

    _updateDisplay() {
        this._updateAmount();
        this._innerEls.title.textContent = this._currentItem.name;
        this._innerEls.currentPrice.textContent = this._currentItem.price_usd;
        this._innerEls.amountInp.value = "";
    }

    _reportAmountError() {
        this._isAmountError = this._total > this._balance;

        this._innerEls.amountInp.classList.toggle("invalid", this._isAmountError);

        this._innerEls.formFeedback.classList.toggle("error", this._isAmountError);
        this._innerEls.formFeedback.textContent = this._isAmountError ? "Total sum is more than yor balance.": "";

        this._innerEls.buyBtn.disabled = this._isAmountError;
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
                        <form class="col s12" id="buy-form">
                            <div class="input-field col s4">
                                <input class="widget__amount-inp" id="amount" type="number" min="0">
                                <label for="amount">Amount</label>
                            </div>
                            <div class="widget__form-feedback"></div>
                        </form>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="waves-effect waves-teal btn-flat widget__buy-btn" form="buy-form" type="submit">Buy</button>
                    <button class="modal-close waves-effect waves-teal btn-flat widget__close-btn" type="button" data-action="close" data-target="modal">Cancel</button>
                </div>
            </div>
        `;

        this._innerEls = {
            modal:          this._el.firstElementChild,
            buyBtn:         this._el.querySelector(".widget__buy-btn"),
            closeBtn:       this._el.querySelector(".widget__close-btn"),
            title:          this._el.querySelector(".widget__title"),
            currentPrice:   this._el.querySelector(".widget__current-price"),
            total:          this._el.querySelector(".widget__total"),
            amountInp:      this._el.querySelector(".widget__amount-inp"),
            formFeedback:   this._el.querySelector(".widget__form-feedback"),
        };

        this._modal = M.Modal.init(this._innerEls.modal);

        this._el.addEventListener("input", event => {
            const value = +event.target.value;
            this._updateAmount(value);
        });

        this._el.addEventListener("click", event => {
            const isBuyBtn =    event.target === this._innerEls.buyBtn;
            const isCloseBtn =  event.target === this._innerEls.closeBtn;

            if (isBuyBtn) {
                this._onBuyCallback(this._currentItem, this._amount);
            }

            if (isBuyBtn || isCloseBtn) {
                this._modal.close();
            }
        });
    }
}