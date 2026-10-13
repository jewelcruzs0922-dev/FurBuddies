import fs from "fs";
import path from "path";

const OUT_DIR = "C:/Users/Jimwel/AppData/Local/Temp/opencode/furbuddies-imgs/products";
fs.mkdirSync(OUT_DIR, { recursive: true });

const DOG_SLUGS = [
  "dog-takes-a-break", "dog-staying-warm", "this-dog-is-ready-for-its-close-up",
  "close-up-of-puppys-eyes", "black-dog-panting-in-doorway", "bernese-mountain-dog-against-black",
  "spanish-water-dog", "bernese-mountain-dog-wears-glasses", "a-fluffy-dog-wearing-a-necklace-of-flowers",
  "fashion-model-dog", "fancy-dog-wearing-scarf-and-necklace-posing",
  "dapper-dog-gentleman-with-bowtie-posing-on-black-background",
  "small-white-dog-stands-on-a-dirt-road", "mountain-dog-on-chaise-longue",
  "irish-setter-dog-close-up", "small-brown-dog-sits-on-a-white-couch",
  "a-grinning-bronze-coloured-dog", "a-smiling-big-teddy-bear-like-dog",
  "photo-of-a-small-brussels-griffon-puppy-dog", "dog-fetching-disc",
  "a-dog-in-a-cowboy-hat", "a-regal-white-dog-in-a-flower-bonnet",
  "a-big-fluffy-dog-with-a-necktie", "young-dog-looking-up-excitedly-awaiting-a-treat",
  "side-profile-of-young-dog-looking-forward", "portrait-of-a-brussels-griffon-dog",
  "boss-dog", "little-dog-big-flowers", "real-dog-stuffed-dog",
  "a-curly-furry-brown-haired-dog", "puppy-adores-it-s-person",
];

const CAT_SLUGS = [
  "cat-looking-up-at-the-camera", "a-cat-sitting-in-a-window",
  "curious-cat-peeking-over-a-blanket", "cat-resting-on-a-couch",
  "kitten-playing-with-yarn", "a-white-cat-on-a-white-background",
  "cat-with-yellow-eyes", "sleeping-cat-on-a-blanket",
  "orange-tabby-cat", "black-cat-on-a-couch",
  "cat-yawning", "kitten-in-a-basket",
  "a-cat-wearing-a-tiny-hat", "cat-looking-out-a-rainy-window",
  "close-up-of-a-cat-s-face", "grey-cat-on-a-grey-sofa",
  "cat-lying-on-its-back", "two-cats-sitting-together",
  "a-cat-with-a-bow-tie", "persian-cat-portrait",
];

const PET_OTHER_SLUGS = [
  "pet-bowl-on-the-floor", "dog-leash-hanging-on-a-hook",
  "brushes-and-grooming-tools", "pet-toys-scattered-on-the-floor",
  "a-basket-of-pet-supplies", "dog-treats-on-a-plate",
  "cat-toy-mouse-on-the-floor", "pet-bed-by-the-window",
  "hands-holding-a-pet-brush", "a-towel-and-shampoo-bottle",
  "wooden-spoon-with-pet-treats", "folded-towels-and-a-brush",
  "a-scoop-of-dry-pet-food", "empty-pet-bowl-on-wood",
  "rope-toy-on-a-wooden-floor", "a-ball-and-a-frisbee",
  "squeaky-toy-on-a-rug", "cat-scratching-post",
  "dog-collar-on-a-table", "a-water-bowl-outdoors",
];

const all = [
  ...DOG_SLUGS.map((s) => ({ slug: s, kind: "dog" })),
  ...CAT_SLUGS.map((s) => ({ slug: s, kind: "cat" })),
  ...PET_OTHER_SLUGS.map((s) => ({ slug: s, kind: "other" })),
];

const isJpeg = (buf) => buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;

async function tryDownload(slug) {
  const url = `https://burst.shopifycdn.com/photos/${slug}.jpg?width=1200&format=pjpg&exif=0&iptc=0`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return { slug, ok: false, reason: `HTTP ${res.status}` };
    const buf = Buffer.from(await res.arrayBuffer());
    if (!isJpeg(buf)) return { slug, ok: false, reason: `not jpeg (first bytes ${buf[0]},${buf[1]},${buf[2]})` };
    return { slug, ok: true, size: buf.length, buf };
  } catch (e) {
    return { slug, ok: false, reason: String(e).slice(0, 80) };
  }
}

const results = [];
for (const item of all) {
  const r = await tryDownload(item.slug);
  if (r.ok) {
    const file = path.join(OUT_DIR, `${item.kind}-${item.slug}.jpg`);
    fs.writeFileSync(file, r.buf);
    results.push({ slug: item.slug, kind: item.kind, ok: true, size: r.size, file });
    console.log(`OK   ${item.kind.padEnd(5)} ${item.slug} (${r.size} bytes)`);
  } else {
    results.push({ slug: item.slug, kind: item.kind, ok: false, reason: r.reason });
    console.log(`FAIL ${item.kind.padEnd(5)} ${item.slug} -> ${r.reason}`);
  }
}

const ok = results.filter((r) => r.ok);
console.log(`\n=== ${ok.length}/${results.length} valid JPEGs ===`);
fs.writeFileSync("valid-images.json", JSON.stringify(ok, null, 2));
