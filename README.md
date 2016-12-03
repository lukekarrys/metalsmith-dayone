metalsmith-dayone
==================

A Metalsmith plugin to create files from a Day One JSON export.

[![NPM](https://nodei.co/npm/metalsmith-dayone.png)](https://nodei.co/npm/metalsmith-dayone/)
[![Build Status](https://travis-ci.org/lukekarrys/metalsmith-dayone.png?branch=master)](https://travis-ci.org/lukekarrys/metalsmith-dayone)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

**This plugin only works with Day One v2.**


## Getting your Day One data

Learn how to [export your data as JSON from Day One](http://help.dayoneapp.com/exporting-entries/). Don't worry too much about filtering in Day One, since this plugin allows you to filter which journals and entries get built.

After you have the `.zip` file, here are the steps to make sure `metalsmith` can work with it:

1. Extract the `.zip` file
2. If it extracts to a directory, you're all good to go
3. If it just extracted to a `.json` file, put that file inside a directory


## Usage

### Hopefully Super Basic Usage

Once you have all your exported Day One data in a directory, just point the `source` method at that directory.

This will result in the `destination` directory having an `html` file for each entry! It will also copy any photos to the directory.

```js
const Metalsmith = require('metalsmith')
const dayone = require('metalsmith-dayone')

Metalsmith(__dirname)
  .source('./path/to/dayone/data')
  .destination('./build')
  .clean(true)
  .use(dayone())
  .build((err) => {
    if (err) throw err
  })
```

### Adding Day One data to an existing site

If you already have a `metalsmith` site or want to use Day One data in conjunction with other stuff, you probably don't want to change the `source` path. In this case, you can provide a `path` option to `metalsmith-dayone` for where to look for your data.

```js
const Metalsmith = require('metalsmith')
const dayone = require('metalsmith-dayone')

Metalsmith(__dirname)
  .source('./you/already/got/src')
  .destination('./build')
  .use(dayone({ path: './path/to/dayone/data' }))
  .build((err) => {
    if (err) throw err
  })
```

### Can't you just work with the zip file?

`metalsmith-dayone` can unzip the `.zip` file for you, but it requires that the `source` directory exists. If all you want is Day One data with `metalsmith` you'll need to point `source` at an empty directory.

```js
const Metalsmith = require('metalsmith')
const dayone = require('metalsmith-dayone')
const mkdirp = require('mkdirp')

// Create an empty directory first
mkdirp.sync(__dirname + '/empty')

Metalsmith(__dirname)
  .source('./empty')
  .destination('./build')
  .use(dayone({ path: './path/to/dayone.zip' }))
  .build((err) => {
    if (err) throw err
  })
```

### Filtering Day One data

`metalsmith-dayone` can filter which journals and entries get built by passing options to the plugin.

Let's say you have a journal called `Exercise` with a ton of entries but you only want to build a site with entries tagged `run` or `bike`. Here's how you'd do that:

```js
const Metalsmith = require('metalsmith')
const dayone = require('metalsmith-dayone')

Metalsmith(__dirname)
  .source('./path/to/dayone/data')
  .destination('./build')
  .clean(true)
  .use(dayone({
    // Either option can be strings or arrays of strings
    // They will also do a case insensitive match
    journals: 'exercise',
    tags: ['run', 'bike']
  }))
  .build((err) => {
    if (err) throw err
  })
```


## What does the data looks like?

Day One captures a lot of data. From `weather.windSpeedKPH` to `userActivity.stepCount`, well there's a bunch. For this reason, this plugin doesn't do much data parsing except the following:

1. Converts `text` to HTML from markdown and puts it where `metalsmith` expects
2. Rewrites any internal Day One links to images to point where they are in the `destination` directory
3. Places all other data in an objcect `dayone`

The `dayone` object is where you should look if you want to customize posts to include stuff like step counts and wind speed.

Here's an example of some data after `metalsmith-dayone` is done with it:

```json
{
  BC5CE1B78AFC4003A1BB0CF5593013C5: {
    contents: <Buffer>,
    dayone: {
      tags: [ ... ],
      weather: { ... },
      location: { ... },
      photos: [ ... ],
      ...
    }
  },
  "photos/8f4b665521c4cae876835af23129dcd2.jpeg": {
    contents: <Buffer>
  },
  E686072CCEE044948295B7C4CF5D1C42: {
    contents: <Buffer>,
    dayone: {
      tags: [ ... ],
      ...
    }
  }
}
```


## Full API

### `path` (optional)

`String`

Path to your exported Day One data directory or `.zip` file.

If this is not used, it will default to the `metalsmith.source` directory.

### `journals` (optional)

`String | [String, ...]`

Filter which journals get built by doing a case insensitive match on the name of the journal.

By default all journals get built.

### `tags` (optional)

`String | [String, ...]`

Filter which entries get built by doing a case insensitive match on the entries' tags.

By default all entries get built.

### `markdown` (optional)

`Object`

This plugin used [`marked`](https://github.com/chjj/marked#options-1) since Day One stores text as markdown. You can use this to pass options to the `marked` parser.

By default no options are passed.


## Known Issues

- I've had one journal where the exported data is always missing a few images even though they are visible inside Day One


## LICENSE

MIT
