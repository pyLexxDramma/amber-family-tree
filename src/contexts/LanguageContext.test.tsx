import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';

function TestConsumer() {
  const { locale, setLocale, t } = useLanguage();
  return (
    <div>
      <span data-testid="locale">{locale}</span>
      <span data-testid="back">{t('back')}</span>
      <button type="button" onClick={() => setLocale('en')}>Set EN</button>
      <button type="button" onClick={() => setLocale('ru')}>Set RU</button>
    </div>
  );
}

describe('LanguageContext', () => {
  beforeEach(() => {
    localStorage.removeItem('angelo-locale');
  });

  it('provides default locale ru and translations', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    expect(screen.getByTestId('locale')).toHaveTextContent('ru');
    expect(screen.getByTestId('back')).toHaveTextContent('Назад');
  });

  it('setLocale updates locale and t() returns new language', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => { screen.getByText('Set EN').click(); });
    expect(screen.getByTestId('locale')).toHaveTextContent('en');
    expect(screen.getByTestId('back')).toHaveTextContent('Back');
    act(() => { screen.getByText('Set RU').click(); });
    expect(screen.getByTestId('locale')).toHaveTextContent('ru');
  });

  it('persists locale to localStorage', () => {
    render(
      <LanguageProvider>
        <TestConsumer />
      </LanguageProvider>
    );
    act(() => { screen.getByText('Set EN').click(); });
    expect(localStorage.getItem('angelo-locale')).toBe('en');
  });
});
