import { test, expect } from '@playwright/test';

function uniqueEmail(): string {
  const ts = Date.now();
  return `e2e_${ts}@example.com`;
}

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/at7dQAAAABJRU5ErkJggg==',
  'base64',
);

test('smoke: register -> onboarding -> nav -> create text publication', async ({ page, baseURL }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const http500: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => pageErrors.push(String(err)));
  page.on('response', res => {
    const status = res.status();
    if (status >= 500) http500.push(`${status} ${res.request().method()} ${res.url()}`);
  });

  await page.addInitScript(() => {
    localStorage.setItem('angelo-demo-mode', '0');
    localStorage.removeItem('token');
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();

  await page.getByLabel('Телефон или email').fill(uniqueEmail());
  await page.getByText('Я принимаю условия использования').click();
  await page.getByText('Я согласен на обработку персональных данных').click();
  await page.getByText('Я согласен на обработку данных (политика конфиденциальности)').click();
  await page.getByRole('button', { name: 'Получить код' }).click();

  await expect(page).toHaveURL(/\/confirm-code/);
  await page.locator('input').first().fill('000000');
  await page.getByRole('button', { name: 'Подтвердить' }).click();

  await expect(page).toHaveURL(/\/onboarding/);

  await page.locator('input[type="file"]').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: png1x1,
  });

  await page.locator('#lastName').fill('Тестов');
  await page.locator('#firstName').fill('Е2Е');
  await page.locator('#birthDate').fill('1990-01-01');
  await page.locator('#city').fill('Тестоград');
  await page.locator('#about').fill('e2e smoke');
  await page.getByRole('button', { name: 'Далее' }).click();

  await expect(page).toHaveURL(/\/classic\/tree/);

  await page.getByRole('button', { name: 'Семья' }).click();
  await page.getByRole('button', { name: 'Обо мне' }).click();
  await expect(page.locator('img').first()).toHaveAttribute('src', /angelo-media|prototype|demo/);

  await page.getByRole('button', { name: 'Лента' }).click();
  await expect(page).toHaveURL(/\/classic\/feed/);

  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page).toHaveURL(/\/classic\/create/);
  await page.getByRole('button', { name: 'Текст' }).click();

  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Истории' }).click();
  await page.getByPlaceholder('Название...').fill('E2E публикация');
  await page.getByPlaceholder('Расскажите историю...').fill('Проверка кликов и переходов');
  await page.getByRole('button', { name: 'Опубликовать' }).click();

  await expect(page).toHaveURL(/\/classic\/feed/);

  await page.getByRole('button', { name: 'Магазин' }).click();
  await expect(page).toHaveURL(/\/classic\/store/);

  await page.getByRole('button', { name: 'Дерево' }).click();
  await expect(page).toHaveURL(/\/classic\/tree/);

  expect(http500, `HTTP 5xx responses on ${baseURL}`).toEqual([]);
  expect(pageErrors, 'Unhandled page errors').toEqual([]);
  expect(consoleErrors, 'Console errors').toEqual([]);
});

