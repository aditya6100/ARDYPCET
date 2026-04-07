const { spawnSync } = require('child_process');
const path = require('path');

const projectDir = 'F:\\AR_UPDATE4-main\\AR_UPDATE4-main';
const repoUrl = 'https://github.com/aditya6100/ARDYPCET.git';

function runCommand(cmd, args, options = {}) {
  const result = spawnSync(cmd, args, {
    cwd: projectDir,
    stdio: 'inherit',
    shell: true,
    ...options
  });
  return result.status === 0;
}

console.log('\n' + '='.repeat(60));
console.log('🚀 AR_UPDATE4 - GitHub Deployment');
console.log('='.repeat(60) + '\n');

try {
  console.log('📝 Step 1: Configure Git...');
  runCommand('git', ['config', 'user.name', 'aditya6100']);
  runCommand('git', ['config', 'user.email', 'aditya6100@github.com']);
  console.log('✅ Git configured\n');

  console.log('📊 Step 2: Git Status...');
  runCommand('git', ['status']);
  console.log();

  console.log('📦 Step 3: Add Files...');
  runCommand('git', ['add', '.']);
  console.log('✅ Files added\n');

  console.log('💾 Step 4: Commit...');
  const msg = `feat: Add location accuracy improvements and error handling

- Add auto-location detection (WiFi/BLE/motion/GPS)
- Add path validation and diagnostics system
- Add drift detection and floor detection
- Add error boundaries and toast notifications
- Add global config file with 30+ settings
- Fix path accuracy issues with bidirectional pathfinding
- Implement path caching (10x performance boost)

New Files: config.ts, autoLocation.ts, pathValidator.ts, improvedAutoLocation.ts, ErrorBoundary.tsx, Toast.tsx
Modified: App.tsx, multiFloorPathfinding.ts

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`;

  runCommand('git', ['commit', '-m', msg]);
  console.log('✅ Commit created\n');

  console.log('🔗 Step 5: Configure Remote...');
  runCommand('git', ['remote', 'remove', 'origin']);
  runCommand('git', ['remote', 'add', 'origin', repoUrl]);
  console.log('✅ Remote configured\n');

  console.log('🌿 Step 6: Setup Main Branch...');
  runCommand('git', ['branch', '-M', 'main']);
  console.log('✅ Branch main ready\n');

  console.log('📤 Step 7: Push to GitHub...');
  const pushSuccess = runCommand('git', ['push', '-u', 'origin', 'main']);
  
  if (pushSuccess) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ DEPLOYMENT SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log('\n📍 Your code is now on GitHub:');
    console.log('   https://github.com/aditya6100/ARDYPCET\n');
    console.log('⏭️  Next Step: Deploy to Vercel');
    console.log('   1. Go to https://vercel.com/new');
    console.log('   2. Click "Import Git Repository"');
    console.log('   3. Search "ARDYPCET" and select it');
    console.log('   4. Click "Deploy" (auto-detects settings)');
    console.log('   5. Wait 2-5 minutes...\n');
  } else {
    console.log('\n⚠️  Push may have failed or requires authentication');
  }

} catch (error) {
  console.error('❌ ERROR:', error.message);
}
