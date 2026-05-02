/**
 * Builds public/how-refill-works.pdf from public/how-refill-works.png
 * so “How refill” opens in the same native PDF viewer as the user manual.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const pngPath = path.join(root, "public", "how-refill-works.png");
const out = path.join(root, "public", "how-refill-works.pdf");

if (!fs.existsSync(pngPath)) {
  console.error("[build-refill-pdf] missing", pngPath);
  process.exit(1);
}

const bytes = fs.readFileSync(pngPath);
const pdfDoc = await PDFDocument.create();
/** File may be JPEG with .png extension (mis-labelled export). */
const isPng =
  bytes.length >= 8 &&
  bytes[0] === 0x89 &&
  bytes[1] === 0x50 &&
  bytes[2] === 0x4e &&
  bytes[3] === 0x47;
const image = isPng ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes);
const { width, height } = image;
const page = pdfDoc.addPage([width, height]);
page.drawImage(image, { x: 0, y: 0, width, height });
fs.writeFileSync(out, await pdfDoc.save());

console.log("[build-refill-pdf] wrote", out);
