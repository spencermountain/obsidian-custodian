<div align="center">
  <div><b>obsidian-custodian</b></div>
  <div>parse and edit obsidian markdown syntax</div>
  <div><code>npm install obsidian-custodian</code></div>
  <div align="center">
    <sub>
      by
      <a href="https://github.com/spencermountain">Spencer Kelly</a>
    </sub>
  </div>
  <img height="50px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>
</div>
<!--2nd row-->
<div align="center">
  <div>
    <a href="https://npmjs.org/package/obsidian-custodian">
    <img src="https://img.shields.io/npm/v/obsidian-custodian.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=obsidian-custodian">
    <img src="https://badgen.net/bundlejs/min/obsidian-custodian" />
  </a>
  </div>
</div>
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

Everything is always more complicated than you think —

— but I'll admit, I did sanctimoniously shake my head when I found out _**obsidian**_ will not release any code, or details for parsing their markdown syntax.

Everyone is writing notes in this syntax - and it's not possible to _get the information back out?_ - it's stuck in this ad-hoc markup format -

... which means that everyone has to write their own parsers - and all the plugins are slightly buggy in different ways...

...and this is a web application! - they've almost certainly just thrown regexes on [remark](https://github.com/remarkjs/remark), and are shy about it, or are moating it intentionally.

This drives me crazy.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
<img height="50px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>

Sorry, I know how I sound.
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

All that being said, I decided to do a good job with this parser, aimed at getting structured JSON out of your notes - with a secondary goal to support safe machine-editing of them.

It's spec-safe, using these _([fantastic](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins))_ remark plugins:

- _[remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse)_ - _commonmark → AST_.
- _[remark-gfm](https://github.com/remarkjs/remark-gfm)_ - _tables, tasks, strikethrough, footnotes, and autolinks_
- _[remark-math](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math)_ - _inline and block math syntax_
- _[remark-frontmatter](https://github.com/remarkjs/remark-frontmatter)_ - _preserves frontmatter sections_
- _[remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify)_ - _serializes AST back to md_

it drops to custom regexes for novel [syntax additions](https://obsidian.md/help/obsidian-flavored-markdown), and edits the [unist AST](https://github.com/syntax-tree/unist) for clean reproductions of obsidian-style markdown.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## Usage

```js
import custodian from 'obsidian-custodian'

const text = `hello [[world]]`
const page = custodian(text)

// clean plaintext
page.text() // 'hello world'

// get everything
page.json()
/* ...
  links: [{
    text: 'world',
    type: 'wikiLink',
    target: 'world',
  }]
*/
```

we also support a fair-amount of safe and intuitive page editing, like:

```js
// grab that link and change it
const link = page.links()[0]
link.title = 'cruel ' + link.title
page.markdown()
// hello [[world|cruel world]]

const md = `
- [x] brush teeth
- [ ] go to work
`
const page = custodian(md)
page.tasks()[1].checked = true
page.markdown()
// - [x] brush teeth
// - [x] go to work
```

#### CLI

If you just want to pipe structured data from your vault, you can:

```bash
# get JSON output
npx obsidian-custodian /path/to/file.md

npx obsidian-custodian --text /my/dir/**/*.md
npx obsidian-custodian --html .
```

pipe it into `jq` to pluck specific things:

```bash
# get all todo lists in a directory
npx obsidian-custodian 'notes/**/*.md' | jq '.[].tasks''
```

The CLI requires >=Node22 for native glob support.

#### TypeScript

```ts
import custodian, { type Page, type TextOptions, type Task } from 'obsidian-custodian'

const md = `
## Shopping
-[ ] Buy coffee
`
const page: Page = custodian(md)
const options: TextOptions = { headings: 'inline', embeds: false }

const str: string = page.text(options)
console.log(str)
// Shopping
// Buy coffee
```

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<img height="50px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## API

```js
import custodian from 'obsidian-custodian'

const options = {
  gfm: {} // remark-gfm options
  math: {}, // remark-math options
  markdown:{} // remark-stringify options
}

const page = custodian(markdown, options)

// full page details
const json = page.json()
// rebuild obsidian syntax
const md = page.markdown()
// get html with unstyled classes
const html = page.html()
// get the internal abstract-syntax-tree (in unist fmt)
const tree = page.ast()

// modifications
page.prepend('It was the best of times..\n')
page.append('\nThe End')
```

Grab specific page-elements, which sometimes have handy methods:

```js
// ### Foo
page.headings()
heading.depth // get/set

// ==foo==
page.highlights()
highlight.color // get/set

// [[foo]]
page.links()
link.title // get/set
link.target // get/set

// - [ ] foo
page.tasks()
task.checked // get/set
task.toggle() //change checked or not

// %%foo%%
page.comments()
comment.text // get/set

// inline + block code, Mermaid blocks
page.code()
code.language // get/set

// YAML frontmatter as raw text.
page.frontmatter()
frontmatter.json() // parsed

// '* foo'
page.lists()
// '![[Foo.jpg]]'
page.embeds()
// '> [!foo]'
page.callouts()
// '[^id]'
page.footnotes()
// text blocks including inside lists and quotes.
page.paragraphs()
// Inline and block math.
page.math()
// Tables, with rows and columns
page.tables()
```

Each of these page selections offers these methods:

```js
item.json()
item.ast()
item.update(changes)
item.remove()
```

for details on syntax, see the [obsidian docs](https://obsidian.md/help/obsidian-flavored-markdown)

### Editing

```js
const input = `
# Old title

[[Note|Label]]

- [ ] Write a draft
`
const page = custodian(input)

page.headings()[0].update({ text: 'New title', depth: 2 })
page.links()[0].update({ target: 'Another note', alias: 'Read more' })
page.tasks()[0].update({ checked: true })
page.append('\nA final paragraph.')

page.markdown()
/*
## New title

[[Another note|Read more]]

- [x] Write a draft

A final paragraph.
*/
```

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

### Remark usage

Use `obsidian-custodian/remark` to add obsidian-syntax support to a unified/remark pipeline.
It includes the GFM, math, and frontmatter plugins.

```js
import remarkObsidian from 'obsidian-custodian/remark'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

const processor = unified()
  .use(remarkParse)
  .use(remarkObsidian)
  .use(remarkStringify, { bullet: '-' })

const input = `
> [!note] Example
> Hello [[world]] and ==highlights==
`

const tree = processor.runSync(processor.parse(input), { value: input })
console.log(tree)
console.log(processor.stringify(tree))

// Or parse, transform, and serialize in one synchronous call:
const output = processor.processSync(input)
console.log(String(output))
```

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

---

### See also

- [flowershow/remark-wiki-link](https://github.com/flowershow/remark-wiki-link) - _[unmaintained](https://github.com/flowershow/remark-wiki-link/issues/28)_
- [johackim/remark-obsidian](https://github.com/johackim/remark-obsidian) - HTML-only output
- [zoni/obsidian-export](https://github.com/zoni/obsidian-export) - Rust CLI

Issues, requests and PRs welcome

MIT
