import { useState, useCallback } from 'react';
import type { ChatMessage, InterfaceView, InterfaceViewType } from './types';

const initialView: InterfaceView = { type: 'empty' };

export function useConversation() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: 'Здравствуйте! Я Angelo — помощник вашей семьи. Спросите голосом или напишите: «Покажи дерево», «Расскажи про дедушку», «Что нового?» Тапните по контенту справа — расскажу подробнее.',
      timestamp: Date.now(),
    },
  ]);
  const [interfaceView, setInterfaceView] = useState<InterfaceView>(initialView);
  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const addUserMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    return msg;
  }, []);

  const addAiMessage = useCallback((text: string) => {
    const msg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'ai',
      text,
      timestamp: Date.now(),
    };
    setMessages((m) => [...m, msg]);
    return msg;
  }, []);

  const setView = useCallback((type: InterfaceViewType, payload?: string | Record<string, unknown>) => {
    setInterfaceView({ type, payload });
  }, []);

  const setEmptyView = useCallback(() => {
    setInterfaceView(initialView);
  }, []);

  const selectEntity = useCallback((id: string | null) => {
    setSelectedContext(id);
  }, []);

  return {
    messages,
    interfaceView,
    selectedContext,
    isThinking,
    isSpeaking,
    setMessages,
    setInterfaceView,
    setView,
    setEmptyView,
    setSelectedContext: selectEntity,
    setIsThinking,
    setIsSpeaking,
    addUserMessage,
    addAiMessage,
  };
}
