export type ChatTxType = 'q';
export type ChatRxType = 'a';

export interface ChatTxMessage {
  id: string;
  type: ChatTxType;
  body: string;
}

export interface ChatRxMessage {
  id: string;
  type: ChatRxType;
  body?: string;
  error?: string;
}

export interface GoogleTxMessage {
  type: 'q';
  body: string;
}

export interface GoogleRxMessage {
  type: 'processing' | 'answer' | 'error';
  q?: string;
  body: string;
}

export const PORT_CHAT_WINDOW = '__bg-chat__';
export const PORT_GOOGLE_WINDOW = '__bg-google__';