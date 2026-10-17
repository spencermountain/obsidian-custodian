import { rmSync } from 'node:fs'

// Only generated output directories are removed, relative to this script.
const directories = ['lib', 'types', 'builds']
directories.forEach(directory => {
  rmSync(new URL(`../${directory}/`, import.meta.url), { recursive: true, force: true })
})
