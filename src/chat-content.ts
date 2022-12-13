import 'chrome-types';
import { ChatRxMessage, ChatTxMessage, PORT_CHAT_WINDOW, wait } from './common.js';

let _port: chrome.runtime.Port | null = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_CHAT_WINDOW) {
    port.onDisconnect.addListener(() => {
      _port = null;
    });
    port.onMessage.addListener((message: ChatTxMessage) => {
      handleMessage(message);
    });
    _port = port;
  }
});

function sendResponse(id: string, div: HTMLElement) {
  const body = ((div.textContent || '').trim().length > 3) ? div.innerHTML.trim() : '';
  if (_port) {
    if (body) {
      const msg: ChatRxMessage = {
        id,
        type: 'a',
        body
      };
      _port.postMessage(msg);
    } else {
      const msg: ChatRxMessage = {
        id,
        type: 'waiting'
      };
      _port.postMessage(msg);
    }
  }
}

function handleMessage(message: ChatTxMessage) {
  switch (message.type) {
    case 'q':
      queryGpt(message);
      break;
  }
}

async function queryGpt(message: ChatTxMessage) {
  const initialResponses = findResponseNodes();
  const ta = document.querySelector('textarea');
  const button = document.querySelector('textarea + button') as HTMLButtonElement;
  if (ta && button) {
    ta.focus();
    ta.value = message.body;
    button.click();
  }
  for (let i = 0; i < 50; i++) {
    await wait(100);
    const responses = findResponseNodes();
    if (responses.length > initialResponses.length) {
      const lastResponse = responses[responses.length - 1];
      listenForContent(lastResponse, message.id);
      break;
    }
  }
}

async function listenForContent(div: HTMLDivElement, messageId: string) {
  const observer = new MutationObserver(() => {
    sendResponse(messageId, div);
  });
  observer.observe(div, { subtree: true, characterData: true, childList: true });
  sendResponse(messageId, div);
}

function findResponseNodes(): HTMLDivElement[] {
  const responses = document.querySelectorAll('div[class*="request-"]') as NodeListOf<HTMLDivElement>;
  return responses ? Array.from(responses) : [];
}

console.log('Chat content script loaded');