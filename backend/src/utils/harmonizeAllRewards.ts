import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const REWARDS_DIR = path.resolve(__dirname, '../../../frontend/public/images/rewards');

const ALL_IMAGES = [
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

async function applySoftVignette(inputPath: string, outputPath: string, blackCutoff = 14) {
  const { data, info } = await sharp(inputPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const channels = info.channels;
  const out = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const srcIdx = (y * w + x) * channels;
      const dstIdx = (y * w + x) * 3;

      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];

      const dx = (x - w / 2) / (w / 2);
      const dy = (y - h / 2) / (h / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Smooth radial falloff curve starting at 0.40 outwards to 0.88
      let factor = 1.0;
      if (dist > 0.40) {
        factor = Math.max(0, 1 - (dist - 0.40) / 0.48);
      }
      factor = Math.pow(factor, 1.8);

      for (let c = 0; c < 3; c++) {
        let val = c === 0 ? r : c === 1 ? g : b;
        // Subtract ambient studio grey fog if any
        if (blackCutoff > 0) {
          val = Math.max(0, (val - blackCutoff) * (255 / (255 - blackCutoff)));
        }
        out[dstIdx + c] = Math.round(Math.min(255, val * factor));
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 93 })
    .toFile(outputPath);
}

async function main() {
  console.log('Harmonizing all reward images with soft faint vignette falloff...');

  // 1. Controller: copy test_soft_ctrl.jpg if available
  const softCtrl = path.join(REWARDS_DIR, 'test_soft_ctrl.jpg');
  if (fs.existsSync(softCtrl)) {
    fs.copyFileSync(softCtrl, path.join(REWARDS_DIR, 'controller.jpg'));
    console.log('✓ Overwrote controller.jpg with new soft glowing controller');
  }

  // 2. Keyboard: copy test_soft_kb.jpg if available
  const softKb = path.join(REWARDS_DIR, 'test_soft_kb.jpg');
  if (fs.existsSync(softKb)) {
    fs.copyFileSync(softKb, path.join(REWARDS_DIR, 'keyboard.jpg'));
    console.log('✓ Overwrote keyboard.jpg with test_soft_kb.jpg');
  }

  // 3. Process every image in the list
  for (const filename of ALL_IMAGES) {
    const src = path.join(REWARDS_DIR, filename);
    if (!fs.existsSync(src)) continue;

    const tmpOut = path.join(REWARDS_DIR, `harmonized_${filename}`);
    
    // Determine blackCutoff based on image background
    let cutoff = 12;
    if (filename === 'salt.jpg' || filename === 'noodles.jpg' || filename === 'energy_drink.jpg') {
      cutoff = 5; // keep vibrant neon sparkles
    } else if (filename === 'chair.jpg' || filename === 'desk.jpg' || filename === 'monitor.jpg') {
      cutoff = 18; // remove studio grey walls
    }

    await applySoftVignette(src, tmpOut, cutoff);
    fs.copyFileSync(tmpOut, src);
    fs.unlinkSync(tmpOut);
    console.log(`✓ Harmonized: ${filename}`);
  }

  // 4. Remove all temporary test/preview files
  const allFiles = fs.readdirSync(REWARDS_DIR);
  for (const f of allFiles) {
    if (f.startsWith('test_') || f.startsWith('preview_')) {
      try {
        fs.unlinkSync(path.join(REWARDS_DIR, f));
        console.log(`Cleaned up temporary file: ${f}`);
      } catch (e) {}
    }
  }

  console.log('\nAll reward images successfully harmonized!');
}

main().catch(console.error);
