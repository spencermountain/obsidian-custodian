import Section from './Section.ts'
import Root from './Root.ts'
import Paragraph from './Paragraph.ts'
import Heading from './Heading.ts'
import Text from './Text.ts'
import Html from './Html.ts'
import Emphasis from './Emphasis.ts'
import Strong from './Strong.ts'
import Strikethrough from './Strikethrough.ts'
import InlineCode from './InlineCode.ts'
import Code from './Code.ts'
import Break from './Break.ts'
import ThematicBreak from './ThematicBreak.ts'
import Quote from './Quote.ts'
import List from './List.ts'
import ListItem from './ListItem.ts'
import Table from './Table.ts'
import TableRow from './TableRow.ts'
import TableCell from './TableCell.ts'
import Link from './Link.ts'
import WikiLink from './WikiLink.ts'
import LinkReference from './LinkReference.ts'
import Embed from './Embed.ts'
import Image from './Image.ts'
import ImageReference from './ImageReference.ts'
import Callout from './Callout.ts'
import Definition from './Definition.ts'
import FootnoteDefinition from './FootnoteDefinition.ts'
import FootnoteReference from './FootnoteReference.ts'
import InlineFootnote from './InlineFootnote.ts'
import Highlight from './Highlight.ts'
import Tag from './Tag.ts'
import Comment from './Comment.ts'
import BlockId from './BlockId.ts'
import Frontmatter from './Frontmatter.ts'
import Math from './Math.ts'
import InlineMath from './InlineMath.ts'
import { register, createSection } from './registry.ts'

register('*', Section)
register('root', Root)
register('paragraph', Paragraph)
register('heading', Heading)
register('text', Text)
register('html', Html)
register('emphasis', Emphasis)
register('strong', Strong)
register('delete', Strikethrough)
register('inlineCode', InlineCode)
register('code', Code)
register('break', Break)
register('thematicBreak', ThematicBreak)
register('blockquote', Quote)
register('list', List)
register('listItem', ListItem)
register('table', Table)
register('tableRow', TableRow)
register('tableCell', TableCell)
register('link', Link)
register('wikiLink', WikiLink)
register('linkReference', LinkReference)
register('embed', Embed)
register('image', Image)
register('imageReference', ImageReference)
register('callout', Callout)
register('definition', Definition)
register('footnoteDefinition', FootnoteDefinition)
register('footnoteReference', FootnoteReference)
register('inlineFootnote', InlineFootnote)
register('highlight', Highlight)
register('tag', Tag)
register('comment', Comment)
register('blockId', BlockId)
register('yaml', Frontmatter)
register('math', Math)
register('inlineMath', InlineMath)

export default createSection
