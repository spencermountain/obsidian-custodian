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

Everything is always more complicated than you think—

—but I'll admit, I did shake my head sanctimoniously when I found out **obsidian** will not release any code or details about parsing their markdown syntax.

Everyone is writing notes in their syntax - and it's not possible to _get the information back out?_ - it's stuck in this ad-hoc markup syntax -

...which means that people have to write endless half-baked parsers - and all the plugins are slightly buggy in their own unique ways.

This drives me crazy.

...and what's worse is that it's a javaScript application! - which means they have almost-certainly scratched-together some regexes on [remark](https://github.com/remarkjs/remark), and are shy about it, or are moating it intentionally.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>
<img height="50px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>

Sorry, I know how I sound.
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

All that being said, I decided to do a good job with this parser, aimed at getting structured JSON out of your notes - with a secondary goal to support safe machine-editing.

It is spec-safe, using these [fantastic remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins):

- [remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse) - parses CommonMark into the internal syntax tree.
- [remark-gfm](https://github.com/remarkjs/remark-gfm) - adds tables, task lists, strikethrough, footnotes, and autolinks.
- [remark-math](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math) - adds inline and block math syntax.
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) - recognizes and preserves YAML frontmatter without parsing its contents.
- [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify) - serializes the tree back to Markdown after edits.

it drops to custom regexes only when necessary, for supporting novel [syntax additions](https://obsidian.md/help/obsidian-flavored-markdown).

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

we also support a fair-amount of safe document editing, like:

```js
// grab that link and change it
const page = custodian('hello [[world]]')
const link = page.links()[0]
link.title = 'cruel ' + link.title
page.html()
// '<p>hello <a href="world" class="internal-link" data-href="world">cruel world</a></p>'

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

```bash
# get JSON output
npx obsidian-custodian /path/to/file.md
npx obsidian-custodian /my/dir/**/*.md

# text/html outputs
npx obsidian-custodian --text path/to/file.md
npx obsidian-custodian --html path/to/file.md
```

Pipe the JSON into `jq` for handy parsing:

```bash
# get all todo lists in a directory
npx obsidian-custodian 'notes/**/*.md' | jq '.[].tasks''
```

The CLI requires >=Node22 for native glob support.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

<img height="50px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

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

## API

```js
import custodian from 'obsidian-custodian'
const options = {
  gfm: {} //remark-gfm options
  math: {}, //remark-math options
  markdown:{} //remark-stringify options
}
const page = custodian(markdown, options) // (sync)

// output formats:
const json = page.json() // full page details
const md = page.markdown() // rebuild obsidian syntax
const html = page.html() // html with unstyled classes
const tree = page.ast() // get the abstract-syntax-tree (in unist fmt)

// modifications
page.prepend('It was the best of times..\n')
page.append('\nThe End')

// specific page-elements
page.headings() // ### Foo
heading.depth // get/set

page.highlights() // ==foo==
highlight.color // get/set

page.links() // [[foo]]
link.title // get/set
link.target // get/set

page.tasks() // - [ ] foo
task.checked // get/set
task.toggle() //change checked or not

page.comments() //Obsidian comments.
comment.text // get/set

page.code() //Code blocks, including Mermaid blocks; excludes inline code.
code.language // get/set

page.frontmatter() //YAML frontmatter as raw text.
frontmatter.json() //parse YAML

page.lists() // * foo
page.embeds() // ![[Foo.jpg]]
page.callouts() // > [!foo]
page.footnotes() // [^id]
page.paragraphs() // text blocks including inside lists and quotes.
page.math() // Inline and block math.
page.tables() // Tables, with rows and columns
```

for examples, see the obsidian [syntax documentation](https://obsidian.md/help/obsidian-flavored-markdown)

Each of these page selections offers these methods:

| Method                 | Returns                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `item.json()`          | A detached structured description of the item.                   |
| `item.ast()`           | A detached copy of its syntax node.                              |
| `item.update(changes)` | The item handle, after validating and applying supported fields. |
| `item.remove()`        | The page, after removing the item.                               |

### Editing

Editing the JSON or AST copies does not modify the page. Use `update()` to make changes. Updating or removing a detached item throws an error.

```js
const input = `# Old title

[[Note|Label]]

- [ ] Write a draft
`
const page = custodian(input)

page.headings()[0].update({ text: 'New title', depth: 2 })
page.links()[0].update({ target: 'Another note', alias: 'Read more' })
page.tasks()[0].update({ checked: true })
page.append('\nA final paragraph.')

console.log(page.markdown())
/*
## New title

[[Another note|Read more]]

- [x] Write a draft

A final paragraph.
*/
```

Supported update fields depend on the item:

| Item                               | Fields                                                                  |
| ---------------------------------- | ----------------------------------------------------------------------- |
| Heading                            | `text`, `depth` (1–6)                                                   |
| Paragraph or highlight             | `text`                                                                  |
| Wikilink or Obsidian embed         | `target`, `alias`, `heading`, `block`                                   |
| Markdown link                      | `url`, `text`, `title`                                                  |
| Markdown image                     | `url`, `alt`, `title`                                                   |
| Task                               | `checked` (boolean)                                                     |
| Callout                            | `title`, `calloutType`, `fold` (`null`, `'expanded'`, or `'collapsed'`) |
| Code block                         | `value`, `lang`, `meta`                                                 |
| Math, comment, or YAML frontmatter | `value`                                                                 |

Setting `text` replaces the item's inline content with literal text. Other item types support inspection and removal, but do not currently expose update fields. A wikilink can specify either a heading or a block fragment; use `null` to clear an alias or fragment.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

### Remark usage

Use `obsidian-custodian/remark` to add Obsidian syntax to a unified/remark pipeline. This export operates on syntax trees and does not create a page or expose the page API. It includes the GFM, math, and YAML frontmatter plugins.

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkObsidian from 'obsidian-custodian/remark'

const processor = unified()
  .use(remarkParse)
  .use(remarkObsidian)
  .use(remarkStringify, { bullet: '-' })

const input = '> [!note] Example\n> Hello [[world]] and ==highlights==.'

const tree = processor.runSync(processor.parse(input), { value: input })
console.log(tree)
console.log(processor.stringify(tree))

// Or parse, transform, and serialize in one synchronous call:
const output = processor.processSync(input)
console.log(String(output))
```

Call `runSync()` after `parse()` to apply the Obsidian transforms, such as callout recognition. Pass `gfm` and `math` options to `.use(remarkObsidian, options)`; pass Markdown formatting options to `remarkStringify`. The plugin preserves custom nodes such as `wikiLink`, `embed`, and `callout`; HTML rendering requires handlers for those nodes.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

---

### See also

- [flowershow/remark-wiki-link](https://github.com/flowershow/remark-wiki-link) - [unmaintained build](https://github.com/flowershow/remark-wiki-link/issues/28)
- [johackim/remark-obsidian](https://github.com/johackim/remark-obsidian) - HTML output only
- [zoni/obsidian-export](https://github.com/zoni/obsidian-export) - Rust CLI

PRs welcome
MIT
