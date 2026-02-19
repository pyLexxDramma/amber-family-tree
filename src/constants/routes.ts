/** Базовый путь классического UI (дерево, лента, настройки и т.д.). */
export const CLASSIC_BASE = '/classic';

export const ROUTES = {
  /** Главная страница сайта — приветствие/вход */
  home: '/',
  /** Голосовой помощник (AiShell) */
  app: '/app',
  classic: {
    tree: `${CLASSIC_BASE}/tree`,
    feed: `${CLASSIC_BASE}/feed`,
    create: `${CLASSIC_BASE}/create`,
    family: `${CLASSIC_BASE}/family`,
    myProfile: `${CLASSIC_BASE}/my-profile`,
    profile: (id: string) => `${CLASSIC_BASE}/profile/${id}`,
    publication: (id: string) => `${CLASSIC_BASE}/publication/${id}`,
    invite: `${CLASSIC_BASE}/invite`,
    store: `${CLASSIC_BASE}/store`,
    places: `${CLASSIC_BASE}/places`,
    settings: `${CLASSIC_BASE}/settings`,
    help: `${CLASSIC_BASE}/help`,
  },
  welcome: '/welcome',
  login: '/login',
  register: '/register',
} as const;
