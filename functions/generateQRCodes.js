import QRCode from "qrcode";
import fs from "fs";

// Load riddles
const riddles = JSON.parse(fs.readFileSync("./riddles.json", "utf-8")).sequence;

// Where to save QR images
const outDir = "./qrcodes";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Generate QR for each riddle.id
(async () => {
  for (const r of riddles) {
    const outPath = `${outDir}/qr_${r.id}.png`;
    await QRCode.toFile(outPath, r.id.toString());
    console.log(`✅ QR generated: ${outPath} (ID: ${r.id}, Hint: ${r.qrHint})`);
  }
})();
