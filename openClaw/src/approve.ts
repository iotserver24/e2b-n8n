import 'dotenv/config';
import { Sandbox } from 'e2b';

async function approvePairing() {
  const code = process.argv[2];
  const sandboxId = process.argv[3];

  if (!code || !sandboxId) {
    console.error('Usage: npx tsx src/approve.ts <PAIRING_CODE> <SANDBOX_ID>');
    process.exit(1);
  }

  console.log(`🔗 Connecting to sandbox ${sandboxId}...`);
  const sandbox = await Sandbox.connect(sandboxId);

  console.log(`✅ Approving Telegram pairing code: ${code}...`);
  
  const result = await sandbox.commands.run(`openclaw pairing approve --channel telegram ${code}`);
  
  if (result.exitCode === 0) {
    console.log('✅ Pairing approved successfully! You can now chat with your bot.');
  } else {
    console.error('❌ Failed to approve pairing:');
    console.error(result.stderr);
  }
  
  process.exit(0);
}

approvePairing().catch(console.error);
