/** Базовый путь классического UI (дерево, лента, настройки и т.д.). */
export const CLASSIC_BASE = '/classic';

export const ROUTES = {
  /** Главная страница сайта — приветствие/вход */
  home: '/',
  demo: '/demo',
  demoPreview: '/demo-preview',
  demoLogin: '/demo-login',
  /** Голосовой помощник (AiShell) */
  app: '/app',
  classic: {
    tree: `${CLASSIC_BASE}/tree`,
    timeline: `${CLASSIC_BASE}/timeline`,
    timelineYear: (year: string) => `${CLASSIC_BASE}/timeline/year/${year}`,
    timelineDecade: (decadeStart: string) => `${CLASSIC_BASE}/timeline/decade/${decadeStart}`,
    feed: `${CLASSIC_BASE}/feed`,
    create: `${CLASSIC_BASE}/create`,
    albums: `${CLASSIC_BASE}/albums`,
    album: (id: string) => `${CLASSIC_BASE}/albums/${id}`,
    family: `${CLASSIC_BASE}/family`,
    myProfile: `${CLASSIC_BASE}/my-profile`,
    editMyProfile: `${CLASSIC_BASE}/my-profile/edit`,
    createMemberProfile: `${CLASSIC_BASE}/family/create-member`,
    myMedia: `${CLASSIC_BASE}/my-media`,
    profile: (id: string) => `${CLASSIC_BASE}/profile/${id}`,
    editMemberProfile: (id: string) => `${CLASSIC_BASE}/profile/${id}/edit`,
    messagesHub: `${CLASSIC_BASE}/messages`,
    messages: (id: string) => `${CLASSIC_BASE}/messages/${id}`,
    messagesGroup: (id: string) => `${CLASSIC_BASE}/messages-group/${id}`,
    contactRequests: `${CLASSIC_BASE}/contact-requests`,
    publication: (id: string) => `${CLASSIC_BASE}/publication/${id}`,
    invite: `${CLASSIC_BASE}/invite`,
    store: `${CLASSIC_BASE}/store`,
    places: `${CLASSIC_BASE}/places`,
    settings: `${CLASSIC_BASE}/settings`,
    terms: `${CLASSIC_BASE}/terms`,
    privacy: `${CLASSIC_BASE}/privacy`,
    help: `${CLASSIC_BASE}/help`,
  },
  welcome: '/welcome',
  login: '/login',
  register: '/register',
} as const;
