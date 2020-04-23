export class TradeWidget {
  constructor({ element }) {
    this._el = element;

    this._el.addEventListener('input', e => {
      const value = +e.target.value;
      this._updateDisplay(value);
    })
  }

  trade(item) {
    this._currentItem = item;
    this._total = item.price * 0;

    this._render(item);
  }

  _updateDisplay(value) {
    this._totalEl = this._el.querySelector('#item-total');
    this._totalEl.textContent = this._currentItem.price * value;
  }

  _render(item) {
    this._el.innerHTML = `
      <div id="modal" class="modal open">
        <div class="modal-content">
          <h4>Buying ${item.name}:</h4>
          <p>
            Current price: ${item.price}. Total: <span id="item-total">${this._total}</span>
          </p>
        <div class="row">
              <form class="col s12">
                  <div class="input-field col s4">
                      <input id="amount" type="text">
                      <label for="amount">Amount</label>
                  </div>
              </form>
              </div>
          </div>
          
          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Buy</a>
            <a href="#!" class="modal-close waves-effect waves-teal btn-flat">Cancel</a>
          </div>
      </div>
    `;
    let elems = this._el.querySelectorAll('.collapsible');
    M.Collapsible.init(elems);
  }
}