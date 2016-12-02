const yauzl = require('yauzl')
const debug = require('./debug')

const toBuffer = (stream, cb) => {
  const bufs = []
  stream.on('data', (d) => bufs.push(d))
  stream.on('end', () => cb(null, Buffer.concat(bufs)))
  stream.on('error', (err) => cb(err))
}

// Unzips a file to a flat object of { FILE_NAME: { contents: <Buffer> }, ... }
module.exports = (zip, options, cb) => yauzl.open(zip, options, (err, zipfile) => {
  if (err) {
    debug('Error reading zipfile %s', err)
    return cb(err)
  }

  const cache = {}
  const next = () => zipfile.readEntry()

  zipfile.on('entry', function (entry) {
    const { fileName } = entry

    // Skip directories since it returns a flat object
    if (/\/$/.test(fileName)) return next()

    zipfile.openReadStream(entry, (err, readStream) => {
      if (err) {
        debug('Error opening read stream on %s', entry)
        return next()
      }

      toBuffer(readStream, (err, contents) => {
        if (err) {
          debug('Error reading buffer from read stream on %s', entry)
          return next()
        }

        cache[fileName] = { contents }
        next()
      })
    })
  })

  zipfile.on('end', () => {
    debug('Unzip complete. Read %s files', Object.keys(cache).length)
    cb(null, cache)
  })

  zipfile.on('error', (err) => {
    debug('Unzip error %s', err)
    cb(err)
  })

  // Start read
  next()
})
