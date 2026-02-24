import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Send, Loader2, Volume2, Settings, ArrowLeft } from 'lucide-react';
import { useConversation } from './useConversation';
import { useVoice } from './useVoice';
import { routeIntent } from './intentRouter';
import { getIntentFromLLM } from './llmService';
import { getMember } from '@/data/mock-members';
import { MiniTree } from './responses/MiniTree';
import { PersonCard } from './responses/PersonCard';
import { MiniFeed } from './responses/MiniFeed';
import { MiniGallery } from './responses/MiniGallery';
import type { InterfaceViewType } from './types';
import { ROUTES } from '@/constants/routes';
import { useTheme } from 'next-themes';

const PAGE_ROUTES: Record<string, string> = {
  tree: ROUTES.classic.tree,
  feed: ROUTES.classic.feed,
  family: ROUTES.classic.family,
  settings: ROUTES.classic.settings,
  profile: ROUTES.classic.myProfile,
  store: ROUTES.classic.store,
  create: ROUTES.classic.create,
  help: ROUTES.classic.help,
  invite: ROUTES.classic.invite,
  demoVariants: ROUTES.classic.demoVariants,
  app: ROUTES.app,
};

export const AiShell: React.FC = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    interfaceView,
    selectedContext,
    isThinking,
    isSpeaking,
    setView,
    setEmptyView,
    setSelectedContext: selectEntity,
    setIsThinking,
    setIsSpeaking,
    addUserMessage,
    addAiMessage,
  } = useConversation();

  const handleUserInputRef = useRef<(text: string) => void>(() => {});

  const handleUserInput = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      addUserMessage(trimmed);
      setIsThinking(true);

      // LLM (if key set) or rule-based intent
      const delayMs = 800;
      setTimeout(async () => {
        let intent: { type: string; entity?: string } = { type: 'unknown' };
        let llmReply: string | undefined;
        try {
          const llmResult = await getIntentFromLLM(trimmed, selectedContext);
          if (llmResult) {
            intent = llmResult.intent;
            llmReply = llmResult.textReply;
          }
        } catch {
          // LLM optional; fallback to rule-based intent
        }
        if (intent.type === 'unknown') {
          intent = routeIntent(trimmed, selectedContext);
        }

        let reply = '';
        let viewType: InterfaceViewType = 'empty';
        let viewPayload: string | undefined;

        switch (intent.type) {
          case 'greeting':
            reply = 'Добрый день! Чем могу помочь? Можете сказать «Покажи дерево» или «Расскажи про дедушку».';
            break;
          case 'show_tree':
            reply = 'Вот ваше семейное дерево. Нажмите на любого человека — потом скажите «расскажи про него».';
            viewType = 'tree';
            break;
          case 'show_person':
            if (intent.entity) {
              const person = getMember(intent.entity);
              if (person) {
                reply = `${person.firstName} ${person.lastName}${person.nickname ? ` («${person.nickname}»)` : ''}. ${person.city ? person.city + '. ' : ''}${person.about || ''}`;
                viewType = 'person';
                viewPayload = intent.entity;
                selectEntity(intent.entity);
              } else {
                reply = 'Не нашёл такого человека. Попробуйте: «Покажи дерево» и нажмите на кого нужно.';
              }
            } else {
              reply = 'О ком рассказать? Скажите, например: «Расскажи про дедушку» или нажмите на человека в дереве.';
            }
            break;
          case 'show_feed':
            reply = 'Вот последние публикации семьи. Нажмите на запись или «Открыть полную ленту» — откроется полная лента.';
            viewType = 'feed';
            break;
          case 'search_media':
            reply = 'Вот галерея фото и медиа семьи. Можно открыть полную ленту с вкладкой «Медиа» для просмотра всего архива.';
            viewType = 'gallery';
            break;
          case 'create_publication':
            reply = 'Чтобы создать публикацию, откройте полный режим по кнопке ниже или скажите «Классический режим» и перейдите в «Создать».';
            viewType = 'story';
            viewPayload = 'create_publication';
            break;
          case 'help':
            reply = 'Я умею: показать дерево, рассказать про любого, показать ленту, галерею, создать публикацию, пригласить родственников, сменить оформление. Навигация: «открой настройки», «покажи ленту», «создай публикацию», «пригласи присоединиться», «назад». Скролл: «пролистай вниз/вверх». Тема: «тёмная тема», «светлая тема».';
            break;
          case 'navigate_to': {
            const path = PAGE_ROUTES[intent.entity || ''];
            if (path) {
              const labels: Record<string, string> = {
  tree: 'дерево', feed: 'ленту', family: 'семью', settings: 'настройки', profile: 'профиль',
  store: 'магазин', create: 'создание публикации', help: 'помощь', invite: 'приглашения',
  demoVariants: 'варианты оформления',
};
reply = `Открываю ${labels[intent.entity || ''] || intent.entity || 'страницу'}.`;
              setTimeout(() => navigate(path), 600);
            } else {
              reply = 'Не знаю такую страницу. Скажите: «открой дерево», «настройки», «ленту», «магазин» или «профиль».';
            }
            break;
          }
          case 'go_back':
            reply = 'Возвращаюсь назад.';
            setTimeout(() => navigate(-1), 600);
            break;
          case 'scroll': {
            const dir = intent.entity === 'up' ? -1 : 1;
            window.scrollBy({ top: dir * window.innerHeight * 0.7, behavior: 'smooth' });
            reply = intent.entity === 'up' ? 'Листаю вверх.' : 'Листаю вниз.';
            break;
          }
          case 'toggle_theme': {
            const val = intent.entity;
            if (val === 'toggle') {
              setTheme(theme === 'dark' ? 'light' : 'dark');
              reply = `Переключаю тему на ${theme === 'dark' ? 'светлую' : 'тёмную'}.`;
            } else {
              setTheme(val === 'light' ? 'light' : 'dark');
              reply = `Включаю ${val === 'light' ? 'светлую' : 'тёмную'} тему.`;
            }
            break;
          }
          default:
            reply = 'Попробуйте: «Покажи дерево», «Расскажи про дедушку», «Что нового?», «Покажи фото», «Открой настройки», «Пролистай вниз» или «Помощь».';
        }

        if (llmReply) reply = llmReply;
        if (!reply) reply = 'Попробуйте: «Покажи дерево», «Расскажи про дедушку», «Что нового?», «Покажи фото» или «Помощь».';
        addAiMessage(reply);
        setView(viewType, viewPayload);
        setIsThinking(false);
        setIsSpeaking(true);
      }, delayMs);
    },
    [
      addUserMessage,
      addAiMessage,
      setView,
      selectEntity,
      setIsThinking,
      setIsSpeaking,
      selectedContext,
    ]
  );

  handleUserInputRef.current = handleUserInput;

  useEffect(() => {
    try {
      const query = sessionStorage.getItem('ai-demo-voice-query');
      if (query) {
        sessionStorage.removeItem('ai-demo-voice-query');
        handleUserInputRef.current(query);
      }
    } catch {
      // sessionStorage not available
    }
  }, []);

  const { isListening, isSupported, startListening, stopListening, speak, stopSpeaking } = useVoice(
    (text) => handleUserInput(text)
  );

  const WELCOME_SPEECH =
    'Здравствуйте! Я Angelo — помощник вашей семьи. Умею показать дерево, рассказать про родственников, показать ленту, создать публикацию, пригласить в семью, сменить оформление. Говорите или пишите команды. Подробная инструкция с озвучкой — в разделе «Помощь»: скажите «Открой помощь» или нажмите «Настройки» и выберите «Помощь».';

  useEffect(() => {
    try {
      if (sessionStorage.getItem('ai-demo-play-welcome') === '1') {
        sessionStorage.removeItem('ai-demo-play-welcome');
        const t = setTimeout(() => {
          speak(WELCOME_SPEECH);
          setIsSpeaking(true);
        }, 400);
        return () => clearTimeout(t);
      }
    } catch {
      // ignore
    }
  }, [speak, setIsSpeaking]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // TTS for last AI message (skip welcome, only reply after user)
  const lastAi = messages.filter((m) => m.role === 'ai').pop();
  const prevLastAiId = useRef<string | null>(null);
  useEffect(() => {
    if (!lastAi || isThinking || lastAi.id === 'welcome') return;
    if (prevLastAiId.current === lastAi.id) return;
    prevLastAiId.current = lastAi.id;
    const t = setTimeout(() => {
      speak(lastAi.text);
      setIsSpeaking(true);
      setTimeout(() => setIsSpeaking(false), 3000);
    }, 500);
    return () => { clearTimeout(t); stopSpeaking(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-run when lastAi identity changes
  }, [lastAi?.id, isThinking, speak, stopSpeaking, setIsSpeaking]);

  const [inputValue, setInputValue] = React.useState('');
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleUserInput(inputValue);
    setInputValue('');
  };

  return (
    <div className="relative flex flex-col h-screen overflow-hidden paper-texture">
      <div className="fixed inset-0 -z-10">
        <img src="/bg-5.png" alt="" className="h-full w-full object-cover photo-bg-blur" />
        <div className="absolute inset-0 bg-background/90" />
      </div>
      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-primary/20 gradient-warm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(ROUTES.classic.tree)}
            className="touch-target p-2.5 -ml-2 rounded-xl border-2 border-primary/50 text-foreground/90 hover:text-primary hover:bg-primary/10 hover:border-primary/70 transition-colors shadow-sm"
            aria-label="Назад"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="editorial-title text-lg text-foreground">Angelo</h1>
            <p className="text-[11px] text-foreground/60 font-light">Управление голосом или текстом</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.classic.settings)}
          className="p-2 text-foreground/70 hover:text-foreground rounded-lg hover:bg-primary/10 transition-colors"
          aria-label="Настройки"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-y-auto md:overflow-hidden">
        <section className="order-2 md:order-1 flex flex-col flex-shrink-0 w-full md:w-[320px] md:border-r border-primary/10 bg-card/50">
          <div className="flex-1 md:overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-card text-foreground border border-primary/15 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-primary/10 border border-primary/20 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-foreground/70">Думаю…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex-shrink-0 p-3 border-t border-border/50 sticky bottom-0 bg-card/95 backdrop-blur-sm z-10">
            <form onSubmit={onSubmit} className="flex gap-2 items-end">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Напишите или скажите..."
                className="flex-1 min-w-0 px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                aria-label="Сообщение"
              />
              <button
                type="button"
                onClick={isSupported ? (isListening ? stopListening : startListening) : undefined}
                disabled={!isSupported}
                title={isSupported ? (isListening ? 'Остановить запись' : 'Нажмите и говорите') : 'Голос недоступен в этом браузере'}
                className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center transition-all shadow-md ${
                  !isSupported
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : isListening
                      ? 'bg-destructive/90 text-white animate-pulse shadow-destructive/30'
                      : 'bg-primary text-primary-foreground hover:opacity-90 shadow-primary/25'
                }`}
                aria-label={isListening ? 'Остановить запись' : 'Голос: нажмите и говорите'}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="submit"
                className="flex-shrink-0 h-12 w-12 rounded-xl border border-border hover:bg-muted flex items-center justify-center text-foreground"
                aria-label="Отправить"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-2">
              {isSpeaking ? (
                <><Volume2 className="h-3 w-3" /> Озвучиваю ответ</>
              ) : (
                <><Mic className="h-3 w-3" /> Нажмите микрофон и говорите — или напишите выше</>
              )}
            </p>
          </div>
        </section>

        <section className="order-1 md:order-2 md:flex-1 md:min-h-0 md:overflow-y-auto p-4 md:p-6 bg-background">
          {interfaceView.type === 'empty' && (
            <div className="h-full min-h-[280px] flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-300 rounded-2xl border border-primary/10 bg-gradient-to-b from-primary/5 to-transparent">
              <p className="editorial-title text-xl text-foreground mb-2">Здесь будет контент</p>
              <p className="text-sm text-foreground/70 font-light max-w-xs">
                Спросите: «Покажи дерево», «Расскажи про дедушку» или «Что нового?» — и я покажу сюда дерево, карточки и истории. По ним можно нажимать.
              </p>
            </div>
          )}
          {interfaceView.type === 'tree' && (
            <MiniTree
              onSelectPerson={(id) => {
                selectEntity(id);
                setView('person', id);
                addAiMessage('Вот карточка. Скажите «покажи его фото» или «расскажи подробнее».');
              }}
            />
          )}
          {interfaceView.type === 'person' && typeof interfaceView.payload === 'string' && (
            <PersonCard
              memberId={interfaceView.payload}
              isSelected={selectedContext === interfaceView.payload}
              onSelect={() => selectEntity(interfaceView.payload as string)}
            />
          )}
          {interfaceView.type === 'feed' && <MiniFeed />}
          {interfaceView.type === 'gallery' && <MiniGallery />}
          {interfaceView.type === 'story' &&
            interfaceView.payload === 'create_publication' && (
              <div className="animate-in fade-in duration-300 flex flex-col items-center justify-center min-h-[280px] text-center px-4">
                <p className="editorial-title text-xl text-foreground/90 mb-2">Создать публикацию</p>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  В классическом режиме можно добавить фото, видео или историю в ленту семьи.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.classic.create)}
                  className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium shadow-md shadow-primary/25 hover:opacity-90 transition-opacity"
                >
                  Открыть «Создать публикацию»
                </button>
              </div>
            )}
        </section>
      </div>
    </div>
  );
};
