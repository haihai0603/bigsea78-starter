const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('Adding files...');
  execSync('git add -A', { stdio: 'inherit', shell: true });
  
  console.log('\nCommitting...');
  execSync('git commit -m "fix(header): correct HeaderServer.tsx syntax and imports"', { stdio: 'inherit', shell: true });
  
  console.log('\nPushing...');
  execSync('git push', { stdio: 'inherit', shell: true });
  
  console.log('\n✅ Done! Vercel auto-deploy triggered.');
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exit(1);
}
