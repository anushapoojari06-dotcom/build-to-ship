const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const clientDir = path.resolve(__dirname, 'voice-assist/client');
console.log('📦 Installing client dependencies in:', clientDir);
execSync('npm install', { cwd: clientDir, stdio: 'inherit' });

console.log('⚡ Building client for production...');
execSync('npm run build', { cwd: clientDir, stdio: 'inherit' });

const srcDist = path.join(clientDir, 'dist');
const targetDist = path.resolve(__dirname, 'dist');

console.log('📁 Copying build output to root dist directory...');
fs.cpSync(srcDist, targetDist, { recursive: true });
console.log('✅ Build complete! Production bundle ready in dist/');
