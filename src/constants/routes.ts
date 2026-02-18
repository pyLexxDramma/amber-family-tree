/** Базовый путь классического UI (дерево, лента, настройки и т.д.). По умолчанию / — AiShell. */
export const CLASSIC_BASE = '/classic';

export const ROUTES = {
  home: '/',
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
    settings: `${CLASSIC_BASE}/settings`,
    help: `${CLASSIC_BASE}/help`,
  },
  welcome: '/welcome',
  login: '/login',
  register: '/register',
} as const;
