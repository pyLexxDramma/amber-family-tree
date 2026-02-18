import { describe, it, expect } from 'vitest';
import { routeIntent, resolvePersonQuery } from './intentRouter';

describe('resolvePersonQuery (direct)', () => {
  it('"ольгу соколову" → m11 (Olga)', () => {
    expect(resolvePersonQuery('ольгу соколову')).toBe('m11');
  });
  it('"бабушку" → m2 (Maria)', () => {
    expect(resolvePersonQuery('бабушку')).toBe('m2');
  });
  it('"дедушку" → m1 (Nikolai)', () => {
    expect(resolvePersonQuery('дедушку')).toBe('m1');
  });
});

describe('routeIntent — person resolution', () => {
  it('«Расскажи про Ольгу Соколову» → Ольга Кузнецова (m11)', () => {
    const intent = routeIntent('Расскажи про Ольгу Соколову');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m11');
  });

  it('«Расскажи про Александра» → Александр Соколов (m10)', () => {
    const intent = routeIntent('Расскажи про Александра');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m10');
  });

  it('«про дядю Сашу» → Александр Соколов (m10)', () => {
    const intent = routeIntent('расскажи про дядю Сашу');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m10');
  });

  it('«Расскажи про бабушку» → Мария (m2)', () => {
    const intent = routeIntent('Расскажи про бабушку');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m2');
  });

  it('«Расскажи про дедушку» → Николай (m1)', () => {
    const intent = routeIntent('Расскажи про дедушку');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m1');
  });

  it('«Покажи дерево» → show_tree', () => {
    const intent = routeIntent('Покажи дерево');
    expect(intent.type).toBe('show_tree');
  });

  it('«покажи дерево» (lowercase) → show_tree', () => {
    const intent = routeIntent('покажи дерево');
    expect(intent.type).toBe('show_tree');
  });

  it('«расскажи подробнее» при выбранном контексте → show_person с этим контекстом', () => {
    const intent = routeIntent('расскажи подробнее', 'm11');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m11');
  });

  it('«покажи его фото» при выбранном контексте → show_person', () => {
    const intent = routeIntent('покажи его фото', 'm3');
    expect(intent.type).toBe('show_person');
    expect(intent.entity).toBe('m3');
  });
});
