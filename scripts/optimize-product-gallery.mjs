/**
 * Generates high-quality WebP + @2x WebP from public/product-slide-*.png for retina srcset.
 * Run automatically before `vite build` (see package.json).
 */
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(__dirname, "..", "public");
const stems = ["product-slide-01", "product-slide-02", "product-slide-03"];

for (const stem of stems) {
  const input = path.join(pub, `${stem}.png`);
  const meta = await sharp(input).metadata();
  const w = meta.width ?? 683;
  const h = meta.height ?? 1024;

  await sharp(input)
    .webp({ quality: 96, effort: 6, smartSubsample: true })
    .toFile(path.join(pub, `${stem}.webp`));

  await sharp(input)
    .resize(w * 2, h * 2, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
    })
    .webp({ quality: 93, effort: 6, smartSubsample: true })
    .toFile(path.join(pub, `${stem}@2x.webp`));
}

console.log("[optimize-product-gallery] wrote .webp and @2x.webp for", stems.length, "slides");
