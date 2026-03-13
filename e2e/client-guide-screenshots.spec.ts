import { test, expect } from '@playwright/test';

function uniqueEmail(): string {
  const ts = Date.now();
  return `client_guide_${ts}@example.com`;
}

const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/at7dQAAAABJRU5ErkJggg==',
  'base64',
);

test.use({ viewport: { width: 390, height: 844 } });

test('generate client guide screenshots', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('angelo-demo-mode', '0');
    localStorage.removeItem('token');
  });

  await page.goto('/');
  await page.screenshot({ path: 'docs/screenshots/01-welcome.png', fullPage: true });

  await page.getByRole('button', { name: 'Демо' }).click();
  await expect(page).toHaveURL(/\/classic\/feed/);
  await page.screenshot({ path: 'docs/screenshots/02-demo-feed.png', fullPage: true });

  await page.addInitScript(() => {
    localStorage.setItem('angelo-demo-mode', '0');
    localStorage.removeItem('token');
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page).toHaveURL(/\/register/);
  await page.screenshot({ path: 'docs/screenshots/03-register.png', fullPage: true });

  await page.getByLabel('Телефон или email').fill(uniqueEmail());
  await page.getByText('Я принимаю условия использования').click();
  await page.getByText('Я согласен на обработку персональных данных').click();
  await page.getByText('Я согласен на обработку данных (политика конфиденциальности)').click();
  await page.getByRole('button', { name: 'Получить код' }).click();

  await expect(page).toHaveURL(/\/confirm-code/);
  await page.screenshot({ path: 'docs/screenshots/04-confirm-code.png', fullPage: true });

  await page.locator('input').first().fill('000000');
  await page.getByRole('button', { name: 'Подтвердить' }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.screenshot({ path: 'docs/screenshots/05-onboarding.png', fullPage: true });

  await page.locator('input[type="file"]').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: png1x1,
  });
  await page.locator('#lastName').fill('Тестов');
  await page.locator('#firstName').fill('Клиент');
  await page.locator('#birthDate').fill('1990-01-01');
  await page.locator('#city').fill('Город');
  await page.locator('#about').fill('Пробный профиль');
  await page.screenshot({ path: 'docs/screenshots/06-onboarding-filled.png', fullPage: true });

  await page.getByRole('button', { name: 'Далее' }).click();
  await expect(page).toHaveURL(/\/classic\/tree/);
  await page.screenshot({ path: 'docs/screenshots/07-tree.png', fullPage: true });

  await page.getByRole('button', { name: 'Семья' }).click();
  await expect(page).toHaveURL(/\/classic\/family/);
  await page.getByRole('button', { name: 'Обо мне' }).click();
  await page.screenshot({ path: 'docs/screenshots/08-family-about-me.png', fullPage: true });

  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page).toHaveURL(/\/classic\/create/);
  await page.screenshot({ path: 'docs/screenshots/09-create-choose-type.png', fullPage: true });

  await page.getByRole('button', { name: 'Текст' }).click();
  await page.getByRole('combobox').click();
  await page.getByRole('option', { name: 'Истории' }).click();
  await page.getByPlaceholder('Название...').fill('Пробная публикация');
  await page.getByPlaceholder('Расскажите историю...').fill('Тестовый текст для проверки публикации');
  await page.screenshot({ path: 'docs/screenshots/10-create-text.png', fullPage: true });

  await page.getByRole('button', { name: 'Опубликовать' }).click();
  await expect(page).toHaveURL(/\/classic\/feed/);
  await page.screenshot({ path: 'docs/screenshots/11-feed-after-publish.png', fullPage: true });

  await page.getByRole('button', { name: 'Магазин' }).click();
  await expect(page).toHaveURL(/\/classic\/store/);
  await page.screenshot({ path: 'docs/screenshots/12-store.png', fullPage: true });
});

