<div align="center">
  <div><b>reluctant-obsidian-parser</b></div>
  <div>get reliable JSON from Obsidian markdown</div>
  <div><code>npm install reluctant-obsidian-parser</code></div>
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
    <a href="https://npmjs.org/package/reluctant-obsidian-parser">
    <img src="https://img.shields.io/npm/v/reluctant-obsidian-parser.svg?style=flat-square" />
  </a>
  <a href="https://bundlephobia.com/result?p=reluctant-obsidian-parser">
    <img src="https://badgen.net/bundlejs/min/reluctant-obsidian-parser" />
  </a>
  </div>
</div>
<!-- spacer -->
<img height="20px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>

Everything is always more complicated than you think,

- but I'll admit, I did shake my head in sanctimonious disbelief, when I found out that **obsidian** does not release or even share details, about their internal markdown parser.

People are out there writing notes in their syntax, and it's not currently possible or easy to _get the information back out_ - it's stuck in their ad-hoc markup format.

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

```js
import parsePage from 'reluctant-obsidian-parser'

const str = `hello [[world]]

![[path/to/myFile.jpg|500]]`

const page = parsePage(str)
```

### Support

[spec documentation](https://obsidian.md/help/obsidian-flavored-markdown)

- `[[Link]]1 Internal links
- `![[Link]]1 	Embed files
- `![[Link#^id]]1 	Block references
- `^id1 Defining a block
- `[^id]1 Footnotes
- `%%Text%%1 Comments
- `~~Text~~1 Strikethroughs
- `==Text==1 Highlights
- `\`\`\`1 Code blocks
- `- [ ]1 Incomplete task
- `- [x]1 Completed task
- `> [!note]1 Callouts
- ... Tables

### See also

- [flowershow/remark-wiki-link](https://github.com/flowershow/remark-wiki-link) - unmaintained build is broken _[as of 4.0.0](https://github.com/flowershow/remark-wiki-link/issues/28)_
- [johackim/remark-obsidian](https://github.com/johackim/remark-obsidian) - HTML output only
- [zoni/obsidian-export](https://github.com/zoni/obsidian-export) - Rust CLI

MIT, PRs welcome
