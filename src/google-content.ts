import 'chrome-types';
import { GoogleRxMessage, GoogleTxMessage, PORT_GOOGLE_WINDOW } from './common.js';
import { ResultsPanel } from './results-panel.js';


let _port: chrome.runtime.Port | null = null;
let _q: string | null = null;
let _panel: ResultsPanel | null = null;

function detectQuery(): string | null {
  const searchParams = new URLSearchParams(window.location.search);
  if ((!searchParams.has('tbm')) && searchParams.has('q')) {
    const q = searchParams.get('q') || '';
    return q.trim() || null;
  }
  return null;
}

function sendQuery(q: string) {
  if (_port && q) {
    _q = q;
    const msg: GoogleTxMessage = {
      type: 'q',
      body: _q
    };
    _port.postMessage(msg);
  }
}

function injectPanel(autoSearch: boolean) {
  if (!_panel) {
    _panel = new ResultsPanel(document.body, autoSearch);
    document.body.addEventListener('try-again', () => {
      runQuery();
    });
    if (autoSearch) {
      runQuery();
    }
  }
}

function initialize() {
  chrome.storage.sync.get({
    autoSearch: false
  }, function (items) {
    injectPanel(items.autoSearch || false);
  });
}

function runQuery() {
  const q = detectQuery();
  if (q) {
    console.log('Query detected:', q);
    if (_port) {
      try {
        _port.disconnect();
      } catch (e) {
        // ignore
      }
      _port = null;
    }
    _port = chrome.runtime.connect(undefined, { name: PORT_GOOGLE_WINDOW });
    _port.onDisconnect.addListener(() => {
      _port = null;
    });
    _port.onMessage.addListener((message: GoogleRxMessage) => {
      handleMessage(message);
    });
    sendQuery(q);

    if (_panel) {
      _panel.setState('waiting-for-gpt');
    }
  }
}

function handleMessage(message: GoogleRxMessage) {
  switch (message.type) {
    case 'no-gpt': {
      if (_panel) {
        _panel.setState('no-gpt');
      }
      break;
    }
    case 'answer': {
      if (_panel && (_q === message.q)) {
        _panel.setState('response', message.body);
      }
      break;
    }
    case 'error': {
      if (_panel && (_q === message.q)) {
        _panel.setState('error', message.body);
      }
      break;
    }
    case 'waiting': {
      if (_panel && (_q === message.q)) {
        _panel.setState('waiting-for-gpt');
      }
      break;
    }
  }
}

initialize();