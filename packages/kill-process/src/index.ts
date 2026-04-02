import { execSync } from 'child_process';

const name = process.argv[2];

if (!name) {
  console.error('Usage: kill-process <name>');
  process.exit(1);
}

try {
  const command =
    process.platform === 'win32'
      ? `wmic process where "commandline like '%${name}%'" delete`
      : `pkill -f "${name}"`;

  execSync(command, { stdio: 'pipe' });
  console.log(`Killed processes with name: ${name}`);
} catch {
  console.log(`No processes found with name: ${name}`);
}
