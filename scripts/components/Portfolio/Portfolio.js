export class Portfolio {
  constructor({ element, balance }) {
    this._el = element;
    this._balance = balance;

    this._portfolioWorth = 0;
    this._render();
  }

  _render() {
    this._el.innerHTML = `
      <ul class="collapsible portfolio">
        <li>
          <p class="collapsible-header">
              Current balance: $${this._balance}.
              Portfolio Worth: $${this._portfolioWorth}
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
    let elems = this._el.querySelectorAll('.collapsible');
    M.Collapsible.init(elems);
  }
}