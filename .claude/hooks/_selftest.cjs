/* Temporary self-test for block-destructive-commands.cjs. Safe to delete. */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const GUARD = path.join(__dirname, 'block-destructive-commands.cjs');

// [command, shouldBlock]
const CASES = [
  ['ls -la', false],
  ['git status', false],
  ['npm run build', false],
  ['rm file.txt', false],
  ['cat src/app.js', false],
  ['r' + 'm -rf build', true],
  ['sudo r' + 'm -r -f /', true],
  ['npm run build && r' + 'm -rf node_modules', true],
  ['git ' + 'push -f origin main', true],
  ['git ' + 'reset --hard HEAD~3', true],
  ['git ' + 'clean -fd', true],
  ['dd if=/dev/zero of=/dev/sda', true],
  ['psql -c "DR' + 'OP TABLE users"', true],
  ['shut' + 'down -h now', true],
];

let pass = 0;
let fail = 0;
for (const [command, shouldBlock] of CASES) {
  const res = spawnSync('node', [GUARD], {
    input: JSON.stringify({ tool_name: 'Bash', tool_input: { command } }),
    encoding: 'utf8',
  });
  const denied = res.stdout.includes('"permissionDecision":"deny"');
  const ok = denied === shouldBlock;
  if (ok) pass++;
  else fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  block=${denied} expected=${shouldBlock}  | ${command}`);
}
// Non-Bash tool should always pass through.
const other = spawnSync('node', [GUARD], {
  input: JSON.stringify({ tool_name: 'Read', tool_input: { file_path: 'x' } }),
  encoding: 'utf8',
});
const otherOk = other.stdout.trim() === '';
console.log(`${otherOk ? 'PASS' : 'FAIL'}  non-Bash passes through`);
console.log(`\n${pass + (otherOk ? 1 : 0)}/${CASES.length + 1} passed, ${fail + (otherOk ? 0 : 1)} failed`);
process.exit(fail === 0 && otherOk ? 0 : 1);
