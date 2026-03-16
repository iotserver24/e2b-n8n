import 'dotenv/config';
import { Sandbox } from 'e2b';

async function main() {
  const sandbox = await Sandbox.create('openclaw-custom-8g');
  
  console.log("--- openclaw config set --help ---");
  const out1 = await sandbox.commands.run('openclaw config set --help');
  console.log(out1.stdout);
  
  await sandbox.kill();
}
main().catch(console.error);
