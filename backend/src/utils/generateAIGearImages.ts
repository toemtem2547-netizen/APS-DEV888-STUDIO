import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';

interface GearPrompt {
  filename: string;
  prompt: string;
}

const GEAR_PROMPTS: GearPrompt[] = [
  {
    filename: 'mouse.jpg',
    prompt: '3D product render of an ergonomic RGB esports gaming mouse, glowing cyan neon strips, honeycomb shell, centered, pure dark studio background, AAA video game loot icon, octane render',
  },
  {
    filename: 'keyboard.jpg',
    prompt: '3D product render of a compact mechanical gaming keyboard, glowing RGB backlit keycaps, floating angle, dark sleek background, AAA game asset, hyperdetailed 3D',
  },
  {
    filename: 'pc_case.jpg',
    prompt: '3D product render of a high-end liquid-cooled gaming PC rig tower, transparent tempered glass, glowing neon coolant tubes, ARGB fans, dark cyberpunk background, AAA game loot',
  },
  {
    filename: 'controller.jpg',
    prompt: '3D product render of an elite wireless gaming gamepad controller, neon LED accents, textured grip, centered, dark futuristic background, AAA game item icon',
  },
  {
    filename: 'desk.jpg',
    prompt: '3D render of a futuristic ergonomic gaming desk with glowing RGB edge lighting, carbon fiber texture, dark room, AAA game asset',
  },
  {
    filename: 'earbuds.jpg',
    prompt: '3D product render of cyberpunk TWS gaming earbuds in an open glowing charging case, neon cyan and purple LEDs, pure dark background, AAA video game loot',
  },
  {
    filename: 'chair.jpg',
    prompt: '3D product render of a futuristic ergonomic cyber gaming chair, racing seat style, neon RGB piping, black leather, centered, dark background, AAA game asset',
  },
  {
    filename: 'monitor.jpg',
    prompt: '3D product render of an ultrawide curved OLED gaming monitor, displaying glowing abstract neon game visuals, dark cyberpunk background, AAA video game asset',
  },
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

function downloadBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const chunks: Buffer[] = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function generateAll() {
  console.log(`Starting AI Image Generation for ${GEAR_PROMPTS.length} Gaming Gear Items...`);

  for (let i = 0; i < GEAR_PROMPTS.length; i++) {
    const item = GEAR_PROMPTS[i];
    const encodedPrompt = encodeURIComponent(item.prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&nologo=true&seed=${1000 + i}`;

    console.log(`[${i + 1}/${GEAR_PROMPTS.length}] Generating AI 3D asset for: ${item.filename}...`);

    try {
      const rawBuffer = await downloadBuffer(url);

      if (rawBuffer.length < 2000) {
        console.warn(`Warning: Buffer for ${item.filename} is too small (${rawBuffer.length} bytes), skipping.`);
        continue;
      }

      // Crop bottom 50px to guarantee zero watermark, center-crop square, and output high-res 600x600 jpeg
      const processedBuffer = await sharp(rawBuffer)
        .extract({
          left: 10,
          top: 10,
          width: 748,
          height: 708, // cuts off the bottom 50px watermark
        })
        .resize(600, 600, { fit: 'cover' })
        .jpeg({ quality: 90 })
        .toBuffer();

      const outPath = path.join(TARGET_DIR, item.filename);
      fs.writeFileSync(outPath, processedBuffer);
      console.log(`✓ Successfully saved AI asset to: ${outPath} (${processedBuffer.length} bytes)`);
    } catch (err: any) {
      console.error(`Error generating ${item.filename}:`, err.message);
    }
  }

  console.log('All AI Gaming Gear items generated and saved successfully!');
}

generateAll().catch(console.error);
