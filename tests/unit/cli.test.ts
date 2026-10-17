import test from 'tape'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const entry = process.env.TESTENV === 'prod' ? '../../builds/cli.mjs' : '../../bin/index.ts'
const cli = fileURLToPath(new URL(entry, import.meta.url))

// Fixtures describe the command contract independently of parser internals.
test('CLI expands native globs and selects output formats', t => {
  const cwd = mkdtempSync(join(tmpdir(), 'obsidian-cli-'))
  t.teardown(() => rmSync(cwd, { recursive: true, force: true }))
  mkdirSync(join(cwd, 'nested'))
  writeFileSync(join(cwd, 'a.md'), '# Alpha')
  writeFileSync(join(cwd, 'nested', 'b.md'), 'Beta')
  const run = (...args) => spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf8' })
  const json = run('**/*.md', 'a.md')
  t.equal(json.status, 0)
  const pages = JSON.parse(json.stdout)
  t.equal(pages.length, 2, 'overlapping patterns do not duplicate files')
  t.deepEqual(pages.map(page => page.file), ['a.md', join('nested', 'b.md')])
  t.deepEqual(pages.map(page => page.text), ['Alpha', 'Beta'])
  t.equal(run('--text', '**/*.md').stdout, '# Alpha\nBeta\n')
  t.equal(run('--html', '**/*.md').stdout, '<h1>Alpha</h1>\n<p>Beta</p>\n')
  t.equal(run('**').status, 0, 'directory matches are skipped')
  for (const args of [[], ['missing*.md'], ['--text', '--html', 'a.md'], ['--unknown']]) {
    const result = run(...args)
    t.equal(result.status, 1)
    t.equal(result.stdout, '', 'errors do not pollute stdout')
    t.ok(result.stderr.length > 0)
  }
  const help = run('--help')
  t.equal(help.status, 0)
  t.ok(help.stdout.includes('Usage:'))
  writeFileSync(join(cwd, '--note.md'), 'Option-like filename')
  t.equal(run('--text', '--', '--note.md').stdout, 'Option-like filename\n')
  t.end()
})
