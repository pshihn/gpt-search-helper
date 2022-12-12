export class ResultsPanel {
  private _parent: HTMLElement;
  private _rootElement: HTMLDivElement;
  private _root: ShadowRoot;

  private _panel: HTMLDivElement;
  private _fab: HTMLDivElement;
  private _fabButton: HTMLButtonElement;

  constructor(parent: HTMLElement) {
    this._parent = parent;
    this._rootElement = document.createElement('div');
    this._parent.appendChild(this._rootElement);

    this._root = this._rootElement.attachShadow({ mode: 'open' });
    this._root.innerHTML = `
      <style>
        :host {
          display: block;
          pointer-events: none;
        }
        * {
          box-sizing: border-box;
        }
        #panel {
          pointer-events: auto;
          position: fixed;
          top: 0;
          right: 0;
          width: 320px;
          background: #fafafa;
          height: 100%;
          z-index: 10000;
          box-shadow: 0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14), 0 1px 10px 0 rgba(0,0,0,.12);
          padding: 16px;
          overflow-x: hidden;
          overflow-y: auto;
          font-size: 14px;
          font-family: system-ui, sans-serif;
        }
        #fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
        }
        #fab button {
          box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          user-select: none;
          background: #D1C4E9;
          color: #7E57C2;
          line-height: 24px;
          font-size: 24px;
          cursor: pointer;
          pointer-events: auto;
        }
      </style>
      <div id="panel">
        <p>
        The sky appears blue to human observers because blue light from the sun is scattered in every direction by the gases and particles in the Earth's atmosphere. This scattering causes the direct sunlight to appear white, but the sky itself takes on a blue hue because the shorter wavelength of blue light is scattered more easily than the other colors in the visible spectrum. This is why the sky appears blue during the day, but can take on other colors at sunrise, sunset, and during other atmospheric conditions.
        </p>
        <p>
        The result of adding 2 and 55545 is 55547. This can be determined by starting with the units digit of the number on the right (5), adding the units digit of the number on the left (2), and carrying the 1 to the next place value. The result would be 7 in the units place and 1 in the tens place, giving a final answer of 55547.
        </p>
      </div>
      <div id="fab">
        <button>🤖</button>
      </div>
    `;

    this._panel = this._root.querySelector('#panel') as HTMLDivElement;
    this._fab = this._root.querySelector('#fab') as HTMLDivElement;
    this._fabButton = this._fab.querySelector('#fab button') as HTMLButtonElement;

    console.log(this._panel, this._fab, this._fabButton);
  }
}