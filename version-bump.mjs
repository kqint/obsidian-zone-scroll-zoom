/* 
版本更新命令：
npm version patch    # 1.3.5 → 1.3.6
npm version minor    # 1.3.5 → 1.4.0
npm version major    # 1.3.5 → 2.0.0
*/
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));
const manifestPath = join(__dirname, 'manifest.json');
const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));

manifest.version = pkg.version;
writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');

console.log(`Version synced: ${pkg.version}`);
