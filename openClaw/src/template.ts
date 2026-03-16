/**
 * E2B Template Definition — OpenClaw Sandbox
 *
 * Defines a custom sandbox template based on openclaw with increased resources.
 */

import { Template, defaultBuildLogger } from 'e2b';

// We base our template on the default openclaw image.
// We are primarily doing this to allocate 8 Cores and 8GB RAM as requested.
export const template = Template().fromImage('e2b-sandbox/openclaw'); // Use the official openclaw base if available, or just build the default openclaw template with custom resources.

async function buildTemplate() {
  console.log('🔨 Building OpenClaw custom template (8 CPU, 8GB RAM)...');
  
  await Template.build(template, 'openclaw-custom-8g', {
    cpuCount: 8,
    memoryMB: 8192,
    onBuildLogs: defaultBuildLogger(),
  });

  console.log('✅ Template built successfully!');
}

// Allow running this script directly
if (import.meta.url === `file://${process.argv[1]}`) {
  buildTemplate().catch(console.error);
}
