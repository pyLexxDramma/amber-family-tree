import type { Intent } from './types';
import { resolvePersonQuery } from './intentRouter';

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
    default:
      return { type: 'unknown' };
  }
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
Если пользователь говорит «про него», «подробнее», «его фото» — имеется в виду уже выбранный человек (контекст).`;

  try {
    const res = await fetch('/api/openai/v1/chat/completions', {
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
      } catch {}
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
