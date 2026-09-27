import { test, expect } from "vitest";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const brand = join(process.cwd(), "public", "brand");
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

test.each(["og.png", "apple-icon.png", "icon-192.png", "icon-512.png"])("%s exists and is a non-empty PNG", (file) => {
  const p = join(brand, file);
  expect(existsSync(p)).toBe(true);
  expect(statSync(p).size).toBeGreaterThan(500);
});

test("app/favicon.ico is a single-image 32x32 ICO wrapping a PNG", () => {
  const p = join(process.cwd(), "app", "favicon.ico");
  expect(existsSync(p)).toBe(true);
  const ico = readFileSync(p);
  // ICONDIR: reserved 0, type 1 (icon), count 1
  expect(ico.readUInt16LE(0)).toBe(0);
  expect(ico.readUInt16LE(2)).toBe(1);
  expect(ico.readUInt16LE(4)).toBe(1);
  // ICONDIRENTRY
  expect(ico[6]).toBe(32); // width
  expect(ico[7]).toBe(32); // height
  expect(ico[8]).toBe(0); // palette colours
  expect(ico[9]).toBe(0); // reserved
  expect(ico.readUInt16LE(10)).toBe(1); // planes
  expect(ico.readUInt16LE(12)).toBe(32); // bits per pixel
  const bytesInRes = ico.readUInt32LE(14);
  const offset = ico.readUInt32LE(18);
  expect(offset).toBe(22);
  expect(bytesInRes).toBe(ico.length - 22);
  const png = ico.subarray(offset);
  expect([...png.subarray(0, 8)]).toEqual(PNG_SIGNATURE);
  // PNG IHDR width/height (big-endian) at bytes 16..24
  expect(png.readUInt32BE(16)).toBe(32);
  expect(png.readUInt32BE(20)).toBe(32);
});
