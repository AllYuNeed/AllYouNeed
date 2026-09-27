// Renders brand SVGs to PNGs that social networks and manifests require, plus app/favicon.ico.
// Run with: npm run brand  (outputs are committed so builds never depend on this step)
import { Resvg } from "@resvg/resvg-js";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const brandDir = join(process.cwd(), "public", "brand");

const jobs = [
  { src: "og.svg", out: "og.png", width: 1200 },
  { src: "app-icon.svg", out: "apple-icon.png", width: 180 },
  { src: "app-icon.svg", out: "icon-192.png", width: 192 },
  { src: "app-icon.svg", out: "icon-512.png", width: 512 },
];

function render(src, width) {
  const svg = readFileSync(join(brandDir, src), "utf8");
  return new Resvg(svg, {
    fitTo: { mode: "width", value: width },
    font: { loadSystemFonts: true, defaultFontFamily: "Arial" },
  })
    .render()
    .asPng();
}

for (const job of jobs) {
  const png = render(job.src, job.width);
  writeFileSync(join(brandDir, job.out), png);
  console.log(`${job.out} (${png.length} bytes)`);
}

// favicon.ico: a single 32x32 PNG of the mark (the same SVG as app/icon.svg) in an ICO container.
// Layout: 6-byte ICONDIR + one 16-byte ICONDIRENTRY, then the PNG bytes at offset 22.
const FAVICON_SIZE = 32;
const favPng = render("mark.svg", FAVICON_SIZE);
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(FAVICON_SIZE, 6); // width
header.writeUInt8(FAVICON_SIZE, 7); // height
header.writeUInt8(0, 8); // palette colours (none)
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(favPng.length, 14); // bytes in resource
header.writeUInt32LE(22, 18); // image offset
const ico = Buffer.concat([header, favPng]);
writeFileSync(join(process.cwd(), "app", "favicon.ico"), ico);
console.log(`app/favicon.ico (${ico.length} bytes)`);
