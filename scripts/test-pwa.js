const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ ${message}`);
    failed++;
  }
}

console.log('\n--- Running Melora PWA Validation Tests ---');

// 1. Manifest tests
console.log('\n[1] Web App Manifest (public/manifest.json)');
const manifestPath = path.join(publicDir, 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json file exists');

if (fs.existsSync(manifestPath)) {
  const content = fs.readFileSync(manifestPath, 'utf-8');
  let manifest = null;
  try {
    manifest = JSON.parse(content);
    assert(true, 'manifest.json is valid JSON');
  } catch (e) {
    assert(false, 'manifest.json is valid JSON: ' + e.message);
  }

  if (manifest) {
    assert(manifest.name === 'Melora - Feel Every Melody', 'name is "Melora - Feel Every Melody"');
    assert(manifest.short_name === 'Melora', 'short_name is "Melora"');
    assert(manifest.start_url === '/', 'start_url is "/"');
    assert(manifest.display === 'standalone', 'display mode is "standalone"');
    assert(manifest.background_color === '#0B0F16', 'background_color is "#0B0F16"');
    assert(manifest.theme_color === '#0B0F16', 'theme_color is "#0B0F16"');
    assert(Array.isArray(manifest.icons) && manifest.icons.length >= 8, `contains ${manifest.icons?.length} icons`);
    
    // Check icons exist
    let allIconsExist = true;
    for (const icon of manifest.icons || []) {
      const p = path.join(publicDir, icon.src.replace(/^\//, ''));
      if (!fs.existsSync(p)) {
        allIconsExist = false;
        console.error(`    Missing icon file: ${p}`);
      }
    }
    assert(allIconsExist, 'All icons referenced in manifest exist on disk');

    const hasMaskable = (manifest.icons || []).some(i => i.purpose === 'maskable');
    assert(hasMaskable, 'Contains maskable icon for Android adaptive icons');

    assert(Array.isArray(manifest.shortcuts) && manifest.shortcuts.length >= 3, 'Contains PWA shortcuts (Home, Playlists, Albums)');
  }
}

// 2. Service Worker tests
console.log('\n[2] Service Worker (public/sw.js)');
const swPath = path.join(publicDir, 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js exists');

if (fs.existsSync(swPath)) {
  const swContent = fs.readFileSync(swPath, 'utf-8');
  assert(swContent.includes("addEventListener('install'"), 'Handles SW install event');
  assert(swContent.includes("addEventListener('activate'"), 'Handles SW activate event with cache migration');
  assert(swContent.includes("addEventListener('fetch'"), 'Handles SW fetch event');
  assert(swContent.includes("addEventListener('message'"), 'Handles SW message event for safe user updates');
  assert(swContent.includes('/audio/') && swContent.includes('range'), 'Explicitly bypasses audio streams and HTTP 206 range requests');
  assert(swContent.includes("request.method !== 'GET'") && swContent.includes('/api/auth/'), 'Bypasses mutations and auth endpoints to protect credentials');
  assert(swContent.includes('/offline'), 'Includes offline page fallback for navigation');
  assert(swContent.includes('/_next/static/'), 'Includes cache-first strategy for immutable Next.js chunks');
}

// 3. Components & Pages tests
console.log('\n[3] PWA Components & Layout');
const offlinePagePath = path.join(__dirname, '..', 'src', 'app', 'offline', 'page.tsx');
const hookPath = path.join(__dirname, '..', 'src', 'lib', 'hooks', 'usePWA.ts');
const managerPath = path.join(__dirname, '..', 'src', 'components', 'pwa', 'PWAManager.tsx');
const installBtnPath = path.join(__dirname, '..', 'src', 'components', 'pwa', 'PWAInstallButton.tsx');
const layoutPath = path.join(__dirname, '..', 'src', 'app', 'layout.tsx');

assert(fs.existsSync(offlinePagePath), 'src/app/offline/page.tsx exists');
assert(fs.existsSync(hookPath), 'src/lib/hooks/usePWA.ts exists');
assert(fs.existsSync(managerPath), 'src/components/pwa/PWAManager.tsx exists');
assert(fs.existsSync(installBtnPath), 'src/components/pwa/PWAInstallButton.tsx exists');

if (fs.existsSync(layoutPath)) {
  const layoutContent = fs.readFileSync(layoutPath, 'utf-8');
  assert(layoutContent.includes('manifest: "/manifest.json"'), 'layout.tsx links manifest.json');
  assert(layoutContent.includes('PWAManager'), 'layout.tsx includes PWAManager component');
  assert(layoutContent.includes('appleWebApp'), 'layout.tsx defines appleWebApp metadata');
}

console.log(`\nResults: ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
