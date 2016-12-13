const test = require('tape')
const dayone = require('../lib/dayone-md')

test('Works to make a title', (t) => {
  const md = `This should be the title
  Hey this is more text`

  t.equal(dayone(md).title, 'This should be the title')

  t.end()
})

test('Works to make a title even if it starts with a newline + indent', (t) => {
  const md = `
    This should be the title

    Hey this is more text
  `

  t.equal(dayone(md).title, 'This should be the title')

  t.end()
})
