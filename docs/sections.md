# Section types

A section represents one part of a Markdown document. Sections can be entire blocks, such as paragraphs and tables, or inline content, such as links and emphasized text. A paragraph can contain several other sections.

The names below are the classes in `src/API/Section`. The **node type** is the corresponding internal AST type. Not every class has a dedicated page selector: some represent children used during rendering.

Section output methods are `json()`, `text()`, `html()`, `markdown()`, and `ast()`. Each accepts its own setting, such as `heading.text('inline')` or `callout.text('body')`. Page output methods accept an options object for the whole document.

## Document structure

### Section

The shared base class for all sections, and the fallback for unrecognized node types supplied by plugins. It provides common output and editing behavior. It does not represent a particular Markdown syntax.

### Root

**Node type:** `root`

The document container. Its children are the top-level blocks, such as headings, paragraphs, and lists. It has no Markdown marker of its own.

### Paragraph

**Node type:** `paragraph`

A block of prose, usually separated from surrounding blocks by blank lines. It contains inline sections such as text, links, and emphasis. A paragraph is one kind of block; lists, tables, and headings are other kinds.

### Heading

**Node type:** `heading`

A heading with a depth from one to six, such as `## Overview`. Underlined headings using `===` or `---` also become heading sections. Its children contain the heading's text and inline formatting.

### Quote

**Node type:** `blockquote`

A quoted block introduced by `>`. It can contain paragraphs, lists, and other blocks, including nested quotes.

### Break

**Node type:** `break`

An explicit hard line break within a paragraph, written with two trailing spaces or a backslash before the newline. It is distinct from an ordinary newline or a blank line between blocks.

### ThematicBreak

**Node type:** `thematicBreak`

A horizontal divider, such as `---`, `***`, or `___` on its own line. Context distinguishes it from a heading underline or a frontmatter delimiter.

## Text and formatting

### Text

**Node type:** `text`

Literal text within another section. For example, `Hello ` in `Hello **world**` is a text section, while the bold portion is a strong section containing its own text.

### Emphasis

**Node type:** `emphasis`

Italic emphasis written as `*text*` or `_text_`. It contains inline children, allowing formatting and links inside it.

### Strong

**Node type:** `strong`

Bold emphasis written as `**text**` or `__text__`. Like emphasis, it contains inline children.

### Strikethrough

**Node type:** `delete`

Crossed-out text written as `~~text~~`. The internal name `delete` describes strikethrough formatting, not an editing operation.

### Highlight

**Node type:** `highlight`

Obsidian highlighted text written as `==text==`. It contains the highlighted inline content and renders as a `<mark>` element in HTML.

## Lists

### List

**Node type:** `list`

An ordered or unordered list, such as items beginning with `1.` or `-`. It contains list-item sections and records whether the list is ordered and its starting number.

### ListItem

**Node type:** `listItem`

One entry in a list. It can contain paragraphs and nested blocks. Ordinary list entries use this class; checkbox entries use its `Task` subclass.

### Task

**Node type:** `listItem` with a boolean `checked` value

A checkbox list entry, such as `- [ ] Todo` or `- [x] Done`. It extends `ListItem` and owns task metadata and checkbox rendering. `page.tasks()` returns these sections. Read or assign `task.checked` to inspect or change completion; edits update the page's Markdown and HTML. The underlying AST still uses `listItem`.

## Tables

### Table

**Node type:** `table`

A pipe-delimited Markdown table. It contains rows and records column alignment from the separator row, such as `:---` or `---:`.

### TableRow

**Node type:** `tableRow`

One row of a table, containing table-cell sections. The first row supplies the table's column headings.

### TableCell

**Node type:** `tableCell`

One cell in a table row. It contains inline content, such as text, emphasis, or links. Its position determines whether HTML uses a header cell or a body cell.

## Links and embeds

### Link

**Node type:** `link`

A standard Markdown link, such as `[Label](https://example.com)`. It contains the visible label and stores the destination URL and optional Markdown title. Its `title` setter edits the visible label; its `target` setter edits the destination.

### WikiLink

**Node type:** `wikiLink`

