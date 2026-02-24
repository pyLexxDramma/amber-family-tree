import type { Intent } from './types';
import { resolvePersonQuery } from './intentRouter';
import { getMember, mockMembers } from '@/data/mock-members';
import { ROUTES } from '@/constants/routes';

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

const TOOLS: Array<{
  type: 'function';
  function: { name: string; description: string; parameters: { type: 'object'; properties: Record<string, unknown>; required?: string[] };
  };
}> = [
  {
    type: 'function',
    function: {
      name: 'show_tree',
      description: 'Показать семейное дерево. Вызывать, когда пользователь просит показать дерево, древо семьи.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_person',
      description: 'Показать карточку человека. Вызывать, когда пользователь спрашивает про кого-то из семьи (по имени, родству: дедушка, бабушка, «расскажи про него»).',
      parameters: {
        type: 'object',
        properties: {
          member_id: { type: 'string', description: 'ID участника (m1, m2, …) если известен' },
          name_or_relation: { type: 'string', description: 'Имя или родство, например: Ольга, дедушка, бабушка, он/она' },
        },
        required: [],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'show_feed',
      description: 'Показать ленту новостей/публикаций семьи. Вызывать при запросах: что нового, лента, новости, публикации.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_media',
      description: 'Поиск медиа: фото, видео, галерея. Вызывать при запросах про фото, видео, медиа, галерею.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_publication',
      description: 'Создать новую публикацию или пост. Вызывать, когда пользователь хочет добавить публикацию, пост, историю.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'help',
      description: 'Помощь: что умеет ассистент, какие команды. Вызывать при запросах: помоги, помощь, что умеешь.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'greeting',
      description: 'Приветствие. Вызывать при приветствии без конкретного запроса.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_family_members',
      description: 'Получить список членов семьи. Вызывать когда нужно узнать кто в семье, перечислить родственников, найти кого-то по имени.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'navigate_to',
      description: 'Перейти на страницу приложения. Вызывать при запросах: открой настройки, перейди в ленту, открой дерево, магазин, профиль, семья, создать публикацию, помощь, приглашения.',
      parameters: {
        type: 'object',
        properties: {
          page: { type: 'string', description: 'Страница: tree, feed, family, settings, profile, store, create, help, invite, demoVariants, app' },
        },
        required: ['page'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'go_back',
      description: 'Вернуться на предыдущую страницу. Вызывать при запросах: назад, вернись, обратно.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'scroll',
      description: 'Прокрутить страницу. Вызывать при запросах: пролистай вниз, вверх, наверх, прокрути.',
      parameters: {
        type: 'object',
        properties: {
          direction: { type: 'string', description: 'Направление: up или down' },
        },
        required: ['direction'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'toggle_theme',
      description: 'Переключить тему оформления. Вызывать при запросах: тёмная тема, светлая тема, смени тему.',
      parameters: {
        type: 'object',
        properties: {
          theme: { type: 'string', description: 'Тема: dark или light' },
        },
        required: ['theme'],
      },
    },
  },
];

export interface LLMResult {
  intent: Intent;
  /** Текстовый ответ модели (если есть), для озвучки/показа */
  textReply?: string;
}

function toolNameToIntent(
  name: string,
  args: Record<string, unknown>,
  selectedContext: string | null
): Intent {
  switch (name) {
    case 'show_tree':
      return { type: 'show_tree' };
    case 'show_feed':
      return { type: 'show_feed' };
    case 'search_media':
      return { type: 'search_media' };
    case 'create_publication':
      return { type: 'create_publication' };
    case 'help':
      return { type: 'help' };
    case 'greeting':
      return { type: 'greeting' };
    case 'get_family_members':
      return { type: 'unknown' };
    case 'show_person': {
      const memberId = args.member_id as string | undefined;
      const nameOrRelation = args.name_or_relation as string | undefined;
      if (memberId && /^m\d+$/.test(memberId)) return { type: 'show_person', entity: memberId };
      if (nameOrRelation) {
        const id = resolvePersonQuery(nameOrRelation) ?? (selectedContext || undefined);
        if (id) return { type: 'show_person', entity: id };
      }
      if (selectedContext) return { type: 'show_person', entity: selectedContext };
      return { type: 'show_person' };
    }
    case 'navigate_to': {
      const page = args.page as string | undefined;
      return { type: 'navigate_to', entity: page || '' };
    }
    case 'go_back':
      return { type: 'go_back' };
    case 'scroll': {
      const dir = args.direction as string | undefined;
      return { type: 'scroll', entity: dir || 'down' };
    }
    case 'toggle_theme': {
      const theme = args.theme as string | undefined;
      return { type: 'toggle_theme', entity: theme || 'dark' };
    }
    default:
      return { type: 'unknown' };
  }
}

function getToolResult(intent: Intent, selectedContext: string | null): string {
  switch (intent.type) {
    case 'show_tree':
      return 'Семейное дерево отображено. Пользователь может нажать на любого человека.';
    case 'show_person': {
      const id = intent.entity ?? selectedContext;
      if (!id) return 'Не указан человек. Спросите: о ком рассказать?';
      const m = getMember(id);
      if (!m) return `Человек с id ${id} не найден.`;
      return `${m.firstName} ${m.lastName}${m.nickname ? ` («${m.nickname}»)` : ''}. ${m.city ? m.city + '. ' : ''}${m.about || ''}`;
    }
    case 'show_feed':
      return 'Лента публикаций семьи отображена.';
    case 'search_media':
      return 'Галерея фото и медиа отображена.';
    case 'create_publication':
      return 'Открыт экран создания публикации. Пользователь может добавить фото, видео или историю.';
    case 'help':
      return 'Помощь: дерево, персона, лента, галерея, создать публикацию, пригласить, сменить оформление. Навигация: открой настройки/ленту/дерево. Скролл: пролистай вниз/вверх. Тема: тёмная/светлая.';
    case 'greeting':
      return 'Приветствие отправлено.';
    case 'navigate_to': {
      const path = PAGE_ROUTES[intent.entity || ''];
      if (path) return `Переход на страницу: ${intent.entity}.`;
      return `Страница «${intent.entity}» не найдена. Доступны: tree, feed, family, settings, profile, store, create, help, invite, demoVariants.`;
    }
    case 'go_back':
      return 'Возврат на предыдущую страницу.';
    case 'scroll':
      return `Прокрутка ${intent.entity === 'up' ? 'вверх' : 'вниз'}.`;
    case 'toggle_theme':
      return `Тема переключена на ${intent.entity === 'light' ? 'светлую' : 'тёмную'}.`;
    case 'unknown':
      return 'Действие не распознано.';
    default:
      return 'Выполнено.';
  }
}

function getFamilyListContext(): string {
  return mockMembers
    .slice(0, 12)
    .map((m) => `${m.firstName} ${m.lastName}${m.nickname ? ` (${m.nickname})` : ''}`)
    .join(', ');
}

export interface AgentResult {
  reply: string;
  intents: Intent[];
}

const MAX_AGENT_ITERATIONS = 5;

export async function runAgentLoop(
  userText: string,
  selectedContext: string | null
): Promise<AgentResult | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string') return null;

  const familyList = getFamilyListContext();
  const systemPrompt = `Ты Angelo — умный помощник семейного приложения. Пользователь общается голосом или текстом на русском.
Твоя задача — понять запрос, при необходимости вызвать инструменты, и дать полезный ответ.
Ты можешь вызывать несколько инструментов подряд, чтобы выполнить сложный запрос.
Участники семьи (примеры): ${familyList}. Для «про него», «подробнее», «его фото» — используй выбранного человека (selectedContext).
Страницы: tree (дерево), feed (лента), family (семья), settings (настройки), profile (профиль), store (магазин), create (создать), help (помощь), invite (приглашения), demoVariants (оформление).
Отвечай кратко и по делу. Если запрос неясен — уточни. Если не можешь выполнить — честно скажи.`;

  const base = import.meta.env.DEV
    ? '/api/openai'
    : (import.meta.env.VITE_OPENAI_PROXY_URL
        || (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy` : null)
        || 'https://tocjbyeybddsfihvqbrk.supabase.co/functions/v1/openai-proxy');

  type Message =
    | { role: 'user' | 'system'; content: string }
    | { role: 'assistant'; content: string; tool_calls?: Array<{ id: string; type: 'function'; function: { name: string; arguments: string } }> }
    | { role: 'tool'; content: string; tool_call_id: string };
  const messages: Message[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Контекст: выбранный человек ${selectedContext || 'не выбран'}. Запрос пользователя: ${userText}` },
  ];

  const intents: Intent[] = [];

  for (let i = 0; i < MAX_AGENT_ITERATIONS; i++) {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 500,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            id?: string;
            function?: { name?: string; arguments?: string };
          }>;
        };
      }>;
    };

    const choice = data.choices?.[0];
    const msg = choice?.message;
    if (!msg) return null;

    const textReply = msg.content?.trim();
    const toolCalls = msg.tool_calls;

    if (toolCalls?.length && !textReply) {
      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        tool_calls: toolCalls.map((tc) => ({
          id: tc.id || `call_${i}_${tc.function?.name}`,
          type: 'function' as const,
          function: { name: tc.function?.name || '', arguments: tc.function?.arguments || '{}' },
        })),
      };
      messages.push(assistantMsg);

      for (const tc of toolCalls) {
        const fn = tc.function;
        const name = fn?.name || '';
        let args: Record<string, unknown> = {};
        try {
          if (fn?.arguments) args = JSON.parse(fn.arguments) as Record<string, unknown>;
        } catch {
          // ignore
        }
        const intent = name === 'get_family_members'
          ? { type: 'unknown' as const, _tool: 'get_family_members' }
          : toolNameToIntent(name, args, selectedContext);
        if (intent.type !== 'unknown' || !('_tool' in intent)) {
          intents.push(intent);
        }
        const result = name === 'get_family_members'
          ? mockMembers.map((m) => `${m.firstName} ${m.lastName}${m.nickname ? ` («${m.nickname}»)` : ''} [${m.id}]`).join('; ')
          : getToolResult(intent, selectedContext);
        messages.push({
          role: 'tool',
          content: result,
          tool_call_id: tc.id || `call_${i}_${name}`,
        } as Message);
      }
      continue;
    }

    if (textReply) {
      return { reply: textReply, intents };
    }
    return null;
  }
  return null;
}

