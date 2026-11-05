import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const IMAGES_DIR = path.resolve(__dirname, '../../../frontend/public/images');
const SLOTS_DIR = path.join(IMAGES_DIR, 'slots');
const BOXES_DIR = path.join(IMAGES_DIR, 'boxes');
const PACKAGES_DIR = path.join(IMAGES_DIR, 'packages');

const TASKS = [
  { src: path.join(SLOTS_DIR, 'sym_chest.jpg'), out: path.join(SLOTS_DIR, 'sym_chest.png') },
  { src: path.join(SLOTS_DIR, 'sym_bag.jpg'), out: path.join(SLOTS_DIR, 'sym_bag.png') },
  { src: path.join(SLOTS_DIR, 'sym_wild.jpg'), out: path.join(SLOTS_DIR, 'sym_wild.png') },
  { src: path.join(SLOTS_DIR, 'sym_scatter.jpg'), out: path.join(SLOTS_DIR, 'sym_scatter.png') },
  { src: path.join(SLOTS_DIR, 'sym_cat.jpg'), out: path.join(SLOTS_DIR, 'sym_cat.png') },
  { src: path.join(SLOTS_DIR, 'sym_hat.jpg'), out: path.join(SLOTS_DIR, 'sym_hat.png') },
  { src: path.join(BOXES_DIR, 'gold.jpg'), out: path.join(SLOTS_DIR, 'deco_dragon_chest.png') },
  { src: path.join(SLOTS_DIR, 'deco_golden_dragon.jpg'), out: path.join(SLOTS_DIR, 'deco_golden_dragon.png') },
  { src: path.join(PACKAGES_DIR, 'tier6.jpg'), out: path.join(SLOTS_DIR, 'deco_winged_dragon_chest.png') },
  { src: path.join(PACKAGES_DIR, 'tier4.jpg'), out: path.join(SLOTS_DIR, 'deco_royal_chest.png') },
  { src: path.join(IMAGES_DIR, 'quick-coins.jpg'), out: path.join(SLOTS_DIR, 'deco_coin_stack.png') },
];

async function main() {
  for (const t of TASKS) {
    if (!fs.existsSync(t.src)) continue;
    if (fs.existsSync(t.out)) {
      console.log('already exists', path.basename(t.out));
      continue;
    }
    const blob = await removeBackground(pathToFileURL(t.src).href);
    const buf = Buffer.from(await blob.arrayBuffer());
    fs.writeFileSync(t.out, buf);
    console.log('saved', path.basename(t.out), buf.length);
  }
}
main().catch(console.error);
