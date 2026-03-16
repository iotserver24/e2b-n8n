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
      TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN!,
    },
    timeoutMs: 24 * 60 * 60 * 1000, // 24 hour limit
    lifecycle: {
      onTimeout: 'pause',
      autoResume: true,
    },
  });

  console.log(`✅ Sandbox created successfully! ID: ${sandbox.sandboxId}`);

  console.log('⚙️  Configuring OpenClaw...');
  


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

  console.log('⚙️  Configuring OpenClaw...');
  // Enable the Telegram plugin now that gateway has initialized the base plugins array
  await sandbox.commands.run(`node -e "const fs = require('fs'); const path = require('path'); const p = path.join(process.env.HOME, '.openclaw/openclaw.json'); let c = JSON.parse(fs.readFileSync(p)); c.plugins = c.plugins || {}; c.plugins.entries = c.plugins.entries || {}; c.plugins.entries.telegram = c.plugins.entries.telegram || {}; c.plugins.entries.telegram.enabled = true; fs.writeFileSync(p, JSON.stringify(c, null, 2));"`);
  
  // Doctor might complain about channels if gateway initializes them differently, but doctor --fix usually works if background gateway is running
  await sandbox.commands.run(`openclaw doctor --fix`);
  await sandbox.commands.run(`openclaw channels add --channel telegram --token "${process.env.TELEGRAM_BOT_TOKEN}"`);

  // The new required URL format: {port}-{id}.e2b.app
  const host = `${GATEWAY_PORT}-${sandbox.sandboxId}.e2b.app`;
  const url = `https://${host}/?token=${GATEWAY_TOKEN}`;
  console.log(`\n🌐 Gateway URL: ${url}`);

  console.log('\n📲 Telegram Pairing:');
  console.log('1. Open your bot in Telegram and send a message (e.g., "hi").');
  console.log('2. The bot will reply with a Pairing Code.');
  console.log('3. Run the following command here to approve it (replace <CODE>):');
  console.log(`   npx tsx src/approve.ts <CODE> ${sandbox.sandboxId}`);
  
  return sandbox;
}

createSandbox().catch(console.error);
