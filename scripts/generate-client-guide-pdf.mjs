import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import { marked } from 'marked';

const repoRoot = process.cwd();
const docsDir = path.join(repoRoot, 'docs');
const mdPath = path.join(docsDir, 'client-testing-guide.md');
const htmlPath = path.join(docsDir, 'client-testing-guide.print.html');
const pdfPath = path.join(docsDir, 'client-testing-guide.pdf');

const md = await fs.readFile(mdPath, 'utf8');
const body = marked.parse(md);

const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Angelo — Гайд для заказчика</title>
    <style>
      :root { color-scheme: light; }
      html, body { padding: 0; margin: 0; }
      body { font: 14px/1.45 system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111; }
      .page { max-width: 900px; margin: 0 auto; padding: 28px 28px 40px; }
      h2, h3 { margin: 18px 0 10px; }
      h2 { font-size: 22px; }
      h3 { font-size: 16px; }
      p { margin: 8px 0; }
      ul { margin: 8px 0 8px 18px; padding: 0; }
      li { margin: 6px 0; }
      hr { border: 0; border-top: 1px solid #ddd; margin: 18px 0; }
      code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 0.95em; }
      pre { background: #f6f6f6; border: 1px solid #e6e6e6; border-radius: 10px; padding: 12px; overflow: auto; }
      img { max-width: 100%; height: auto; border-radius: 10px; border: 1px solid #e6e6e6; }
      @page { margin: 14mm; }
    </style>
  </head>
  <body>
    <div class="page">
      ${body}
    </div>
  </body>
</html>`;

await fs.writeFile(htmlPath, html, 'utf8');

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(pathToFileURL(htmlPath).toString(), { waitUntil: 'networkidle' });
await page.emulateMedia({ media: 'screen' });
await page.pdf({
  path: pdfPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '14mm', right: '14mm', bottom: '14mm', left: '14mm' },
});

await browser.close();

console.log(pdfPath);

