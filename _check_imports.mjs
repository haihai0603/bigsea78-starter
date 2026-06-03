import fs from 'fs';
import path from 'path';

const srcDir = 'D:\\1-dylx\\bigsea78-starter\\src';
const exts = ['.ts', '.tsx'];

function exists(p) {
  return fs.existsSync(p) || fs.existsSync(p.replace(/\.tsx?$/, '/index.tsx')) || fs.existsSync(p.replace(/\.tsx?$/, '/index.ts'));
}

let errors = [];

function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('_') && entry.name !== 'node_modules') scan(full);
    if (entry.isFile() && exts.some(e => entry.name.endsWith(e))) {
      const content = fs.readFileSync(full, 'utf-8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const m = line.match(/from\s+['"](@\/[^'"]+)['"]/);
        if (m) {
          const mod = m[1];
          const modPath = mod.replace(/^@\//, '').replace(/\/index$/, '').replace(/\/$/, '');
          const candidates = [
            path.join(srcDir, modPath + '.ts'),
            path.join(srcDir, modPath + '.tsx'),
            path.join(srcDir, modPath, 'index.ts'),
            path.join(srcDir, modPath, 'index.tsx'),
          ];
          if (!candidates.some(c => fs.existsSync(c))) {
            errors.push(`${path.relative(srcDir, full)}:${i+1}: ${line.trim()} → ${mod} NOT FOUND`);
          }
        }
      }
    }
  }
}

scan(srcDir);
if (errors.length === 0) console.log('All imports resolved OK');
else { errors.forEach(e => console.log(e)); process.exit(1); }
