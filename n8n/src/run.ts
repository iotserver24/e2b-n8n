/**
 * E2B Sandbox Launcher — n8n with Auto-Resume
 *
 * Creates a sandbox from the n8n-sandbox template and starts n8n.
 * Uses auto-resume lifecycle so the sandbox pauses at 24h timeout
 * and automatically resumes when traffic hits the URL.
 *
 * Run: npm start
 */

import 'dotenv/config';
import { Sandbox } from 'e2b';

async function main() {
  console.log('🚀 Launching n8n sandbox with auto-resume...');
  console.log('');

  // Create sandbox with auto-resume lifecycle
  const sandbox = await Sandbox.create('n8n-sandbox', {
    timeoutMs: 1 * 60 * 60 * 1000, // 1 hour limit
    lifecycle: {
      onTimeout: 'pause',    // Pause instead of kill on timeout
      autoResume: true,       // Auto-resume when traffic arrives
    },
  });

  // Ensure 1hr timeout (3,600,000ms)
  await sandbox.setTimeout(1 * 60 * 60 * 1000);

  console.log(`✅ Sandbox created!`);
  console.log(`   Sandbox ID: ${sandbox.sandboxId}`);
  console.log('');

  // Start n8n in background
  console.log('📦 Starting n8n...');
  await sandbox.commands.run('n8n start > /home/user/n8n.log 2>&1', {
    background: true,
  });

  // Wait a moment for n8n to boot
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Get the public URL for n8n (port 5678)
  const host = sandbox.getHost(5678);
  const n8nUrl = `https://${host}`;

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  🎉 n8n is running!');
  console.log('');
  console.log(`  🌐 URL: ${n8nUrl}`);
  console.log(`  🆔 Sandbox ID: ${sandbox.sandboxId}`);
  console.log('');
  console.log('  ⏱  Timeout: 1 hour → auto-pause → auto-resume');
  console.log('  💡 The sandbox pauses when idle and resumes');
  console.log('     automatically when you visit the URL.');
  console.log('  ⚠️  Do NOT call .kill() or it\'s gone forever!');
  console.log('═══════════════════════════════════════════════');
  console.log('');
  console.log('Press Ctrl+C to detach (sandbox keeps running).');

  // Keep the process alive so the user can see the output
  // The sandbox runs independently — Ctrl+C just detaches this script
  await new Promise(() => {});
}

main().catch((err) => {
  console.error('❌ Launch failed:', err.message || err);
  process.exit(1);
});
