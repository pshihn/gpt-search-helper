import 'chrome-types';
import { GoogleRxMessage, GoogleTxMessage, PORT_GOOGLE_WINDOW } from './common.js';


let _port: chrome.runtime.Port | null = null;
let _q: string | null = null;

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


function initialize() {
  const q = detectQuery();
  if (q) {
    console.log('Query detected:', q);
    _port = chrome.runtime.connect(undefined, { name: PORT_GOOGLE_WINDOW });
    _port.onDisconnect.addListener(() => {
      _port = null;
    });
    _port.onMessage.addListener((message: GoogleRxMessage) => {
      console.log('Received message from background:', message);
    });
    sendQuery(q);
  }
}

console.log('Google content script loaded.');
initialize();