An Obsidian internal link, such as `[[Note]]` or `[[Note|Label]]`. It can target a heading with `[[Note#Heading]]` or a block with `[[Note#^block-id]]`. It extends the link class and supports editing the label and target.

### LinkReference

**Node type:** `linkReference`

A link whose destination is defined elsewhere, such as `[Label][ref]` paired with `[ref]: https://example.com`. It resolves the matching definition from the page. Editing its target converts it into a direct link.

### Definition

**Node type:** `definition`

A reusable destination declaration, such as `[ref]: https://example.com "Optional title"`. Reference links and reference images use it to resolve their destinations. The definition itself is not a visible HTML link.

### Embed

**Node type:** `embed`

An Obsidian embed written as `![[target]]`. The target can be an image, note, or another attachment, with optional heading or block references. Image embeds can specify dimensions, such as `![[photo.jpg|500]]`. HTML renders supported image targets as images and other targets as links; it does not load another note's contents.

### Image

**Node type:** `image`

A standard Markdown image, such as `![Description](photo.jpg)`. It stores the image URL, alternative text, and optional title.

### ImageReference

**Node type:** `imageReference`

An image whose URL comes from a definition, such as `![Description][photo]` paired with `[photo]: photo.jpg`. It extends the image class and resolves the destination using the page's definitions.

## Obsidian sections and metadata

### Callout

**Node type:** `callout`

An Obsidian callout introduced by a marker such as `> [!note] Title`. It contains a callout type, an optional title, and body blocks. A `+` or `-` after the marker specifies an expanded or collapsed foldable callout. `text('body')` returns only its body.

### Tag

**Node type:** `tag`

An Obsidian tag, such as `#project` or `#project/topic`. Its value stores the tag name; rendered text includes the leading `#`.

### Comment

**Node type:** `comment`

An Obsidian comment enclosed in `%%`, such as `%%private note%%`. Comments are omitted from plain text by default. HTML preserves them as escaped `<!-- ... -->` comments, so they remain invisible in the rendered page.

### BlockId

**Node type:** `blockId`

An Obsidian block identifier, such as `^summary`, used as a destination for block links and embeds. Identifiers can also appear as metadata on the block they identify. They are omitted from plain text by default.

### Frontmatter

**Node type:** `yaml`

A YAML metadata block at the beginning of the document, enclosed by `---` lines. It preserves the YAML source and exposes parsed properties in JSON. Plain text and HTML omit it by default.

## Code, math, and raw HTML

### InlineCode

**Node type:** `inlineCode`

An inline code span enclosed in backticks, such as `` `const x = 1` ``. Its contents are literal text rather than nested Markdown formatting.

### Code

**Node type:** `code`

A fenced or indented code block. A fenced block can include a language label, such as `js` or `mermaid`. The section preserves the code as text; HTML emits escaped code rather than executing it or rendering diagrams.

### InlineMath

**Node type:** `inlineMath`

An inline math expression, such as `$x^2$`. It stores the expression's source. HTML preserves that source in a code element marked for math rendering; it does not typeset the expression itself.

### Math

**Node type:** `math`

A display math block delimited by `$$` lines. Like inline math, it preserves the expression's source for a separate math renderer.

### Html

**Node type:** `html`

Raw HTML source embedded in Markdown, such as `<div>Content</div>`. This includes HTML comments written directly in the input, which are distinct from Obsidian `%%` comments. Plain text omits raw HTML by default, and HTML output escapes it rather than inserting executable markup.

## Footnotes

### FootnoteReference

**Node type:** `footnoteReference`

A named footnote marker, such as `[^note]`, appearing in the document's text. It refers to a matching footnote definition. HTML connects the numbered reference to the rendered footnote.

### FootnoteDefinition

**Node type:** `footnoteDefinition`

The body of a named footnote, introduced by `[^note]:`. It can contain multiple blocks. HTML collects referenced definitions into a footnotes section with links back to their references.

### InlineFootnote

**Node type:** `inlineFootnote`

An Obsidian footnote written directly at its reference location, such as `^[An explanation]`. It stores the note's inline content without requiring a separate named definition. HTML assigns it a reference and includes its body in the footnotes section.
