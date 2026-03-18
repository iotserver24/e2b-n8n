/**
 * E2B Sandbox Creator — OpenClaw
 * 
 * Simple script to create a new sandbox instance from the hosted openclaw template.
 */

import 'dotenv/config';
import { Sandbox } from 'e2b';

async function createSandbox() {
  console.log('🏗️  Creating new OpenClaw sandbox from template...');

  const GATEWAY_PORT = 18789;
  const GATEWAY_TOKEN = process.env.OPENCLAW_APP_TOKEN || 'my-openclaw-token';

  // Create sandbox from the "openclaw-custom-8g" template
  const sandbox = await Sandbox.create('openclaw-custom-8g', {
    envs: {
      CUSTOM_BASE_URL: process.env.CUSTOM_BASE_URL!,
      CUSTOM_MODEL_ID: process.env.CUSTOM_MODEL_ID!,
      CUSTOM_API_KEY: process.env.CUSTOM_API_KEY || '',
      CUSTOM_COMPATIBILITY: process.env.CUSTOM_COMPATIBILITY || 'openai',
    },
    timeoutMs: 1 * 60 * 60 * 1000, // 1 hour limit
    lifecycle: {
      onTimeout: 'pause',
      autoResume: true,
    },
  });

  // Ensure 1hr timeout (3,600,000ms)
  await sandbox.setTimeout(1 * 60 * 60 * 1000);

  console.log(`✅ Sandbox created successfully! ID: ${sandbox.sandboxId}`);

  console.log('⚙️  Fixing OpenClaw plugin permissions & config...');
  
  // Fix permissions on the extensions directory (prevent mode=777 security blocks)
  await sandbox.commands.run(`sudo chmod -R 755 /usr/local/lib/node_modules/openclaw/extensions/`);
  
  // Remove the currently broken memory-core slot to prevent validation failures (ignore error if already unset)
  await sandbox.commands.run(`openclaw config unset plugins.slots.memory || true`);

  console.log('⚙️  Configuring OpenClaw...');

  // Run custom provider onboarding
  const compatibility = process.env.CUSTOM_COMPATIBILITY || 'openai';
  await sandbox.commands.run(
    `openclaw onboard --non-interactive --skip-health --accept-risk --auth-choice custom-api-key --custom-base-url "${process.env.CUSTOM_BASE_URL}" --custom-model-id "${process.env.CUSTOM_MODEL_ID}" --custom-compatibility "${compatibility}"`
  );

  console.log('🚀 Starting Gateway...');

  // Set insecure control UI flags and start the gateway
  await sandbox.commands.run(
    `bash -lc 'openclaw config set gateway.controlUi.allowInsecureAuth true && ` +
    `openclaw config set gateway.controlUi.dangerouslyDisableDeviceAuth true && ` +
    `openclaw gateway --allow-unconfigured --bind lan --auth token --token ${GATEWAY_TOKEN} --port ${GATEWAY_PORT}'`,
    { background: true }
  );

  // Wait for the gateway to start listening
  process.stdout.write('⏳ Waiting for gateway... ');
  for (let i = 0; i < 45; i++) {
    const probe = await sandbox.commands.run(
      `bash -lc 'ss -ltn | grep -q ":${GATEWAY_PORT} " && echo ready || echo waiting'`
    );
    if (probe.stdout.trim() === 'ready') {
      console.log('ready!');
      break;
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  // The new required URL format: {port}-{id}.e2b.app
  const host = `${GATEWAY_PORT}-${sandbox.sandboxId}.e2b.app`;
  const url = `https://${host}/?token=${GATEWAY_TOKEN}`;
  console.log(`\n🌐 Gateway URL: ${url}`);

  return sandbox;
}

createSandbox().catch(console.error);
