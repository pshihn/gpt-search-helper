export type PanelState = 'initial' | 'waiting-for-gpt' | 'no-gpt' | 'response' | 'error';
export type OpenState = 'open' | 'closed';

export class ResultsPanel {
  // state
  private _panelState: PanelState = 'initial';
  private _openState: OpenState = 'closed';

  // Elements
  private _parent: HTMLElement;
  private _rootElement: HTMLDivElement;
  private _root: ShadowRoot;
  private _panel: HTMLDivElement;
  private _fab: HTMLDivElement;
  private _fabButton: HTMLButtonElement;
  private _response?: string;

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
        * {box-sizing: border-box;}
        [hidden] {display: none !important;}
        .horiz {display: flex; flex-direction: row;}
        .vert {display: flex; flex-direction: column;}
        .center {align-items: center;}
        .center2 {justify-content: center; align-items: center;}
        .flex {flex: 1;}
        .wrap {flex-wrap: wrap;}
        #panel {
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
          opacity: 0;
          transition: transform 0.3s ease-out, opacity 0.18s ease;
          transform: translateX(110%);
        }
        #panel.open {
          transform: translateX(0);
          opacity: 1;
          pointer-events: auto;
        }
        #fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 10000;
          transition: transform 0.3s ease-out;
        }
        #fab.open {
          transform: translateX(-310px);
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
          outline: none;
        }
        a.button {
          background: #D1C4E9;
          color: #7E57C2;
          display: inline-block;
          outline: none;
          border-radius: 4px;
          padding: 12px 16px;
          text-align: center;
          letter-spacing: 1.5px;
          text-decoration: none;
        }
        #errorPanel {
          color: indianred;
        }
      </style>
      <div id="panel">
        <p>Loading...</p>
      </div>
      <div id="fab">
        <button>🤖</button>
      </div>
    `;

    this._panel = this._root.querySelector('#panel') as HTMLDivElement;
    this._fab = this._root.querySelector('#fab') as HTMLDivElement;
    this._fabButton = this._fab.querySelector('#fab button') as HTMLButtonElement;

    this._fabButton.addEventListener('click', () => {
      this._toggleOpenState();
    });
  }

  private _toggleOpenState() {
    switch (this._openState) {
      case 'closed':
        this._openState = 'open';
        this._fab.classList.add('open');
        this._panel.classList.add('open');
        this._fabButton.textContent = 'x';
        break;
      case 'open':
        this._openState = 'closed';
        this._fab.classList.remove('open');
        this._panel.classList.remove('open');
        this._fabButton.textContent = '🤖';
        break;
    }
  }

  setState(state: PanelState, response?: string) {
    this._response = response;
    this._setPanelState(state);
  }

  private _setPanelState(state: PanelState) {
    if (this._panelState !== state) {
      this._panelState = state;
      this._renderPanel();
    }
  }

  private _renderPanel() {
    switch (this._panelState) {
      case 'initial': {
        this._panel.innerHTML = `
          <p>Loading...</p>
        `;
        break;
      }
      case 'no-gpt': {
        this._panel.innerHTML = `
          <div class="horiz center2" style="height: 100%;">
            <div>
              <p>No ChatGPT tab detected. You need to be logged into ChatGPT in one of the browser tabs.</p>
              <p>
                <a class="button" href="https://chat.openai.com/chat" target="_blank" rel="noopener">Open ChatGPT</a>
              </p>
            </div>
          </div>
        `;
        break;
      }
      case 'waiting-for-gpt': {
        this._panel.innerHTML = `
          <p>Waiting for ChatGPT response...</p>
        `;
        break;
      }
      case 'response': {
        this._panel.innerHTML = this._response || '';
        break;
      }
      case 'error': {
        this._panel.innerHTML = `
        <div id="errorPanel">
          <p>Error:</p>
          <p>${this._response || 'Unknown'}</p>
        </div>
        `;
        break;
      }
    }
  }
}