const path = require('path')
const isAbsolute = require('is-absolute')
const debug = require('./debug')
const unzip = require('./unzip-flat')
const buildFiles = require('./files')

const dayone = (options) => (msFiles, metalsmith, done) => {
  let dayoneData = options.data

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
    // const shouldDelete = files === msFiles

    buildFiles(Object.assign({}, options, {
      files,
      deleteFile: (file) => delete msFiles[file],
      createFile: (file, data) => (msFiles[file] = data)
    }))

    done()
  }

  if (!dayoneData) {
    debug('Source directory is all dayone files')
    return build(null, msFiles)
  }

  dayoneData = getPath(dayoneData)
  const isZip = path.extname(dayoneData) === '.zip'
  debug('Looking for dayone files in %s', dayoneData)

  return isZip
    ? unzip(dayoneData, { lazyEntries: true }, build)
    : metalsmith.read(dayoneData, build)
}

module.exports = dayone
