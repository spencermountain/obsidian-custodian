import Section from './Section.ts'
import Link from './Link.ts'
import Embed from './Embed.ts'
import Callout from './Callout.ts'
import { register, createSection } from './registry.ts'

// Load the built-in section types once at the API entry point.
register('*', Section)
register('wikiLink', Link)
register('link', Link)
register('linkReference', Link)
register('embed', Embed)
register('image', Embed)
register('imageReference', Embed)
register('callout', Callout)

export default createSection
