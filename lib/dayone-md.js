const marked = require('marked')
const htmlToText = require('html-to-text')
const urlRegex = require('url-regex')()

const toText = (html) => htmlToText.fromString(html, {
  wordwrap: false,
  uppercaseHeadings: false,
  ignoreHref: true,
  ignoreImage: true
}).trim()

const maxLength = (str, length, breakChar = ' ') => {
  const max = str.slice(0, length)
  const end = str.substring(length)
  const next = end.slice(0, end.indexOf(breakChar))
  return max + next === str ? str : `${max}${next}…`
}

// Support dimensions in the image src parsed out to width and height attributes
const renderImageWithDimensions = (src, title, text) => {
  const dimensions = /\s=(\d+)x(\d+)$/
  const d = dimensions.exec(src)
  let out = `<img src="${src.replace(dimensions, '')}" alt="${text}"`
  if (title) out += ` title="${title}"`
  if (d && d[1]) out += ` width="${d[1]}"`
  if (d && d[2]) out += ` height="${d[2]}"`
  out += '>'
  return out
}

module.exports = (md) => {
  const renderer = new marked.Renderer()
  const defaultRenderer = new marked.Renderer()

  // Cache each heading and paragraph element for titles
  const text = {}
  const cacheElementText = (defaultMethod) => {
    text[defaultMethod] = []
    return (...rest) => {
      const value = defaultRenderer[defaultMethod](...rest)
      text[defaultMethod].push(toText(value))
      return value
    }
  }

  // Override renderer to do fun stuff
  renderer.heading = cacheElementText('heading')
  renderer.paragraph = cacheElementText('paragraph')
  renderer.image = renderImageWithDimensions

  const html = marked(md, {
    gfm: true,
    tables: true,
    breaks: true,
    renderer
  })

  // Remove any raw urls from titles
  const titles = [
    ...text.heading,
    ...text.paragraph
  ]
  .map((t) => t.replace(urlRegex, '').trim())
  .filter(Boolean)

  let title = ''
  if (titles.length) {
    // If there are any line breaks, get only the first line
    const firstLine = titles[0].split('\n')[0]
    // Split on any punctuation .!? or opening parens ([
    const sentences = firstLine.match(/[^.!?([]+[.!?([]+/g)
    // If there were sentence boundaries, remove the punctuation character
    const firstSentence = sentences ? sentences[0].slice(0, -1) : firstLine
    // Break at 80 characters (plus next word)
    const maxTitle = maxLength(firstSentence, 80)
    title = maxTitle
  }

  return {
    html,
    title
  }
}
