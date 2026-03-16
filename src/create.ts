/**
 * E2B Sandbox Creator — n8n
 * 
 * Simple script to create a new sandbox instance from the hosted n8n-sandbox template.
 */

import 'dotenv/config';
import { Sandbox } from 'e2b';

async function createSandbox() {
  console.log('🏗️  Creating new n8n sandbox from template...');

  // Create sandbox from the "n8n-sandbox" tag we built earlier
  const sandbox = await Sandbox.create('n8n-sandbox', {
    timeoutMs: 24 * 60 * 60 * 1000, // 24 hour limit
    lifecycle: {
      onTimeout: 'pause',
      autoResume: true,
    },
  });

  const host = sandbox.getHost(5678);
  const n8nUrl = `https://${host}`;

  console.log('✅ Sandbox created successfully!');
  console.log(`🆔 ID:  ${sandbox.sandboxId}`);
  console.log(`🌐 URL: ${n8nUrl}`);
  
  return sandbox;
}

createSandbox().catch(console.error);
