import type { FamilyMember } from '@/types';

export type MessageRole = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: number;
}

/** What can be shown in the "потыкать" interface zone */
export type InterfaceViewType =
  | 'empty'
  | 'tree'
  | 'person'
  | 'feed'
  | 'gallery'
  | 'story';

export interface InterfaceView {
  type: InterfaceViewType;
  /** For person: member id */
  payload?: string | Record<string, unknown>;
}

export interface ConversationState {
  messages: ChatMessage[];
  interfaceView: InterfaceView;
  /** Selected entity for "расскажи про него" — e.g. member id */
  selectedContext: string | null;
  isThinking: boolean;
  isSpeaking: boolean;
}

export type IntentType =
  | 'greeting'
  | 'show_tree'
  | 'show_person'
  | 'show_feed'
  | 'search_media'
  | 'create_publication'
  | 'help'
  | 'navigate_to'
  | 'go_back'
  | 'scroll'
  | 'toggle_theme'
  | 'unknown';

export interface Intent {
  type: IntentType;
  /** Extracted entity: person id, route path, scroll direction, theme value */
  entity?: string;
}
