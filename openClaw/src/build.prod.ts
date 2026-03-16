/**
 * E2B Template Build Script — Production
 *
 * Builds the openClaw sandbox template on E2B infrastructure.
 * Uses 8 CPU cores and 8GB RAM.
 *
 * Run: npm run build:template
 */

import 'dotenv/config';
import { Template, defaultBuildLogger } from 'e2b';
import { template } from './template.js';

async function main() {
  console.log('🔨 Building openclaw-custom-8g template on E2B...');
  console.log('   CPU: 8 cores | RAM: 8 GB');
  console.log('');

  const result = await Template.build(template, 'openclaw-custom-8g', {
    cpuCount: 8,
    memoryMB: 8192,
    onBuildLogs: defaultBuildLogger(),
  });

  console.log('');
  console.log('✅ Template built successfully!');
  console.log(`   Template ID: ${result.templateId}`);
  console.log('');
  console.log('Next step: npx tsx src/create.ts  (to test launching the sandbox)');
}

main().catch((err) => {
  console.error('❌ Build failed:', err.message || err);
  process.exit(1);
});
