import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const srcRef = path.join(root, '_ref/Демо/Медиа для демо аккаунта + описание/Медиа для демо аккаунта + описание');
const destMedia = path.join(root, 'public/demo/media');
const destFeed = path.join(root, 'public/demo/feed');
const protoDir = path.join(root, 'public/prototype');

const DEMO_MEDIA_FILES = ['Фото 1.jpg', 'Фото 2.png', 'Фото 3.png', 'Фото 4.png', 'Фото 5.png', 'Фото 6.png', 'Фото7.png'];
const PHOTO_TO_LATIN = {
  'Фото 1.jpg': 'photo1.jpg',
  'Фото 2.png': 'photo2.png',
  'Фото 3.png': 'photo3.png',
  'Фото 4.png': 'photo4.png',
  'Фото 5.png': 'photo5.png',
  'Фото 6.png': 'photo6.png',
  'Фото7.png': 'photo7.png',
};
const PROTO_FALLBACK = [
  { dir: protoDir, file: 'pub-birthday.png' },
  { dir: protoDir, file: 'pub-village.png' },
  { dir: protoDir, file: 'pub-family-old.png' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-travel.jpg' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-family.jpg' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-childhood.jpg' },
  { dir: protoDir, file: 'feed.jpeg' },
];
const FEED_SOURCES = [
  ...DEMO_MEDIA_FILES.map((f, i) => {
    const p = path.join(destMedia, f);
    if (fs.existsSync(p)) return { dir: destMedia, file: f };
    return PROTO_FALLBACK[i];
  }),
  { dir: protoDir, file: 'pub-birthday.png' },
  { dir: protoDir, file: 'pub-village.png' },
  { dir: protoDir, file: 'pub-family-old.png' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-travel.jpg' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-family.jpg' },
  { dir: path.join(protoDir, 'my-media'), file: 'photo-childhood.jpg' },
  { dir: protoDir, file: 'feed.jpeg' },
  { dir: protoDir, file: 'family.jpeg' },
  { dir: protoDir, file: 'publication.jpeg' },
  { dir: protoDir, file: 'tree-hero.png' },
];
const MIN_FEED_COUNT = 25;

if (fs.existsSync(srcRef)) {
  fs.mkdirSync(destMedia, { recursive: true });
  const files = fs.readdirSync(srcRef).filter(f => /\.(jpg|jpeg|png|mp3|mp4)$/i.test(f));
  for (const f of files) {
    fs.copyFileSync(path.join(srcRef, f), path.join(destMedia, f));
  }
  console.log(`Copied ${files.length} demo media files to public/demo/media`);
}
fs.mkdirSync(destMedia, { recursive: true });
for (const [cyrillic, latin] of Object.entries(PHOTO_TO_LATIN)) {
  const src = path.join(destMedia, cyrillic);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(destMedia, latin));
  }
}

if (process.env.SKIP_DEMO_FEED === 'true') {
  process.exit(0);
}

fs.mkdirSync(destFeed, { recursive: true });
const feedImages = [];
for (const { dir, file } of FEED_SOURCES) {
  const srcPath = path.join(dir, file);
  if (fs.existsSync(srcPath)) feedImages.push(srcPath);
}
while (feedImages.length < MIN_FEED_COUNT) {
  feedImages.push(feedImages[feedImages.length % feedImages.length]);
}
for (let i = 0; i < feedImages.length; i++) {
  fs.copyFileSync(feedImages[i], path.join(destFeed, `${i + 1}.jpg`));
}
console.log(`Created public/demo/feed with ${feedImages.length} images`);
