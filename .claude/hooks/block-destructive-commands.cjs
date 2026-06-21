#!/usr/bin/env node
/**
 * Project PreToolUse guard — blocks destructive shell commands.
 *
 * Wired up in `.claude/settings.json` under hooks.PreToolUse (matcher "Bash").
 * Claude Code pipes the tool call to this script as JSON on stdin:
 *   { "tool_name": "Bash", "tool_input": { "command": "rm -rf /" }, ... }
 *
 * Behaviour:
 *   • If the command matches a destructive rule below, we emit a PreToolUse
 *     "deny" decision (with a reason) and the command never runs.
 *   • Otherwise we stay silent and exit 0, so normal permission flow continues
 *     (we deliberately do NOT emit "allow", which would bypass other checks).
 *   • On any parse error we fail OPEN (exit 0) — a bug in this guard must never
 *     wedge every Bash command.
 *
 * Written in CommonJS (.cjs) so it runs regardless of the repo's module type,
 * and in plain Node (no deps) so every contributor can run it.
 *
 * ── Extending / disabling ─────────────────────────────────────────────────────
 *   • Add a rule: push `{ label, test }` onto DESTRUCTIVE_RULES.
 *   • Bypass once: run the command yourself in the terminal (the `!cmd` prompt),
 *     or temporarily turn the hook off via the `/hooks` menu.
 *   • These rules are intentionally conservative (block clearly irreversible /
 *     data-destroying ops). They are heuristics, not a security boundary.
 */
'use strict';

// Split a command line into segments that run independently, so a destructive
// fragment buried in a `&&` / `;` / pipe chain is still inspected on its own.
const segmentize = (cmd) => cmd.split(/(?:\|\||&&|[|;&\n])+/);

const flagBlobOf = (seg) => (seg.match(/(?:^|\s)-{1,2}[a-zA-Z]+/g) || []).join(' ');

const DESTRUCTIVE_RULES = [
  {
    label: 'recursive + forced file deletion (rm -rf style)',
    test: (cmd) =>
      segmentize(cmd).some((seg) => {
        if (!/\brm\b/.test(seg)) return false;
        const flags = flagBlobOf(seg);
        const hasR = /--recursive\b/.test(seg) || /-[a-zA-Z]*r/i.test(flags);
        const hasF = /--force\b/.test(seg) || /-[a-zA-Z]*f/i.test(flags);
        return hasR && hasF;
      }),
  },
  {
    label: 'recursive delete of a root/home/wildcard path (rm -r / | ~ | *)',
    test: (cmd) =>
      segmentize(cmd).some(
        (seg) =>
          /\brm\b/.test(seg) &&
          (/--recursive\b/.test(seg) || /-[a-zA-Z]*r/i.test(flagBlobOf(seg))) &&
          /\s(\/|~|\*|\.\/\*|\$HOME)(\s|$)/.test(seg)
      ),
  },
  {
    label: 'Windows force/recursive deletion (Remove-Item -Recurse -Force / rd /s /q / del /f /s)',
    test: (cmd) =>
      (/remove-item\b/i.test(cmd) && /-recurse\b/i.test(cmd) && /-force\b/i.test(cmd)) ||
      /\b(rd|rmdir)\b[^\n]*\/s/i.test(cmd) ||
      /\bdel\b[^\n]*\/s/i.test(cmd),
  },
  {
    label: 'raw disk / filesystem write or wipe (dd, mkfs, shred, wipefs, fdisk)',
    test: (cmd) =>
      /\bdd\b[^\n]*\bof=\/dev\//i.test(cmd) ||
      /\bmkfs(\.\w+)?\b/i.test(cmd) ||
      /\bshred\b/i.test(cmd) ||
      /\bwipefs\b/i.test(cmd) ||
      /\bfdisk\b/i.test(cmd) ||
      />\s*\/dev\/(sd|nvme|disk|hd)\w*/i.test(cmd),
  },
  {
    label: 'disk format (format / mkfs / Format-Volume)',
    test: (cmd) => /\bformat-volume\b/i.test(cmd) || /(^|[|;&\s])format\s+[a-z]:/i.test(cmd),
  },
  {
    label: 'fork bomb',
    test: (cmd) => /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/.test(cmd),
  },
  {
    label: 'destructive git operation (force push, hard reset, clean -f)',
    test: (cmd) =>
      /\bgit\b[^\n]*\bpush\b[^\n]*(--force(?!-with-lease)\b|\s-f\b)/i.test(cmd) ||
      /\bgit\b[^\n]*\breset\b[^\n]*--hard\b/i.test(cmd) ||
      /\bgit\b[^\n]*\bclean\b[^\n]*-[a-zA-Z]*f/i.test(cmd),
  },
  {
    label: 'destructive SQL (DROP DATABASE/TABLE, TRUNCATE)',
    test: (cmd) => /\bdrop\s+(database|table|schema)\b/i.test(cmd) || /\btruncate\s+table\b/i.test(cmd),
  },
  {
    label: 'machine power state change (shutdown / reboot / halt / poweroff)',
    test: (cmd) => /(^|[|;&\s])(shutdown|reboot|halt|poweroff)\b/i.test(cmd),
  },
];

const deny = (rule, command) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason:
          `Blocked by project guard (.claude/hooks/block-destructive-commands.cjs): ${rule.label}.\n` +
          `Command: ${command}\n` +
          `If this is genuinely intended, run it yourself in the terminal (the "!" prompt) or ` +
          `disable this hook temporarily via /hooks.`,
      },
    })
  );
  process.exit(0);
};

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  raw += chunk;
});
process.stdin.on('end', () => {
  let command = '';
  try {
    const data = JSON.parse(raw || '{}');
    // Only police Bash; let everything else through untouched.
    if (data.tool_name && data.tool_name !== 'Bash') process.exit(0);
    command = (data.tool_input && data.tool_input.command) || '';
  } catch {
    process.exit(0); // fail open — never block on our own parse error
  }
  if (!command.trim()) process.exit(0);

  const rule = DESTRUCTIVE_RULES.find((r) => r.test(command));
  if (rule) deny(rule, command);
  process.exit(0);
});
