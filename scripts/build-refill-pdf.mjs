/**
 * Builds public/how-to-refill-bottles.pdf from scripts/refill-manual.jpg
 * (JPEG export of the “How Refill Works” comic — filename kept as .jpg).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "refill-manual.jpg");
const out = path.join(__dirname, "..", "public", "how-to-refill-bottles.pdf");

const bytes = fs.readFileSync(src);
const pdfDoc = await PDFDocument.create();
const image = await pdfDoc.embedJpg(bytes);
const { width, height } = image;
const page = pdfDoc.addPage([width, height]);
page.drawImage(image, { x: 0, y: 0, width, height });
fs.writeFileSync(out, await pdfDoc.save());

console.log("[build-refill-pdf] wrote", out);
