import sharp from 'sharp';
import fs from 'fs';

const input = 'src/assets/logo1.png';
const output = 'src/assets/logo1_optimized.png';

sharp(input)
  .resize({ width: 800 })
  .png({ quality: 80, compressionLevel: 9 })
  .toFile(output)
  .then(() => {
    fs.renameSync(output, input);
    console.log('Logo optimized successfully.');
  })
  .catch(err => {
    console.error(err);
  });
