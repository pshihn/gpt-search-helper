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
      // console.log('Content script message received', message);
      // port.postMessage({ message: 'Hello back content script' });
    });
    _port = port;
  }
});

function sendResponse(id: string, body: string) {
  if (_port) {
    const msg: ChatRxMessage = {
      id,
      type: 'a',
      body
    };
    _port.postMessage(msg);
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
    const txt = div.textContent || '';
    if (txt) {
      sendResponse(messageId, div.textContent || '');
    }
  });
  observer.observe(div, { subtree: true, characterData: true, childList: true });
  const txt = div.textContent || '';
  if (txt) {
    sendResponse(messageId, div.textContent || '');
  }
}

function findResponseNodes(): HTMLDivElement[] {
  const responses = document.querySelectorAll('div[class*="request-"]') as NodeListOf<HTMLDivElement>;
  return responses ? Array.from(responses) : [];
}

console.log('Chat content script loaded');