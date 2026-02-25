import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import { join } from 'path';

const BASE = 'http://localhost:8080';
const OUT_DIR = join(process.cwd(), 'docs', 'screenshots');
const MOBILE_DIR = join(process.cwd(), 'docs', 'screenshots-mobile');
const VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 390, height: 844 };

const PAGES = [
  { path: '/', name: '01-welcome', desc: 'Главная — приветствие, вход, регистрация, демо' },
  { path: '/login', name: '02-login', desc: 'Вход — телефон или email' },
  { path: '/register', name: '03-register', desc: 'Регистрация — создание аккаунта' },
  { path: '/classic/feed?demo=full', name: '04-feed', desc: 'Лента — публикации семьи, фильтры' },
  { path: '/classic/tree', name: '05-tree', desc: 'Дерево — семейное древо по поколениям' },
  { path: '/classic/publication/p1', name: '06-publication', desc: 'Публикация — фото, описание, озвучка (Журнал+Плеер)' },
  { path: '/classic/create', name: '07-create', desc: 'Создать — новая публикация (фото, видео, аудио, текст)' },
  { path: '/classic/family', name: '08-family', desc: 'Семья — список членов, Обо мне, Пригласить' },
  { path: '/classic/my-profile', name: '09-my-profile', desc: 'Мой профиль — фото, данные, публикации' },
  { path: '/classic/profile/m1', name: '10-contact-profile', desc: 'Профиль контакта — карточка родственника' },
  { path: '/classic/invite', name: '11-invite', desc: 'Приглашения — пригласить родственников' },
  { path: '/classic/store', name: '12-store', desc: 'Магазин — тарифы и подписки' },
  { path: '/classic/places', name: '13-places', desc: 'Места — места на карте' },
  { path: '/classic/settings', name: '14-settings', desc: 'Настройки — тема, уведомления, оформление' },
  { path: '/classic/help', name: '15-help', desc: 'Помощь — FAQ, краткая инструкция с озвучкой' },
  { path: '/classic/demo-variants', name: '16-demo-variants', desc: 'Варианты оформления — Журнал, Классика, Ретро и др.' },
  { path: '/app', name: '17-angelo', desc: 'Angelo — голосовой помощник' },
];

async function capture(context, outDir) {
  const page = await context.newPage();
  for (const { path, name, desc } of PAGES) {
    const url = path.startsWith(BASE) ? path : `${BASE}${path}`;
    console.log(`Screenshot: ${name} — ${desc}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(800);
    await page.screenshot({ path: join(outDir, `${name}.png`), fullPage: true });
  }
  await page.close();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(MOBILE_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  const initScript = () => {
    localStorage.setItem('angelo-demo-ui-variant', 'journal');
    localStorage.setItem('angelo-demo-full', '1');
  };

  try {
    const desktopContext = await browser.newContext({
      viewport: VIEWPORT,
      locale: 'ru-RU',
    });
    await desktopContext.addInitScript(initScript);
    console.log('Desktop screenshots...');
    await capture(desktopContext, OUT_DIR);
    await desktopContext.close();

    const mobileContext = await browser.newContext({
      viewport: MOBILE_VIEWPORT,
      locale: 'ru-RU',
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    await mobileContext.addInitScript(initScript);
    console.log('\nMobile screenshots...');
    await capture(mobileContext, MOBILE_DIR);
    await mobileContext.close();

    console.log(`\nDone. Desktop: ${OUT_DIR}`);
    console.log(`Mobile: ${MOBILE_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
