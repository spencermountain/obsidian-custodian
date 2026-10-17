import type { Construct, State } from 'micromark-util-types'

// Accept surrogate halves while reading; validate complete Unicode characters at the end.
const tagCharacter = (code: number) => {
  const char = String.fromCharCode(code)
  if (/[A-Za-z0-9_/-]/.test(char)) { return true }
  return code >= 128 && /[\p{L}\p{N}\p{M}\p{S}\p{Cs}]/u.test(char)
}

// Tokenize tags before escapes are decoded; code and HTML stay under remark's control.
const tag: Construct = {
  name: 'obsidianTag',
  tokenize: function (effects, ok, nok) {
    let value = ''
    const start: State = (code) => {
      const previous = this.previous
      if (previous !== null && previous >= 0 && /[\p{L}\p{N}_/#]/u.test(String.fromCharCode(previous))) {
        return nok(code)
      }
      effects.enter('obsidianTag')
      effects.consume(code)
      return content
    }
    const content: State = (code) => {
      if (code !== null && code >= 0 && tagCharacter(code)) {
        value += String.fromCharCode(code)
        effects.consume(code)
        return content
      }
      if (!/^[\p{L}\p{N}\p{M}\p{S}_/-]+$/u.test(value) || !/[^\p{N}]/u.test(value)) {
        return nok(code)
      }
      effects.exit('obsidianTag')
      return ok(code)
    }
    return start
  }
}

export default tag
