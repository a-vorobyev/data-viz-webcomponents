import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `d3-airline-routes`
 * d3 homework project
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class D3AirlineRoutes extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
            font-family: Helvetica, Arial, sans-serif
        }

        h1 {
            background-color: #2a5599;
            color: white;
            padding: 5px;
        }

        svg {
          border: 1px solid black;
          width: 100%;
        }

        .mainView {
          display: flex;
          flex-direction: row;
        }
      </style>

      <h1>Airlines Routes</h1>

      <div class="mainView">
          <div>
              <h2>Airlines</h2>
              <svg id="AirlinesChart"></svg>
          </div>
          <div>
              <h2>Airports</h2>
              <svg id="Map"></svg>
          </div>
      </div>
    `;
  }
}

window.customElements.define('d3-airline-routes', D3AirlineRoutes);
