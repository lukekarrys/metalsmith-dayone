const Metalsmith = require('metalsmith')
const debug = require('metalsmith-debug')
const layouts = require('metalsmith-layouts')
const collections = require('metalsmith-collections')
const permalinks = require('metalsmith-permalinks')
const tags = require('metalsmith-tags')
const pagination = require('metalsmith-pagination')
const dayone = require('../')

const pages = (files) => (ms) => Object.keys(files).forEach((file) => {
  ms[file] = { contents: '', layout: files[file] }
})

const ENTRIES = 'entries'
const SORT_BY = 'date'
const PER_PAGE = 10
const REVERSE = true

Metalsmith(__dirname)
  .metadata({ site: { title: 'Day One Blog' } })
  .source('../.dayone/dayone')
  .destination('./build')
  .clean(true)
  .use(pages({
    'tags.html': 'tags.pug'
  }))
  .use(dayone({
    layout: 'entry.pug',
    path: `${ENTRIES}/:id.html`
  }))
  .use(tags({
    handle: 'tags',
    layout: 'tag.pug',
    path: 'tags/:tag.html',
    pathPage: 'tags/:tag/:num.html',
    perPage: PER_PAGE,
    sortBy: SORT_BY,
    reverse: REVERSE
  }))
  .use(collections({
    [ENTRIES]: {
      pattern: `${ENTRIES}/*.html`,
      sortBy: SORT_BY,
      reverse: REVERSE
    }
  }))
  .use(pagination({
    [`collections.${ENTRIES}`]: {
      layout: 'entries.pug',
      path: `${ENTRIES}/:num.html`,
      first: 'index.html',
      noPageOne: true,
      perPage: PER_PAGE
    }
  }))
  .use(permalinks())
  .use(layouts('pug'))
  .use(debug())
  .build((err) => {
    if (err) throw err
  })
