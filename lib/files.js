const path = require('path')
const marked = require('marked')
const _ = require('lodash')
const debug = require('./debug')
const { tag: tagMatches, journal: journalMatches } = require('./match')

const rEntry = /dayone2:\/\/view?entryId=([A-Z0-9]+)/g
const rPhoto = /dayone-moment:\/\/([A-Z0-9]+)/g
const photosPath = 'photos/'

const buildFiles = ({
  files,
  deleteFile,
  createFile,
  onlyJournals,
  onlyTags,
  markdownOptions
}) => {
  const journals = _.pickBy(files, (__, file) => path.extname(file) === '.json')
  const photos = _.pickBy(files, (__, file) => file.startsWith(photosPath))

  // If file is a photo, delete it since photos will be
  // added back in later if they are referenced in an entry
  Object.keys(photos).forEach(deleteFile)

  Object.keys(journals).forEach((journal) => {
    // Delete the actual journal file since it doesnt matter anymore
    deleteFile(journal)

    // Try to parse the journal data
    const data = _.attempt(JSON.parse, journals[journal].contents.toString())

    if (_.isError(data)) {
      debug('Error parsing journal %s', journal)
      return
    }

    if (!Array.isArray(data.entries)) {
      debug('No entries for journal %s', journal)
      return
    }

    const isMatch = !!journalMatches(onlyJournals, journal)
    debug('Journal %s matches %s based on name %s', journal, isMatch, onlyJournals)

    if (isMatch) {
      const entries = data.entries.filter((entry) => tagMatches(onlyTags, entry.tags))
      debug('Found %s matched entries for journal %s based on tags %s', entries.length, journal, onlyTags)

      entries.forEach((entry) => {
        const html = marked(entry.text, markdownOptions)
          // Rewrite internal entry links
          .replace(rEntry, (__, id) => `/${id}.html`)
          // Rewrite image src
          .replace(rPhoto, (__, id) => {
            // Photos are referenced by identifier in the content
            const photoInfo = _.find(entry.photos, { identifier: id })
            // Double check to make sure that the photo exists
            const photoPath = _.findKey(photos, (photo, id) => id.startsWith(photosPath + photoInfo.md5))

            // photo doesnt exist for some reason?
            // I've checked and for a few posts DayOne doesn't export the photo
            if (!photoPath) {
              debug('Missing image in journal %s entry %s photo %s', journal, entry.uuid, id)
              return '/does-not-exists.jpg'
            }

            // Add the photo back to the output since its referenced
            createFile(photoPath, photos[photoPath])

            // And finally rewrite the src
            return `/${photoPath}`
          })

        createFile(`${entry.uuid}.html`, {
          contents: new Buffer(html),
          dayone: Object.assign({}, entry, {
            journal: path.basename(journal, '.json').toLowerCase()
          })
        })
      })
    }
  })
}

module.exports = buildFiles