/**
 * Вызов LLM (OpenAI) с function calling для определения интента.
 * Требует VITE_OPENAI_API_KEY в env. При отсутствии ключа или ошибке возвращает null.
 */
export async function getIntentFromLLM(
  userText: string,
  selectedContext: string | null
): Promise<LLMResult | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || typeof apiKey !== 'string') return null;

  const systemPrompt = `Ты помощник семейного приложения Angelo. Пользователь общается голосом или текстом на русском.
Твоя задача — определить намерение (intent) и вызвать соответствующую функцию.
Участники семьи: по именам (Николай, Мария, Ольга, Александр, Дмитрий, Елена, Анна и др.) или по родству (дедушка, бабушка).
Если пользователь говорит «про него», «подробнее», «его фото» — имеется в виду уже выбранный человек (контекст).
Ты также умеешь: навигировать по страницам (navigate_to), возвращаться назад (go_back), прокручивать страницу (scroll), менять тему (toggle_theme).
Страницы: tree (дерево), feed (лента), family (семья), settings (настройки), profile (мой профиль), store (магазин), create (создать), help (помощь), invite (приглашения), demoVariants (сменить оформление/стиль), app (голосовой помощник).`;

  try {
    const base = import.meta.env.DEV
      ? '/api/openai'
      : (import.meta.env.VITE_OPENAI_PROXY_URL
          || (import.meta.env.VITE_SUPABASE_URL ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/openai-proxy` : null)
          || 'https://tocjbyeybddsfihvqbrk.supabase.co/functions/v1/openai-proxy');
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userText },
        ],
        tools: TOOLS,
        tool_choice: 'auto',
        max_tokens: 500,
      }),
    });

    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{
        message?: {
          content?: string | null;
          tool_calls?: Array<{
            function?: { name?: string; arguments?: string };
          }>;
        };
        finish_reason?: string;
      }>;
    };

    const choice = data.choices?.[0];
    const msg = choice?.message;
    if (!msg) return null;

    const textReply = msg.content?.trim() || undefined;
    const toolCalls = msg.tool_calls;
    if (toolCalls?.length) {
      const tc = toolCalls[0];
      const fn = tc.function;
      const name = fn?.name || '';
      let args: Record<string, unknown> = {};
      try {
        if (fn?.arguments) args = JSON.parse(fn.arguments) as Record<string, unknown>;
      } catch {
        // invalid JSON in tool arguments
      }
      const intent = toolNameToIntent(name, args, selectedContext);
      return { intent, textReply };
    }

    if (textReply) {
      return {
        intent: { type: 'unknown' },
        textReply,
      };
    }
    return null;
  } catch {
    return null;
  }
}
