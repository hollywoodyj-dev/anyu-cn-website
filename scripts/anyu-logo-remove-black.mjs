/**
 * 将安语标 PNG 中近黑底转为透明（设计稿常导出为黑底位图，浏览器无法当透明用）。
 * 源文件：public/anyu/anyu-logo-source.png → 输出：public/anyu/anyu-logo-mark.png
 * 使用：node scripts/anyu-logo-remove-black.mjs
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const inputPath = path.join(root, "public/anyu/anyu-logo-source.png");
const outPath = path.join(root, "public/anyu/anyu-logo-mark.png");

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // 近黑、低饱和小块视为底（不碰彩色心形/手/桥）
    if (luma < 38 && max - min < 28) {
      data[i + 3] = 0;
    }
  }
}

const max = 200;
const scale = w > h ? { width: max } : { height: max };
await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .png({ compressionLevel: 9, effort: 10 })
  .resize({ ...scale, withoutEnlargement: true, fit: "inside" })
  .toFile(outPath);

const meta = await sharp(outPath).metadata();
console.log("OK →", outPath, `${meta.width}×${meta.height}`);
