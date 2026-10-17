<div align="center">
  <div><b>reluctant-obsidian</b></div>
  <div>get reliable JSON from Obsidian markdown</div>
  <div><code>npm install reluctant-obsidian</code></div>
  <div align="center">
    <sub>
      by
      <a href="https://github.com/spencermountain">Spencer Kelly</a>
    </sub>
  </div>
  <img height="45px" src="https://user-images.githubusercontent.com/399657/68221824-09809d80-ffb8-11e9-9ef0-6ed3574b0ce8.png"/>
</div>
<!--2nd row-->
<div align="center">
  <div>
    <a href="https://npmjs.org/package/reluctant-obsidian">
    <img src="https://img.shields.io/npm/v/reluctant-obsidian.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=reluctant-obsidian">
    <img src="https://badgen.net/bundlejs/min/reluctant-obsidian" />
  </a>
  </div>
</div>
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

Everything is always more complicated than you think,

——but I'll admit, I did shake my head in sanctimonious disbelief, when I found out that **obsidian** does not release or even share details, about their internal markdown parser.

They have people are out there writing notes in their syntax, and it's not currently possible or easy to _get the information back out_ - it's stuck in their ad-hoc markup format.

Which means that people have to write endless half-baked parsers - and all the plugins that inspect this markdown are slightly buggy and in their own unique ways.

This drives me crazy.

What's worse is that it's a JavaScript application, which means they almost-certainly have scratched-together some regexes on [remark](https://github.com/remarkjs/remark), and are shy about it, or moating it intentionally.

<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

Sorry, I know how I sound. I do think details like these are important, and neglecting them is bad-form, and shows up all the time in our craft.
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

All that being said, I decided to do a good job with this parser, aimed at getting structured JSON out of your notes - with a secondary goal to support safe machine-editing.

I'm going spec-safe with [remark plugins](https://github.com/remarkjs/remark/blob/main/doc/plugins.md#list-of-plugins) and dropping custom regex only when necessary.
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

## Usage

```js
import reluctant from 'reluctant-obsidian'

const str = `hello [[world]]`
const page = reluctant(str)

// clean plaintext
console.log(page.text()) // 'hello world'

// get everything
console.log(page.json())
/*{
  ... 
  links: [{
    text: 'world',
    type: 'internal'
    target: 'world',
  }]
}*/

// grab that link and change it
const link = page.links()[0]
link.text = 'cruel ' + link.text
console.log(page.html())
// 'hello <a href="./world">cruel world</a>'
```

#### CLI

```bash
npx reluctant-md path/to/file.md # JSON output

# non-json outputs
npx reluctant-obsidian --text path/to/file.md
npx reluctant-obsidian --html path/to/file.md

# common transforms
npx reluctant-obsidian --lint path/to/file.md
npx reluctant-obsidian --normalize path/to/file.md
```

### API

`parsePage(markdown, options?)` synchronously returns a page.

Options can contain `gfm` and `math` settings for the corresponding remark plugins, and `markdown` settings for remark-stringify.

| Method                   | Returns                                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| `page.json()`            | Structured JSON with document text, blocks, and the collections below.                                    |
| `page.markdown()`        | The original Markdown until an edit is made; after edits, serialized Markdown with normalized formatting. |
| `page.ast()`             | A detached copy of the internal remark syntax tree.                                                       |
| `page.append(markdown)`  | The page, after adding parsed blocks at the end.                                                          |
| `page.prepend(markdown)` | The page, after adding parsed blocks at the beginning.                                                    |

These selection methods return arrays of item handles, in document order:

| Method               | Selects                                                      |
| -------------------- | ------------------------------------------------------------ |
| `page.blocks()`      | Top-level blocks and nodes with a block ID.                  |
| `page.headings()`    | Headings, with their text and depth.                         |
| `page.paragraphs()`  | Paragraphs, including those inside lists and quotes.         |
| `page.links()`       | Wikilinks, Markdown links, and reference links.              |
| `page.embeds()`      | Obsidian embeds, Markdown images, and reference images.      |
| `page.tasks()`       | List items with a checkbox.                                  |
| `page.lists()`       | Ordered and unordered lists.                                 |
| `page.callouts()`    | Callouts, including their title, type, and fold state.       |
| `page.highlights()`  | Highlighted spans.                                           |
| `page.comments()`    | Obsidian comments.                                           |
| `page.code()`        | Code blocks, including Mermaid blocks; excludes inline code. |
| `page.math()`        | Inline and block math.                                       |
| `page.tables()`      | Tables, with rows and column alignment.                      |
| `page.frontmatter()` | YAML frontmatter as raw text.                                |
| `page.footnotes()`   | Footnote definitions.                                        |

Each selected item offers these methods:

| Method                 | Returns                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `item.json()`          | A detached structured description of the item.                   |
| `item.ast()`           | A detached copy of its syntax node.                              |
| `item.update(changes)` | The item handle, after validating and applying supported fields. |
| `item.remove()`        | The page, after removing the item.                               |

Editing the JSON or AST copies does not modify the page. Use `update()` to make changes. Updating or removing a detached item throws an error.

```js
const page = parsePage('# Old title\n\n[[Note|Label]]\n\n- [ ] Write a draft')

page.headings()[0].update({ text: 'New title', depth: 2 })
page.links()[0].update({ target: 'Another note', alias: 'Read more' })
page.tasks()[0].update({ checked: true })
page.append('\nA final paragraph.')

console.log(page.json())
console.log(page.markdown())
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

### Remark usage

Use `reluctant-obsidian/remark` to add Obsidian syntax to a unified/remark pipeline. This export operates on syntax trees and does not create a page or expose the page API. It includes the GFM, math, and YAML frontmatter plugins.

```js
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'
import remarkObsidian from 'reluctant-obsidian/remark'

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

### Features

We're using these Remark plugins, which are fantastic:

- [remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse) - parses CommonMark into the internal syntax tree.
- [remark-stringify](https://github.com/remarkjs/remark/tree/main/packages/remark-stringify) - serializes the tree back to Markdown after edits.
- [remark-gfm](https://github.com/remarkjs/remark-gfm) - adds tables, task lists, strikethrough, footnotes, and autolinks.
- [remark-math](https://github.com/remarkjs/remark-math/tree/main/packages/remark-math) - adds inline and block math syntax.
- [remark-frontmatter](https://github.com/remarkjs/remark-frontmatter) - recognizes and preserves YAML frontmatter without parsing its contents.

---

[spec documentation](https://obsidian.md/help/obsidian-flavored-markdown)

- `[[Link]]` Internal links
- `![[Link]]` Embed files
- `![[Link#^id]]` Block references
- `^id1` Defining a block
- `[^id]` Footnotes
- `%%Text%%` Comments
- `~~Text~~` Strikethroughs
- `==Text==` Highlights
- `\`\`\`` Code blocks
- `- [ ]` Incomplete task
- `- [x]` Completed task
- `> [!note]` Callouts
- ... Tables

### See also

- [flowershow/remark-wiki-link](https://github.com/flowershow/remark-wiki-link) - unmaintained build is broken _[as of 4.0.0](https://github.com/flowershow/remark-wiki-link/issues/28)_
- [johackim/remark-obsidian](https://github.com/johackim/remark-obsidian) - HTML output only
- [zoni/obsidian-export](https://github.com/zoni/obsidian-export) - Rust CLI

MIT, PRs welcome
