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

  // Create sandbox from the "openclaw" template
  const sandbox = await Sandbox.create('openclaw', {
    envs: {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
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
  
  // Set the default model
  await sandbox.commands.run('openclaw config set agents.defaults.model.primary openai/gpt-5.2');

  // Enable the Telegram plugin
  await sandbox.commands.run('openclaw config set plugins.entries.telegram.enabled true');
  await sandbox.commands.run(`openclaw channels add --channel telegram --token "${process.env.TELEGRAM_BOT_TOKEN}"`);

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

  const url = `https://${sandbox.getHost(GATEWAY_PORT)}/?token=${GATEWAY_TOKEN}`;
  console.log(`\n🌐 Gateway URL: ${url}`);

  console.log('\n📲 Telegram Pairing:');
  console.log('1. Open your bot in Telegram and send a message (e.g., "hi").');
  console.log('2. The bot will reply with a Pairing Code.');
  console.log('3. Run the following command here to approve it (replace <CODE>):');
  console.log(`   npx tsx src/approve.ts <CODE> ${sandbox.sandboxId}`);
  
  return sandbox;
}

createSandbox().catch(console.error);
