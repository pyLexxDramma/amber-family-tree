import type { Intent } from './types';
import { mockMembers } from '@/data/mock-members';

const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ');

const MIN_STEM_LEN = 3;
const MAX_STEM_LEN = 4;
const LAST_NAME_STEM_LEN = 5;

/** Name stem for matching case forms (e.g. ольга/ольгу). Length 3–4 to avoid Anna vs Andrey. */
function firstNameStem(firstName: string): string {
  const lower = firstName.toLowerCase();
  const len = Math.min(MAX_STEM_LEN, Math.max(MIN_STEM_LEN, lower.length));
  return lower.slice(0, len);
}

/** Last name stem for disambiguation (e.g. соколову vs кузнецову). */
function lastNameStem(lastName: string): string {
  return lastName.toLowerCase().slice(0, LAST_NAME_STEM_LEN);
}

/** Map "дедушка"/"Ольгу Соколову"/"дядю Сашу" etc to member id. Exported for tests. */
export function resolvePersonQuery(query: string): string | undefined {
  const q = normalize(query);
  const words = q.split(/\s+/).filter(Boolean);

  // 1) Direct nickname match (skip empty nickname so we don't match q.includes(''))
  const byNick = mockMembers.find(
    (m) => {
      const nick = m.nickname?.toLowerCase().trim();
      if (!nick) return false;
      return nick.includes(q) || q.includes(nick);
    }
  );
  if (byNick) return byNick.id;

  // 2) Exact first name or query contains full first name
  const byFirstExact = mockMembers.find(
    (m) => m.firstName.toLowerCase() === q || q.includes(m.firstName.toLowerCase())
  );
  if (byFirstExact) return byFirstExact.id;

  // 3) Match by first-name stem (e.g. "ольгу" -> stem "ольг" matches "Ольга")
  const firstWord = words[0] ?? '';
  const secondWord = words[1] ?? '';
  const candidates = mockMembers.filter((m) => {
    const stem = firstNameStem(m.firstName);
    return (
      firstWord.startsWith(stem) ||
      stem.startsWith(firstWord.slice(0, MIN_STEM_LEN)) ||
      firstWord.includes(stem)
    );
  });

  if (candidates.length === 0) {
    // Diminutive "Саша"/"Сашу" -> Александр (m10)
    if (words.some((w) => w.startsWith('саш'))) {
      const alex = mockMembers.find((m) => m.firstName === 'Александр');
      if (alex) return alex.id;
    }
    // Role keywords: дедушка / бабушка (no \\b so Cyrillic matches)
    if (/(дедушк|дед|grandpa|патриарх)/.test(q)) {
      const grandpa = mockMembers.find((m) => m.generation === 1 && m.firstName === 'Николай');
      return grandpa?.id;
    }
    if (/(бабушк|баб|grandma)/.test(q)) {
      const grandma = mockMembers.find((m) => m.generation === 1 && m.firstName === 'Мария');
      return grandma?.id;
    }
    return undefined;
  }

  if (candidates.length === 1) return candidates[0].id;

  // 4) Multiple candidates: disambiguate by last name (second word in query)
  if (secondWord) {
    const byLastName = candidates.find((m) => {
      const memberStem = lastNameStem(m.lastName);
      const queryStem = secondWord.slice(0, LAST_NAME_STEM_LEN);
      return memberStem.startsWith(queryStem) || queryStem.startsWith(memberStem);
    });
    if (byLastName) return byLastName.id;
  }
  return candidates[0].id;
}

