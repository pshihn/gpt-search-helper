import 'chrome-types';
import { ChatTxMessage, ChatRxMessage, PORT_CHAT_WINDOW } from './common.js';

interface ChatTab {
  id: number;
  port: chrome.runtime.Port;
}

let _chatTab: ChatTab | null = null;

function disconnectChatTab() {
  if (_chatTab) {
    try {
      _chatTab.port.disconnect();
    } finally {
      _chatTab = null;
    }
  }
}

function attachToChatTab(tabId: number) {
  disconnectChatTab();
  const port = chrome.tabs.connect(tabId, { name: PORT_CHAT_WINDOW });
  port.onDisconnect.addListener(() => {
    disconnectChatTab();
  });
  port.onMessage.addListener((message: ChatRxMessage) => {
    console.log('Received message from chat tab:', message);
  });
  _chatTab = { id: tabId, port };
}

function newId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function sendQuery(q: string) {
  if (_chatTab) {
    const message: ChatTxMessage = {
      id: newId(),
      type: 'q',
      body: q
    };
    _chatTab.port.postMessage(message);
  }
}

/**
 * Detect when a page loads to check if it's the chat page.
 */
chrome.webNavigation.onCompleted.addListener((details) => {
  if ((!_chatTab) && (!details.frameId)) {
    const host = new URL(details.url).host;
    if (host === 'chat.openai.com') {
      attachToChatTab(details.tabId);
      setTimeout(() => {
        sendQuery('Why is the sky blue?');
      }, 5000);
    }
  }
});