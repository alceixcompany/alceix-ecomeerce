import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { SharpImages } from "../src/modules/media/infrastructure/sharp-images";
test("image upload resizes by purpose, preserves ratio, removes metadata and compresses", async () => {
  const images = new SharpImages();
  const input = await sharp({
    create: { width: 3200, height: 1600, channels: 3, background: "#c18f61" },
  })
    .withExif({ IFD0: { Artist: "Private metadata" } })
    .png()
    .toBuffer();
  const source = await sharp(input).metadata();
  assert(source.exif);
  for (const [kind, width] of [
    ["product", 1600],
    ["banner", 1920],
    ["logo", 512],
    ["favicon", 64],
  ] as const) {
    const output = await images.normalize(input, kind),
      metadata = await sharp(output).metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, width / 2);
    assert.equal(metadata.exif, undefined);
    assert.equal(metadata.icc, undefined);
    assert(output.length < input.length);
  }
  const small = await sharp({
    create: { width: 20, height: 10, channels: 3, background: "#ffffff" },
  })
    .png()
    .toBuffer();
  assert.equal(
    (await sharp(await images.normalize(small, "product")).metadata()).width,
    20,
  );
});
