import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
const dir = path.dirname(fileURLToPath(import.meta.url))

const readFile = (filename) => {
  return fs.readFileSync(path.join(dir, filename)).toString()
}

export default readFile
