import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, '../_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание');
const dest = path.join(__dirname, '../public/demo/media');

if (!fs.existsSync(src)) {
  console.log('_ref demo media not found, skipping copy');
  process.exit(0);
}

fs.mkdirSync(dest, { recursive: true });
const files = fs.readdirSync(src).filter(f => /\.(jpg|jpeg|png|mp3|mp4)$/i.test(f));
for (const f of files) {
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
}
console.log(`Copied ${files.length} demo media files to public/demo/media`);
