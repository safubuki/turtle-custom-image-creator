// PWA アイコン生成スクリプト（scripts/icon-source.svg を各サイズの PNG に変換）
// 実行: node scripts/generate-icons.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const src = resolve(__dirname, 'icon-source.svg');
const outDir = resolve(root, 'public', 'icons');

const EMERALD = { r: 16, g: 185, b: 129, alpha: 1 };

const targets = [
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
  // マスカブル: セーフゾーン確保のため背景を全面に敷き、グリフを縮小配置
  { file: 'pwa-maskable-512x512.png', size: 512, maskable: true },
  { file: 'apple-touch-icon.png', size: 180, background: EMERALD },
];

const svg = await readFile(src);
await mkdir(outDir, { recursive: true });

for (const t of targets) {
  let pipeline;
  if (t.maskable) {
    // 80% のサイズに縮めて中央へ。周囲はブランドカラーで塗りつぶす。
    const inner = Math.round(t.size * 0.8);
    const glyph = await sharp(svg).resize(inner, inner).png().toBuffer();
    pipeline = sharp({
      create: {
        width: t.size,
        height: t.size,
        channels: 4,
        background: EMERALD,
      },
    }).composite([{ input: glyph, gravity: 'center' }]);
  } else if (t.background) {
    pipeline = sharp(svg)
      .resize(t.size, t.size)
      .flatten({ background: t.background });
  } else {
    pipeline = sharp(svg).resize(t.size, t.size);
  }
  const out = resolve(outDir, t.file);
  await pipeline.png().toFile(out);
  console.log(`generated ${t.file} (${t.size}px)`);
}

// SVG をそのままファビコン用にもコピー
await writeFile(resolve(root, 'public', 'icons', 'icon.svg'), svg);
console.log('done');