export function routeIntent(userText: string, selectedContext?: string | null): Intent {
  const text = normalize(userText);
  if (!text) return { type: 'unknown' };

  // "про него" / "его фото" / "расскажи подробнее" — use selected context (без \b для кириллицы)
  if (
    selectedContext &&
    /(про\s*него|его\s*фото|о\s*нём|про\s*неё|её\s*фото|подробнее|расскажи\s*подробнее|покажи\s*его\s*фото)/.test(text)
  ) {
    return { type: 'show_person', entity: selectedContext };
  }

  // Greeting
  if (/^(привет|здравствуй|добрый|хай|hello|hi|приветствую)/.test(text) || text === 'привет') {
    return { type: 'greeting' };
  }

  // Show tree — обязательно раньше "покажи [кого-то]". Без \b, чтобы кириллица матчилась.
  const isTreeIntent =
    /(покажи|покаж|открой|смотри)\s*(семейное\s*)?дерево/.test(text) ||
    /дерево\s*(семьи)?/.test(text) ||
    /(family\s*)?tree/.test(text) ||
    (/дерево/.test(text) && (/(покажи|покаж|открой|смотри)/.test(text) || text.split(/\s+/).length <= 3));
  if (isTreeIntent) {
    return { type: 'show_tree' };
  }

  // Show person — "расскажи про дедушку", "кто такой Лука", "покажи Анжело" (не "покажи дерево")
  const personMatch = text.match(/(расскажи\s*про|кто\s*такой|покажи|про)\s*(.+?)(?:\?|$)/) ||
    text.match(/(дедушк|бабушк|никола|марию|дмитри|елену|анну|андрея|свету|максима|ксению|вику|артём|артема|ольг)/u);
  const personQuery = personMatch ? (personMatch[2]?.trim() || personMatch[0]) : text;
  const treeWords = /(дерево|деревья|tree)/;
  if (treeWords.test(personQuery)) {
    return { type: 'show_tree' };
  }
  const personId = resolvePersonQuery(personQuery);
  if (personId) {
    return { type: 'show_person', entity: personId };
  }
  // Fallback: "кто такой ..." / "расскажи про ..." без распознанного имени — не подставляем первого человека
  // (убрано: иначе "покажи дерево" могло давать show_person)

  // Show feed (без \b для кириллицы)
  if (
    /(что\s*нового|лента|новости|публикации|feed|что\s*новенького)/.test(text) ||
    /(покажи|открой)\s*(лент|новости|feed)/.test(text)
  ) {
    return { type: 'show_feed' };
  }

  // Search media / gallery
  if (/(фото|видео|медиа|галерея|найди\s*фото|покажи\s*фото|поиск\s*медиа)/.test(text)) {
    return { type: 'search_media' };
  }

  // Create publication
  if (/(создай|создать)\s*(публикацию|пост|историю)|добавить\s*(пост|историю)|новая\s*публикация/.test(text)) {
    return { type: 'create_publication' };
  }

  // Help (без \b для кириллицы)
  if (/(помоги|помощь|help|что\s*умеешь|что\s*ты\s*умеешь|что\s*ты\s*можешь|какие\s*команды)/.test(text)) {
    return { type: 'help' };
  }

  // Change UI variant / оформление
  if (/(смени|переключи|поменяй|выбери)\s*(оформление|интерфейс|стиль|вариант)/.test(text)) {
    return { type: 'navigate_to', entity: 'demoVariants' };
  }

  // Invite
  if (/(пригласи|пригласить)\s*(присоединиться|родственн|в\s*семью)?/.test(text)) {
    return { type: 'navigate_to', entity: 'invite' };
  }

  // Navigate to page
  if (/(открой|перейди|перейти|покажи)\s*(настройки|settings)/.test(text)) {
    return { type: 'navigate_to', entity: 'settings' };
  }
  if (/(открой|перейди|перейти|покажи)\s*(магазин|store|подписк)/.test(text)) {
    return { type: 'navigate_to', entity: 'store' };
  }
  if (/(открой|перейди|перейти|покажи)\s*(профиль|мой\s*профиль)/.test(text)) {
    return { type: 'navigate_to', entity: 'profile' };
  }
  if (/(открой|перейди|перейти|покажи)\s*(семь|контакт|список\s*семьи)/.test(text)) {
    return { type: 'navigate_to', entity: 'family' };
  }
  if (/(открой|перейди|перейти)\s*(лент|новости|feed)/.test(text)) {
    return { type: 'navigate_to', entity: 'feed' };
  }
  if (/(открой|перейди|перейти)\s*(пригла|invite)/.test(text)) {
    return { type: 'navigate_to', entity: 'invite' };
  }

  // Go back
  if (/^(назад|вернись|вернуться|обратно|back)$/.test(text)) {
    return { type: 'go_back' };
  }

  // Scroll
  if (/(пролистай|прокрути|скролл|листай)\s*(вниз|ниже|дальше|down)?/.test(text) || /^(вниз|ниже|дальше)$/.test(text)) {
    return { type: 'scroll', entity: 'down' };
  }
  if (/(пролистай|прокрути|скролл|листай)\s*(вверх|наверх|выше|up)/.test(text) || /^(вверх|наверх|выше)$/.test(text)) {
    return { type: 'scroll', entity: 'up' };
  }

  // Toggle theme
  if (/(тёмн|темн|dark)\s*(тем|режим|mode)?/.test(text)) {
    return { type: 'toggle_theme', entity: 'dark' };
  }
  if (/(светл|light)\s*(тем|режим|mode)?/.test(text)) {
    return { type: 'toggle_theme', entity: 'light' };
  }
  if (/(смени|переключи|поменяй)\s*тем/.test(text)) {
    return { type: 'toggle_theme', entity: 'toggle' };
  }

  return { type: 'unknown' };
}
