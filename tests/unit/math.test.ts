import test from 'tape'
import parsePage from '../lib.ts'
import readFile from '../examples/index.ts'

test('math/inline-math', (t) => {
  const input = readFile('math/inline-math')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.deepEqual(page.math().map((item) => [item.json().type, item.json().value]), [
    ['inlineMath', 'E = mc^2'], ['inlineMath', 'A = \\pi r^2'], ['inlineMath', '\\frac{a}{b}']
  ], 'inline formulas preserve LaTeX')
  t.equal(page.paragraphs().length, 2, 'math remains inside paragraphs')
  t.equal(page.code().length, 0, 'math is not code')
  t.end()
})

test('math/inline-math - serialized and reparsed', (t) => {
  const input = readFile('math/inline-math')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.deepEqual(page.math().map((item) => [item.json().type, item.json().value]), [
    ['inlineMath', 'E = mc^2'], ['inlineMath', 'A = \\pi r^2'], ['inlineMath', '\\frac{a}{b}']
  ], 'inline formulas preserve LaTeX')
  t.equal(page.paragraphs().length, 2, 'math remains inside paragraphs')
  t.equal(page.code().length, 0, 'math is not code')
  t.end()
})

test('math/block-math', (t) => {
  const input = readFile('math/block-math')
  const page = parsePage(input)
  t.equal(page.markdown(), input, 'untouched source is preserved')

  t.equal(page.math().length, 1, 'one display formula')
  t.equal(page.math()[0]?.json().type, 'math', 'display math node')
  t.equal(page.math()[0]?.json().value, [
    '\\begin{aligned}', 'a^2 + b^2 &= c^2 \\\\',
    'x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', '\\end{aligned}'
  ].join('\n'), 'LaTeX line breaks and commands preserved')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['Before the equation.', 'After the equation.'], 'surrounding paragraphs')
  t.end()
})

test('math/block-math - serialized and reparsed', (t) => {
  const input = readFile('math/block-math')
  const original = parsePage(input)
  // Force serialization instead of returning the cached source.
  original.append('')
  const page = parsePage(original.markdown())

  t.equal(page.math().length, 1, 'one display formula')
  t.equal(page.math()[0]?.json().type, 'math', 'display math node')
  t.equal(page.math()[0]?.json().value, [
    '\\begin{aligned}', 'a^2 + b^2 &= c^2 \\\\',
    'x &= \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', '\\end{aligned}'
  ].join('\n'), 'LaTeX line breaks and commands preserved')
  t.deepEqual(page.paragraphs().map((item) => item.text()), ['Before the equation.', 'After the equation.'], 'surrounding paragraphs')
  t.end()
})
