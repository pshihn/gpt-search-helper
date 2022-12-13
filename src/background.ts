import 'chrome-types';
import { ChatTxMessage, ChatRxMessage, PORT_CHAT_WINDOW, PORT_GOOGLE_WINDOW, GoogleTxMessage, GoogleRxMessage } from './common.js';

interface ChatTab {
  id: number;
  port: chrome.runtime.Port;
}

interface GooggleTabState {
  chatQueryId?: string;
  q?: string;
}

let _chatTab: ChatTab | null = null;
const _googlePortMap = new Map<chrome.runtime.Port, GooggleTabState>();

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
    handleChatMessage(message);
  });
  _chatTab = { id: tabId, port };
}

function newId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function sendQuery(q: string): ChatTxMessage | null {
  if (_chatTab) {
    const message: ChatTxMessage = {
      id: newId(),
      type: 'q',
      body: q
    };
    _chatTab.port.postMessage(message);
    return message;
  }
  return null;
}

function handleGoogleMessage(port: chrome.runtime.Port, message: GoogleTxMessage) {
  const state = _googlePortMap.get(port);
  if (state) {
    switch (message.type) {
      case 'q': {
        const body = (message.body || '').trim();
        if (body) {
          const chatQuery = sendQuery(body);
          if (chatQuery) {
            state.chatQueryId = chatQuery?.id;
            state.q = body;
          } else {
            const msg: GoogleRxMessage = {
              type: 'no-gpt'
            };
            port.postMessage(msg);
          }
        }
        break;
      }
    }
  }
}

function handleChatMessage(message: ChatRxMessage) {
  switch (message.type) {
    case 'a': {
      for (const key of _googlePortMap.keys()) {
        const tabState = _googlePortMap.get(key);
        if (tabState && tabState.chatQueryId === message.id) {
          const msg: GoogleRxMessage = {
            type: 'answer',
            q: tabState.q,
            body: message.body || ''
          };
          key.postMessage(msg);
        }
      }
      break;
    }
    case 'waiting': {
      for (const key of _googlePortMap.keys()) {
        const tabState = _googlePortMap.get(key);
        if (tabState && tabState.chatQueryId === message.id) {
          const msg: GoogleRxMessage = {
            type: 'waiting',
            q: tabState.q
          };
          key.postMessage(msg);
        }
      }
      break;
    }
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
    }
  }
});

// Receive connections from Google search
chrome.runtime.onConnect.addListener((port) => {
  if (port.name === PORT_GOOGLE_WINDOW) {
    _googlePortMap.set(port, {});

    port.onDisconnect.addListener(() => {
      _googlePortMap.delete(port);
    });

    port.onMessage.addListener((message: GoogleTxMessage) => {
      handleGoogleMessage(port, message);
    });
  }
});