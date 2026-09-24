// Generate public/og-image.png (1200x630) from public/og-image.svg using sharp.
// Fonts are bundled in public/fonts/ for deterministic output.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const svgPath = path.join(root, "public", "og-image.svg");
const fontDir = path.join(__dirname, "fonts");
const outPath = path.join(root, "public", "og-image.png");

async function fontToBase64(filename) {
  const buf = await fs.readFile(path.join(fontDir, filename));
  return buf.toString("base64");
}

async function main() {
  const [interVariable, jetBrainsMono] = await Promise.all([
    fontToBase64("Inter-Variable.ttf"),
    fontToBase64("JetBrainsMono-Regular.ttf"),
  ]);

  let svg = await fs.readFile(svgPath, "utf8");

  // Inter-Variable.ttf is a single variable-font TTF that exposes the full
  // weight axis; CSS picks 400 or 600 from the same file via font-weight.
  const fontFaceBlock = `
    <defs>
      <style type="text/css"><![CDATA[
        @font-face {
          font-family: 'Inter';
          font-weight: 100 900;
          font-style: normal;
          src: url('data:font/ttf;base64,${interVariable}') format('truetype');
        }
        @font-face {
          font-family: 'JetBrains Mono';
          font-weight: 400;
          font-style: normal;
          src: url('data:font/ttf;base64,${jetBrainsMono}') format('truetype');
        }
      ]]></style>
    </defs>`;

  // Inject after the opening <svg ...> tag.
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1>${fontFaceBlock}`);

  // Strip font-family="Inter, system-ui, sans-serif" overrides on the root <svg>
  // so the @font-face rules we just injected win consistently.
  svg = svg.replace(/font-family="Inter, system-ui, sans-serif"/g, 'font-family="Inter"');

  await sharp(Buffer.from(svg))
    .resize(1200, 630, { fit: "cover" })
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  const stat = await fs.stat(outPath);
  console.log(`og:image written -> ${path.relative(root, outPath)} (${stat.size} bytes)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});