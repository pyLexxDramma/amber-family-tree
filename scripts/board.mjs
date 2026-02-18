#!/usr/bin/env node
/**
 * Доска: разложи по колонкам, поставь дедлайны/прогресс, merge карточек.
 * Использование:
 *   node scripts/board.mjs columns [--file=path]
 *   node scripts/board.mjs deadlines [--due=YYYY-MM-DD] [--progress=0-100] [--column=name]
 *   node scripts/board.mjs merge [--file=path]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BOARD_PATH = path.join(__dirname, '..', 'docs', 'board', 'cards.json');

const COLUMNS = ['backlog', 'todo', 'progress', 'review', 'done'];
const TAGS = ['backend', 'frontend', 'devops', 'bug', 'other'];

function loadBoard() {
  const raw = fs.readFileSync(BOARD_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveBoard(board) {
  board.meta.updated = new Date().toISOString().slice(0, 10);
  fs.writeFileSync(BOARD_PATH, JSON.stringify(board, null, 2) + '\n', 'utf8');
}

function parseArgs() {
  const args = process.argv.slice(2);
  const cmd = args[0];
  const opts = {};
  for (let i = 1; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      opts[k] = v === undefined ? true : v;
    }
  }
  return { cmd, opts };
}

// Разложи по колонкам: применить маппинг id → column
function cmdColumns(board, opts) {
  let mapping = {};
  if (opts.file) {
    const p = path.resolve(process.cwd(), opts.file);
    mapping = JSON.parse(fs.readFileSync(p, 'utf8'));
  }
  if (Object.keys(mapping).length === 0) {
    console.log('Columns: передайте --file=path/to/mapping.json с объектом { "id": "column", ... }');
    return;
  }
  for (const card of board.cards) {
    if (mapping[card.id] && COLUMNS.includes(mapping[card.id])) {
      card.column = mapping[card.id];
    }
  }
  saveBoard(board);
  console.log('Колонки обновлены по маппингу.');
}

// Поставь дедлайны/прогресс
function cmdDeadlines(board, opts) {
  const due = opts.due || '2026-02-26';
  const progress = opts.progress !== undefined ? parseInt(opts.progress, 10) : undefined;
  const column = opts.column;
  let n = 0;
  for (const card of board.cards) {
    if (column && card.column !== column) continue;
    if (due) { card.due = due; n++; }
    if (progress !== undefined && progress >= 0 && progress <= 100) { card.progress = progress; n++; }
  }
  saveBoard(board);
  console.log(`Обновлено карточек: ${n} (due=${due}${progress !== undefined ? `, progress=${progress}` : ''}${column ? `, column=${column}` : ''}).`);
}

function readStdin() {
  return new Promise((resolve, reject) => {
    const chunks = [];
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => chunks.push(c));
    process.stdin.on('end', () => resolve(chunks.join('').trim()));
    process.stdin.on('error', reject);
  });
}

// Merge: входящий массив карточек по id
async function cmdMerge(board, opts) {
  let incoming = [];
  if (opts.file) {
    const p = path.resolve(process.cwd(), opts.file);
    incoming = JSON.parse(fs.readFileSync(p, 'utf8'));
  } else {
    const str = await readStdin();
    if (str) incoming = JSON.parse(str);
  }
  if (!Array.isArray(incoming)) incoming = [incoming];
  const byId = new Map(board.cards.map(c => [c.id, c]));
  for (const c of incoming) {
    const id = c.id || c.title?.slice(0, 20);
    if (!id) continue;
    const existing = byId.get(id);
    if (existing) {
      if (c.column !== undefined) existing.column = c.column;
      if (c.title !== undefined) existing.title = c.title;
      if (c.tag !== undefined) existing.tag = c.tag;
      if (c.desc !== undefined) existing.desc = c.desc;
      if (c.pay !== undefined) existing.pay = c.pay;
      if (c.due !== undefined) existing.due = c.due;
      if (c.progress !== undefined) existing.progress = c.progress;
    } else {
      const newCard = { id, column: c.column || 'backlog', title: c.title || id, tag: c.tag || 'other' };
      if (c.desc !== undefined) newCard.desc = c.desc;
      if (c.pay !== undefined) newCard.pay = c.pay;
      if (c.due !== undefined) newCard.due = c.due;
      if (c.progress !== undefined) newCard.progress = c.progress;
      board.cards.push(newCard);
      byId.set(id, newCard);
    }
  }
  saveBoard(board);
  console.log(`Merge: обработано ${incoming.length} карточек. Всего карточек: ${board.cards.length}.`);
}

const { cmd, opts } = parseArgs();
const board = loadBoard();

(async () => {
  try {
    switch (cmd) {
      case 'columns':
        cmdColumns(board, opts);
        break;
      case 'deadlines':
        cmdDeadlines(board, opts);
        break;
      case 'merge':
        await cmdMerge(board, opts);
        break;
      default:
        console.log(`
Доска: columns | deadlines | merge

  columns    --file=path   применить маппинг id→column из JSON
  deadlines  [--due=YYYY-MM-DD] [--progress=0-100] [--column=name]
  merge      [--file=path] или stdin   обновить/добавить карточки по id
`);
        break;
    }
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
})();
