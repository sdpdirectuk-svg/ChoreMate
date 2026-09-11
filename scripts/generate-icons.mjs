import sharp from "sharp";
import fs from "fs";

const svg = fs.readFileSync("public/icons/icon.svg");

await Promise.all([
  sharp(svg).resize(192, 192).png().toFile("public/icons/icon-192.png"),
  sharp(svg).resize(512, 512).png().toFile("public/icons/icon-512.png"),
  sharp(svg).resize(180, 180).png().toFile("public/icons/apple-touch-icon.png"),
]);

const og = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f3faf7"/>
      <stop offset="100%" stop-color="#dff0ea"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="980" cy="120" r="180" fill="#ccfbf1"/>
  <circle cx="160" cy="520" r="160" fill="#ffedd5"/>
  <rect x="0" y="0" width="1200" height="16" fill="#0f766e"/>
  <text x="80" y="270" font-family="Arial, sans-serif" font-size="92" font-weight="700" fill="#14312c">ChoreMate</text>
  <text x="80" y="360" font-family="Arial, sans-serif" font-size="42" fill="#3d5c55">Make helping at home a game.</text>
</svg>`);

await sharp(og).png().toFile("public/og.png");
console.log("icons ok");
