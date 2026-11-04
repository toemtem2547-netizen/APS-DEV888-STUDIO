import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

interface GearPrompt {
  filename: string;
  prompt: string;
}

const REMAINING_PROMPTS: GearPrompt[] = [
  {
    filename: 'gpu.jpg',
    prompt: '3D product render of a flagship graphics card GPU with triple RGB cooling fans, glowing heat pipes, futuristic shroud, dark background, AAA game loot',
  },
  {
    filename: 'microphone.jpg',
    prompt: '3D product render of a professional studio broadcast gaming microphone on boom arm, glowing RGB ring, pop filter, dark background, AAA game asset',
  },
  {
    filename: 'webcam.jpg',
    prompt: '3D product render of a sleek 4K streaming webcam with glowing LED ring light, glass lens, dark futuristic background, AAA video game loot',
  },
  {
    filename: 'vr.jpg',
    prompt: '3D product render of a futuristic VR gaming headset with glowing visor and motion controllers, dark sleek background, AAA game asset',
  },
  {
    filename: 'speaker.jpg',
    prompt: '3D product render of a cyberpunk gaming soundbar speaker with dual subwoofers and pulsing RGB neon strip, dark background, AAA game asset',
  },
  {
    filename: 'stand.jpg',
    prompt: '3D product render of an aluminum gaming headset stand with glowing RGB base and USB ports, dark background, AAA game asset',
  },
  {
    filename: 'energy_drink.jpg',
    prompt: '3D render of a glowing futuristic cyberpunk energy drink can with neon lightning logo, condensation droplets, dark background, AAA game consumable potion',
  },
  {
    filename: 'noodles.jpg',
    prompt: '3D render of a cute cyberpunk ramen noodle bowl with glowing neon chopsticks, steaming broth, dark futuristic anime style, AAA game consumable',
  },
];

const TARGET_DIR = path.resolve(__dirname, '../../../frontend/public/images/rewards');

function downloadBuffer(url: string, timeoutMs = 45000): Promise<{ buffer: Buffer; statusCode: number }> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location, timeoutMs).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve({ buffer: Buffer.concat(chunks), statusCode: res.statusCode || 200 }));
      res.on('error', reject);
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error(`Request timed out after ${timeoutMs}ms`));
    });

    req.on('error', reject);
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function generateRemaining() {
  console.log(`Starting generation for ${REMAINING_PROMPTS.length} remaining items with retry...`);

  for (let i = 0; i < REMAINING_PROMPTS.length; i++) {
    const item = REMAINING_PROMPTS[i];
    const encodedPrompt = encodeURIComponent(item.prompt);
    let success = false;
    let attempts = 0;

    while (!success && attempts < 4) {
      attempts++;
      const seed = 2000 + i * 10 + attempts;
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&seed=${seed}`;

      console.log(`[${i + 1}/${REMAINING_PROMPTS.length}] Attempt ${attempts} for: ${item.filename}...`);

      try {
        const { buffer, statusCode } = await downloadBuffer(url);

        if (statusCode !== 200) {
          console.warn(`Attempt ${attempts}: HTTP status ${statusCode}, waiting 4s...`);
          await sleep(4000);
          continue;
        }

        if (buffer.length < 5000) {
          console.warn(`Attempt ${attempts}: Buffer too small (${buffer.length} bytes), text: ${buffer.toString().slice(0, 100)}, waiting 4s...`);
          await sleep(4000);
          continue;
        }

        const processed = await sharp(buffer)
          .extract({
            left: 10,
            top: 10,
            width: 748,
            height: 708,
          })
          .resize(600, 600, { fit: 'cover' })
          .jpeg({ quality: 90 })
          .toBuffer();

        const outPath = path.join(TARGET_DIR, item.filename);
        fs.writeFileSync(outPath, processed);
        console.log(`✓ Successfully saved AI asset to: ${outPath} (${processed.length} bytes)`);
        success = true;
      } catch (err: any) {
        console.error(`Attempt ${attempts} failed for ${item.filename}:`, err.message);
        await sleep(4000);
      }
    }

    if (!success) {
      console.error(`FAILED to generate ${item.filename} after all attempts.`);
    }

    // Small delay between items to prevent rate limits
    await sleep(2500);
  }

  console.log('Finished generating remaining items!');
}

generateRemaining().catch(console.error);
