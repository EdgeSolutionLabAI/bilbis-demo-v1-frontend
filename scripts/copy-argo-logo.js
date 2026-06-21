const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '../.bilbis-attachments/1_SzHlH1nmPzZ2pT5k7PrWzg.png');
const dst = path.join(__dirname, '../public/argo-logo.png');

try {
  const data = fs.readFileSync(src);
  fs.writeFileSync(dst, data);
  console.log(`✓ Successfully copied Argo logo to ${dst}`);
} catch (err) {
  console.error(`✗ Error copying Argo logo: ${err.message}`);
  process.exit(1);
}
