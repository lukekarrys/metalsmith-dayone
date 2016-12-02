const path = require('path')

const toArray = (val) => Array.isArray(val) ? val : (val != null ? [val] : [])

const journalMatches = (journals, journal) => {
  if (!journals || !journals.length) return true

  const findJournal = path.basename(journal.toLowerCase(), '.json')
  return toArray(journals).find((j) => j.toLowerCase() === findJournal)
}

const tagMatches = (tags, tag) => {
  if (!tags || !tags.length) return true

  const findTags = toArray(tag).map((t) => t.toLowerCase())
  return toArray(tags).find((t) => findTags.includes(t.toLowerCase()))
}

module.exports.journal = journalMatches
module.exports.tag = tagMatches
