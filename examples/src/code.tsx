import { useMemo } from 'react'

/**
 * A very small TSX/CSS highlighter.
 *
 * Deliberately not Prism or Shiki: this page shows nine short snippets, and either library costs
 * more over the wire than everything else on the page put together.
 *
 * ONE pass, and the order of the alternatives carries the rules: a regex takes the first branch
 * that matches at a position, so comments and strings are claimed before anything can look
 * inside them — a keyword within a string stays a string.
 *
 * A two-pass version that parked matches behind placeholders came first and was thrown away: the
 * placeholder has to be a sequence the source can never contain, and every candidate is either a
 * control character — which lint rightly refuses inside a pattern — or something a snippet could
 * legitimately hold.
 */
const GRAMMAR = new RegExp(
  [
    '(//[^\\n]*)', // comment
    '(`[^`]*`|\'[^\']*\'|"[^"]*")', // string
    '(&lt;/?)([A-Z][\\w.]*)', // a tag, already escaped by the time we see it
    '(--[\\w-]+)', // a CSS custom property, which the theming snippets are made of
    '\\b(import|from|export|const|let|function|return|type|interface|default|as|new|if|else)\\b',
  ].join('|'),
  'g',
)

function escaped(source: string): string {
  return source.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function wrap(className: string, text: string): string {
  return `<span class="${className}">${text}</span>`
}

function highlight(source: string): string {
  return escaped(source).replace(
    GRAMMAR,
    (
      match: string,
      comment?: string,
      quoted?: string,
      open?: string,
      tag?: string,
      property?: string,
      keyword?: string,
    ) => {
      if (comment !== undefined) return wrap('c', match)
      if (quoted !== undefined) return wrap('s', match)
      if (tag !== undefined) return `${open ?? ''}${wrap('t', tag)}`
      if (property !== undefined) return wrap('t', match)
      if (keyword !== undefined) return wrap('k', match)
      return match
    },
  )
}

/**
 * 🛑 `source` must stay a literal from this repository — the snippets in `examples.ts` and the
 * API list, and nothing else. `escaped` neutralises `&`, `<` and `>` before the pass runs, so
 * the only markup that survives is the spans this file writes; feed it anything a reader typed
 * and that guarantee is only as good as the escaping. There is no reason to: it exists to render
 * code the page ships with.
 */
export function Code({ source, caption }: { source: string; caption?: string }) {
  const html = useMemo(() => highlight(source.trim()), [source])

  return (
    <figure className="code">
      <pre className="code__pre">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
      {caption && <figcaption className="code__caption">{caption}</figcaption>}
    </figure>
  )
}
