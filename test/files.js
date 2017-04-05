const test = require('tape')
const buildFiles = require('../lib/files')
const file = (contents = '') => ({
  contents: Buffer.from(typeof contents === 'object' ? JSON.stringify(contents) : contents)
})

test('Works on some files', (t) => {
  const result = {}

  const testFiles = {
    'photos/test1.jpg': file(),
    'photos/test2.jpg': file(),
    'Journal.json': file({
      entries: [{
        uuid: 1,
        creationDate: '2016-03-21T00:00:00.000Z',
        text: '# Test'
      }]
    })
  }

  const expected = {
    'entries/1.html': {
      uuid: 1,
      text: '# Test',
      contents: Buffer.from('<h1 id="test">Test</h1>\n'),
      layout: null,
      journal: 'journal',
      date: '2016-03-21T00:00:00.000Z',
      creationDate: '2016-03-21T00:00:00.000Z',
      title: 'Test'
    }
  }

  buildFiles({
    files: testFiles,
    deleteFile: (file) => delete result[file],
    createFile: (file, data) => (result[file] = data)
  })

  t.deepEqual(result, expected)
  t.end()
})
