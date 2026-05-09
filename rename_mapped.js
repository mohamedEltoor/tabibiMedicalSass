const fs = require('fs');
const path = require('path');

const rawDir = path.join(__dirname, 'docs', 'screenshots', 'raw');
const destDir = path.join(__dirname, 'docs', 'screenshots');

const mapping = {
  "search-results": "Screenshot 2026-04-16 212744.png",
  "public-profile-5": "Screenshot 2026-04-16 204619.png",
  "booking-2": "Screenshot 2026-05-09 173121.png",
  "public-profile-3": "Screenshot 2026-05-09 172916.png",
  "profile-setup-2": "Screenshot 2026-05-09 174706.png",
  "profile-setup-3": "Screenshot 2026-05-09 174837.png",
  "clinic-setup-1": "Screenshot 2026-05-08 194828.png",
  "clinic-setup-2": "Screenshot 2026-05-08 201425.png",
  "clinic-setup-3": "Screenshot 2026-05-08 202207.png",
  "seo-preview-1": "Screenshot 2026-04-23 135222.png",
  "dashboard-1": "Screenshot 2026-05-09 173515.png",
  "dashboard-4": "Screenshot 2026-05-09 173258.png",
  "staff-2": "Screenshot 2026-04-20 141300.png",
  "emr-5": "Screenshot 2026-04-18 003906.png",
  "emr-3": "Screenshot 2026-05-09 173630.png",
  "emr-1": "Screenshot 2026-05-09 173545.png"
};

console.log('Starting automated mapping...');

for (const [key, filename] of Object.entries(mapping)) {
    const sourcePath = path.join(rawDir, filename);
    const destPath = path.join(destDir, key + '.png');
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Successfully mapped: ${key}.png`);
    } else {
        console.log(`❌ Error: Could not find ${filename} in raw directory!`);
    }
}

console.log('Automated mapping complete!');
