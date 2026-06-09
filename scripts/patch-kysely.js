// Post-install patch: skip bun check, only patch files
const fs = require('fs');
const path = require('path');

function patchDir(dir) {
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      patchDir(fullPath);
    } else if (entry.name.endsWith('.mjs') || entry.name.endsWith('.js')) {
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        if (content.includes('DEFAULT_MIGRATION_TABLE') && !content.includes('DEFAULT_MIGRATION_LOCK_TABLE')) {
          content = content.replace(/,\s*DEFAULT_MIGRATION_TABLE/g, '');
          content = content.replace(/DEFAULT_MIGRATION_TABLE,\s*/g, '');
          content = content.replace(/DEFAULT_MIGRATION_TABLE/g, '"kysely_migration"');
          modified = true;
        }
        
        if (content.includes('DEFAULT_MIGRATION_LOCK_TABLE')) {
          content = content.replace(/,\s*DEFAULT_MIGRATION_LOCK_TABLE/g, '');
          content = content.replace(/DEFAULT_MIGRATION_LOCK_TABLE,\s*/g, '');
          content = content.replace(/DEFAULT_MIGRATION_LOCK_TABLE/g, '"kysely_migration_lock"');
          modified = true;
        }
        
        if (content.includes('?? lockRowId: MIGRATION_LOCK_ID')) {
          content = content.replace(/\?\? lockRowId: MIGRATION_LOCK_ID,/g, '?? "kysely_migration_lock",');
          modified = true;
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log('Patched:', fullPath);
        }
      } catch (e) {
        // Skip unreadable files
      }
    }
  }
}

const nodeModules = path.join(__dirname, '..', 'node_modules', '.pnpm');
if (fs.existsSync(nodeModules)) {
  console.log('Patching kysely-adapter/kysely files...');
  patchDir(nodeModules);
  console.log('Done.');
} else {
  console.log('node_modules/.pnpm not found, skipping patch.');
}