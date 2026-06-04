const { execSync } = require('child_process');

try {
  console.log('📦 Adding files...');
  execSync('git add -A', { stdio: 'inherit', shell: true });
  
  console.log('\n💾 Committing...');
  execSync('git commit -m "fix(layout+header): remove use server directive and fix style"', { stdio: 'inherit', shell: true });
  
  console.log('\n🚀 Pushing to GitHub...');
  execSync('git push', { stdio: 'inherit', shell: true });
  
  console.log('\n✅ Done! Vercel auto-deploy triggered.');
  console.log('⏳ Wait 2-3 minutes, then hard refresh (Ctrl+Shift+R)');
} catch (e) {
  console.error('\n❌ Error:', e.message);
  process.exit(1);
}
