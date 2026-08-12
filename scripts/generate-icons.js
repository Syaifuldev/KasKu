/**
 * Script generate ikon PWA dari icon.png
 * Jalankan: node scripts/generate-icons.js
 * Requires: npm install sharp -D (sementara untuk generate)
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputFile = path.join(__dirname, "../public/icon.png");
const outputDir = path.join(__dirname, "../public/icons");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generate() {
  for (const size of sizes) {
    await sharp(inputFile)
      .resize(size, size, { fit: "contain", background: { r: 16, g: 185, b: 129, alpha: 1 } })
      .png()
      .toFile(path.join(outputDir, `icon-${size}x${size}.png`));
    console.log(`✓ icon-${size}x${size}.png`);
  }
  console.log("\n✅ Semua ikon PWA berhasil dibuat di public/icons/");
}

generate().catch(console.error);
