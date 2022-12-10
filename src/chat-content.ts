import 'chrome-types';
import { ChatTxMessage, PORT_CHAT_WINDOW } from './common.js';

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_CHAT_WINDOW) {
    port.onMessage.addListener((message: ChatTxMessage) => {
      handleMessage(message);
      // console.log('Content script message received', message);
      // port.postMessage({ message: 'Hello back content script' });
    });
  }
});

function handleMessage(message: ChatTxMessage) {
  switch (message.type) {
    case 'q': {
      const ta = document.querySelector('textarea');
      const button = document.querySelector('textarea + button') as HTMLButtonElement;
      if (ta && button) {
        ta.focus();
        ta.value = message.body;
        button.click();
      }
      break;
    }
  }
}

console.log('Chat content script loaded');