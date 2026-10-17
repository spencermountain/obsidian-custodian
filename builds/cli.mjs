#!/usr/bin/env node
import fs from 'node:fs';
import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import parsePage from '../builds/obsidian-custodian.mjs';

const help = `Usage: obsidian-custodian [--text | --html] <glob> [glob ...]

Parse Markdown files using Node's native glob support (Node 22+).
Quote patterns so Node expands them: obsidian-custodian 'notes/**/*.md'

Default output is a JSON array of pages, each with a file field.
--text       Output plain text instead of JSON
--html       Output HTML instead of JSON
--help, -h   Show this help
--           Treat remaining arguments as file patterns
`;

const main = () => {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      text: { type: 'boolean' },
      html: { type: 'boolean' },
      help: { type: 'boolean', short: 'h' }
    }
  });
  if (values.help) {
    process.stdout.write(help);
    return
  }
  if (values.text && values.html) {
    throw new Error('Choose either --text or --html, not both.')
  }
  if (!positionals.length) {
    throw new Error('Provide a file or glob pattern. Use --help for usage.')
  }
  if (typeof fs.globSync !== 'function') {
    throw new Error('The CLI requires Node 22+ for native glob support.')
  }

  // Deduplicate overlapping patterns while preserving useful relative file names.
  const matches = new Map();
  positionals.forEach(pattern => {
    fs.globSync(pattern).forEach(file => {
      if (fs.statSync(file).isFile()) { matches.set(resolve(file), file); }
    });
  });
  const files = [...matches.values()].sort();
  if (!files.length) { throw new Error('No files matched the supplied patterns.') }

  const pages = files.map(file => ({ file, page: parsePage(fs.readFileSync(file, 'utf8')) }));
  let output;
  if (values.text) {
    output = pages.map(({ page }) => page.text()).join('\n');
  } else if (values.html) {
    output = pages.map(({ page }) => page.html()).join('\n');
  } else {
    output = JSON.stringify(pages.map(({ file, page }) => ({ file, ...page.json() })), null, 2);
  }
  process.stdout.write(output + '\n');
};

// Keep stdout machine-readable, including when reading or parsing a file fails.
try {
  main();
} catch (error) {
  process.stderr.write(`obsidian-custodian: ${error.message}\n`);
  process.exitCode = 1;
}
