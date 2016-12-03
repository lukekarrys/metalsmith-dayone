const path = require('path')
const isAbsolute = require('is-absolute')
const debug = require('./lib/debug')
const unzip = require('./lib/unzip-flat')
const buildFiles = require('./lib/files')

const dayone = ({
  journals: onlyJournals,
  tags: onlyTags,
  markdown: markdownOptions,
  path: dayonePath
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

  if (!dayonePath) {
    debug('Source directory is all dayone files')
    return build(null, msFiles, true)
  }

  dayonePath = getPath(dayonePath)
  const isZip = path.extname(dayonePath) === '.zip'
  debug('Looking for dayone files in %s', dayonePath)

  return isZip
    ? unzip(dayonePath, { lazyEntries: true }, build)
    : metalsmith.read(dayonePath, build)
}

module.exports = dayone
