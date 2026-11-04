import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';
import path from 'path';

const REWARDS_DIR = '../frontend/public/images/rewards';

const FILES = [
  'chair.jpg',
  'controller.jpg',
  'desk.jpg',
  'earbuds.jpg',
  'energy_drink.jpg',
  'gpu.jpg',
  'headset.jpg',
  'keyboard.jpg',
  'microphone.jpg',
  'monitor.jpg',
  'mouse.jpg',
  'mousepad.jpg',
  'noodles.jpg',
  'pc_case.jpg',
  'salt.jpg',
  'speaker.jpg',
  'stand.jpg',
  'vr.jpg',
  'webcam.jpg',
];

async function main() {
  console.log(`Starting background removal for ${FILES.length} items to transparent PNG...`);

  for (let i = 0; i < FILES.length; i++) {
    const filename = FILES[i];
    const srcPath = `${REWARDS_DIR}/${filename}`;
    const pngName = filename.replace('.jpg', '.png');
    const destPath = `${REWARDS_DIR}/${pngName}`;

    if (!fs.existsSync(srcPath)) {
      console.warn(`File ${filename} not found, skipping.`);
      continue;
    }

    console.log(`[${i + 1}/${FILES.length}] Removing background from: ${filename}...`);
    try {
      const blob = await removeBackground(srcPath);
      const buffer = Buffer.from(await blob.arrayBuffer());
      fs.writeFileSync(destPath, buffer);
      console.log(`✓ Saved transparent PNG: ${pngName} (${buffer.length} bytes)`);
    } catch (err: any) {
      console.error(`Error processing ${filename}:`, err.message);
    }
  }

  console.log('\nFinished removing background for all items!');
}

main().catch(console.error);
