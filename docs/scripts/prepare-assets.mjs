import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const docsRoot = fileURLToPath(new URL('../', import.meta.url));
const source = fileURLToPath(new URL('../../assets/hero.png', import.meta.url));
const destinationDirectory = fileURLToPath(new URL('../public/assets/', import.meta.url));
const destination = fileURLToPath(new URL('../public/assets/social-card.png', import.meta.url));
const legacyDestination = fileURLToPath(new URL('../public/assets/hero.png', import.meta.url));

await mkdir(destinationDirectory, { recursive: true });
await rm(legacyDestination, { force: true });
await sharp(source)
  .resize(1200, 630, { fit: 'cover', position: 'centre' })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(destination);

console.log(`Prepared docs asset: ${destination.replace(`${docsRoot}/`, '')} (1200x630)`);
