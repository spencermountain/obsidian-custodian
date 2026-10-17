// Tokenize before Markdown decodes escapes or interprets link punctuation.
const delimited = (name, opening, closing, { multiline = false, flow = false } = {}) => ({
  concrete: flow,
  name,
  tokenize: function (effects, ok, nok) {
    let opened = 0
    let closed = 0
    let size = 0
    let ticks = 0
    let codeFence = 0
    let escaped = false
    // Match the opening delimiter, or let CommonMark try another construct.
    const start = (code) => {
      if (code !== opening.charCodeAt(opened)) {
        return nok(code)
      }
      if (opened === 0) {
        effects.enter(name)
        if (flow) {
          effects.enter('obsidianCommentData')
        }
      }
      effects.consume(code)
      opened += 1
      if (opened === opening.length) {
        // A flow interruption check only needs the opening marker.
        if (flow && this.interrupt) {
          return ok
        }
        return content
      }
      return start
    }
    // Micromark uses null for EOF and codes below -2 for line endings.
    const content = (code) => {
      if (code === null || (!multiline && code < -2)) {
        return nok(code)
      }
      if (flow && code < -2) {
        // Separate data and line endings keep multiline comments valid at EOF.
        effects.exit('obsidianCommentData')
        effects.enter('lineEnding')
      }
      effects.consume(code)
      if (flow && code < -2) {
        effects.exit('lineEnding')
        effects.enter('obsidianCommentData')
      }
      // Escapes and code spans must not close a highlight's == delimiter.
      let literal = false
      if (name === 'obsidianHighlight') {
        if (code === 96 && !escaped) {
          ticks += 1
          literal = true
        } else if (ticks) {
          if (!codeFence) {
            codeFence = ticks
          } else if (codeFence === ticks) {
            codeFence = 0
          }
          ticks = 0
        }
        literal ||= escaped || codeFence > 0
        escaped = code === 92 && !escaped
      }
      if (!literal && code === closing.charCodeAt(closed)) {
        closed += 1
        if (closed === closing.length) {
          if (size === 0 && name !== 'obsidianComment') {
            return nok(code)
          }
          if (flow) {
            effects.exit('obsidianCommentData')
          }
          effects.exit(name)
          return flow ? end : ok
        }
      } else {
        size += closed + 1
        closed = 0
      }
      return content
    }
    // A block comment must end the line; otherwise try inline parsing.
    const end = (code) => {
      if (code === null || code < -2) {
        return ok(code)
      }
      return nok(code)
    }
    return start
  }
})

const syntax = () => ({
  // Keys are the character codes of possible opening markers.
  flow: { 37: delimited('obsidianComment', '%%', '%%', { multiline: true, flow: true }) },
  text: {
    33: delimited('obsidianEmbed', '![[', ']]'),
    91: delimited('obsidianLink', '[[', ']]'),
    37: delimited('obsidianComment', '%%', '%%', { multiline: true }),
    61: delimited('obsidianHighlight', '==', '==')
  }
})

export default syntax
