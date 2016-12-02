const path = require('path')
const isAbsolute = require('is-absolute')
const debug = require('./lib/debug')
const unzip = require('./lib/unzip-flat')
const buildFiles = require('./lib/files')

const dayone = ({
  journals: onlyJournals = [],
  tags: onlyTags = [],
  markdown: markdownOptions = {},
  path: dayonePath = null,
  zip: dayoneZip = null
}) => (msFiles, metalsmith, done) => {
  const getPath = (p) => {
    if (isAbsolute(p)) return p
    return path.resolve(metalsmith.directory(), p)
  }

  const build = (err, files) => {
    if (err) {
      debug('Error building files %s', err)
      return done(err)
    }

    debug('Building %s files', Object.keys(files).length)

    // Delete processed files if operating directly on metalsmith src
    const shouldDelete = files === msFiles

    buildFiles({
      files,
      onlyJournals,
      onlyTags,
      markdownOptions,
      deleteFile: (file) => shouldDelete && delete msFiles[file],
      createFile: (file, data) => (msFiles[file] = data)
    })

    done()
  }

  if (!dayonePath && !dayoneZip) {
    debug('Source directory is all dayone files')
    return build(null, msFiles, true)
  }

  if (dayonePath) {
    dayonePath = getPath(dayonePath)
    debug('Looking for dayone files in %s', dayonePath)
    return metalsmith.read(dayonePath, build)
  }

  if (dayoneZip) {
    dayoneZip = getPath(dayoneZip)
    debug('Looking for dayone zip file at %s', dayoneZip)
    return unzip(dayoneZip, { lazyEntries: true }, build)
  }
}

module.exports = dayone
