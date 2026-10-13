import fs from "fs";
import path from "path";

const OUT_DIR = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/products";
fs.mkdirSync(OUT_DIR, { recursive: true });

const CAT_SLUGS = [
  "blue-eyed-persian-cat-by-window", "comfortable-living-room-cat", "cat-enjoying-the-view",
  "halloween-cat-costume", "a-small-black-and-white-street-cat", "cat-poses-perfectly",
  "siamese-cat-laying-in-white-bedding", "close-up-of-a-white-cat-with-blue-eyes",
  "green-eyed-cat-licks-lips", "siamese-cat-nap-was-interrupted", "cat-rests-in-bedroom",
  "beautiful-cat", "two-white-cats-look-at-the-camera", "one-eyed-cat",
  "a-grumpy-white-cat", "orange-tabby-cat-prowling-through-grass-and-plants",
  "a-tabby-cat-walking-along-a-brick-road", "blue-eyed-cat-daydreams",
  "tabby-cat-lounging-around", "happy-ginger-cat", "the-paws-of-a-brown-fluffy-cat",
  "sleeping-cat-close-up", "cats-face-closeup",
];

const isJpeg = (buf) => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const results = [];
for (const slug of CAT_SLUGS) {
  const url = `https://burst.shopifycdn.com/photos/${slug}.jpg?width=1200&format=pjpg&exif=0&iptc=0`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) {
      console.log(`FAIL ${slug} -> HTTP ${res.status}`);
      results.push({ slug, kind: "cat", ok: false, reason: `HTTP ${res.status}` });
    } else {
      const buf = Buffer.from(await res.arrayBuffer());
      if (!isJpeg(buf)) {
        console.log(`FAIL ${slug} -> not jpeg`);
        results.push({ slug, kind: "cat", ok: false, reason: "not jpeg" });
      } else {
        const file = path.join(OUT_DIR, `cat-${slug}.jpg`);
        fs.writeFileSync(file, buf);
        console.log(`OK   ${slug} (${buf.length} bytes)`);
        results.push({ slug, kind: "cat", ok: true, size: buf.length, file });
      }
    }
  } catch (e) {
    console.log(`FAIL ${slug} -> ${String(e).slice(0, 80)}`);
    results.push({ slug, kind: "cat", ok: false, reason: String(e).slice(0, 80) });
  }
  await sleep(1500);
}

const ok = results.filter((r) => r.ok);
console.log(`\n=== ${ok.length}/${results.length} valid cat JPEGs ===`);
const existing = fs.existsSync("valid-images.json") ? JSON.parse(fs.readFileSync("valid-images.json", "utf8")) : [];
fs.writeFileSync("valid-images.json", JSON.stringify([...existing, ...results.filter((r) => r.ok)], null, 2));
