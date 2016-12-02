const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const p = require('path')
const Metalsmith = require('metalsmith')
const debug = require('metalsmith-debug')
const dayone = require('../')

const emptySrc = '../.empty-src'
const dayoneSrc = '../.dayone/dayone'
const dayoneZip = '../.dayone/dayone.zip'

mkdirp.sync(p.resolve(__dirname, emptySrc))

let src = null
let path = null
let zip = null

switch (process.argv[2]) {
  case 'src':
    src = dayoneSrc
    break

  case 'path':
    src = emptySrc
    path = dayoneSrc
    break

  case 'zip':
    src = emptySrc
    zip = dayoneZip
    break

  default:
    throw new Error('Pick one')
}

Metalsmith(__dirname)
  .source(src)
  .destination('./build')
  .clean(true)
  .use(dayone({
    path,
    zip,
    journals: 'workout',
    tags: 'strava'
  }))
  .use(debug())
  .build((err) => {
    rimraf.sync(p.resolve(__dirname, emptySrc))
    if (err) throw err
  })
