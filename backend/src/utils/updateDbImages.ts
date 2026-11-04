import { initDatabaseConnection, query } from '../config/db';

async function updateImages() {
  await initDatabaseConnection();

  console.log('Updating Mystery Box images in DB...');
  await query(`UPDATE mystery_boxes SET image_url = '/images/boxes/bronze.jpg' WHERE name LIKE '%Bronze%'`);
  await query(`UPDATE mystery_boxes SET image_url = '/images/boxes/silver.jpg' WHERE name LIKE '%Silver%'`);
  await query(`UPDATE mystery_boxes SET image_url = '/images/boxes/gold.jpg' WHERE name LIKE '%Gold%'`);
  await query(`UPDATE mystery_boxes SET image_url = '/images/boxes/mythic.jpg' WHERE name LIKE '%Mythic%' OR name LIKE '%Cyber%'`);

  console.log('Updating Package images in DB...');
  await query(`UPDATE packages SET image_url = '/images/packages/tier1.jpg' WHERE coins <= 150`);
  await query(`UPDATE packages SET image_url = '/images/packages/tier2.jpg' WHERE coins > 150 AND coins <= 350`);
  await query(`UPDATE packages SET image_url = '/images/packages/tier3.jpg' WHERE coins > 350 AND coins <= 600`);
  await query(`UPDATE packages SET image_url = '/images/packages/tier4.jpg' WHERE coins > 600 AND coins <= 1500`);
  await query(`UPDATE packages SET image_url = '/images/packages/tier5.jpg' WHERE coins > 1500 AND coins <= 3500`);
  await query(`UPDATE packages SET image_url = '/images/packages/tier6.jpg' WHERE coins > 3500`);

  console.log('DB Images successfully updated to local 3D assets!');
  process.exit(0);
}

updateImages().catch((err) => {
  console.error('Update failed:', err);
  process.exit(1);
});
