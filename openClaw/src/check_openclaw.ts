import 'dotenv/config';
import { Sandbox } from 'e2b';

async function main() {
  const sandbox = await Sandbox.create('openclaw');
  
  console.log("--- openclaw init --help ---");
  const out2 = await sandbox.commands.run('openclaw init --help');
  console.log(out2.stdout);

  await sandbox.kill();
}
main().catch(console.error);
