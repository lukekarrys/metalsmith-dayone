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


## Example

See the [`metalsmith-dayone-example` repo](https://github.com/lukekarrys/metalsmith-dayone-example) for an example with paginated entries and tags pages.


## Usage

### Hopefully Super Basic Usage

Once you have all your exported Day One data in a directory, just point the `source` method at that directory.

This will result in the `destination` directory having an `html` file for each entry! It will also copy any referenced photos to that directory.

```js
require('metalsmith')(__dirname)
  .source('./path/to/dayone/data')
  .destination('./build')
  .clean(true)
  .use(require('metalsmith-dayone')())
  .build((err) => {
    if (err) throw err
  })
```

### Adding Day One data to an existing site

If you already have a `metalsmith` site or want to use Day One data in conjunction with other stuff, you probably don't want to change the `source` path. In this case, you can provide a `data` option to `metalsmith-dayone` to tell it where to look for your data.

```js
require('metalsmith')(__dirname)
  .source('./you/already/got/src')
  .destination('./build')
  .use(require('metalsmith-dayone')({
    data: './path/to/dayone/data'
  }))
  .build()
```

### Can't you just work with the zip file?

`metalsmith-dayone` can unzip the `.zip` file for you, but it requires that the `source` directory exists. If all you want is Day One data with `metalsmith` you'll need to point `source` at an empty directory.

```js
// Create an empty directory first
require('mkdirp').sync(__dirname + '/empty')

require('metalsmith')(__dirname)
  .source('./empty')
  .destination('./build')
  .use(require('metalsmith-dayone')({
    data: './path/to/dayone.zip'
  }))
  .build()
```

### Filtering Day One data

`metalsmith-dayone` can filter which journals and entries get built by passing options to the plugin.

Let's say you have a journal called `Exercise` with a ton of entries but you only want to build a site with entries tagged `run` or `bike`. Here's how you'd do that:

```js
require('metalsmith')(__dirname)
  .source('./path/to/dayone/data')
  .destination('./build')
  .clean(true)
  .use(require('metalsmith-dayone')({
    // Either option can be strings or arrays of strings
    // They will also do a case insensitive match
    journals: 'exercise',
    tags: ['run', 'bike']
  }))
  .build()
```


## What does this plugin do?

Day One captures a lot of data. From `weather.windSpeedKPH` to `userActivity.stepCount`, well there's a bunch. For this reason, this plugin doesn't do much data parsing except the following:

1. Transforms the `text` to a buffer (and optionally parses it to `html`) and puts it on `contents`
2. Rewrites any internal Day One links and images to point where they will be in the `destination` directory
3. Adds `title` metadata based on the best guess from the entry
3. Places all other Day One data as if it were read from `frontmatter`

Here's an example of some data after `metalsmith-dayone` is done with it (with a `path` of `entries/:id`):

```json
{
  "entries/BC5CE1B78AFC4003A1BB0CF5593013C5.html": {
    contents: <Buffer>,
    title: "",
    tags: [ ... ],
    weather: { ... },
    location: { ... },
    photos: [ ... ],
    ...
  },
  "photos/8f4b665521c4cae876835af23129dcd2.jpeg": {
    contents: <Buffer>
  },
  "entries/E686072CCEE044948295B7C4CF5D1C42.html": {
    contents: <Buffer>,
    title: "",
    tags: [ ... ],
    ...
  }
}
```


## Full API

### `data` (optional)

`String`

Path to your exported Day One data directory or `.zip` file.

If this is not used, it will default to the `metalsmith.source` directory.

### `path` (optional, default: `entries/:id.html`)

`String`

The path where each entry will be written. `:id` will be replaced by the Day One entry id.

### `layout` (optional, default `null`)

`String`

Specifiy a layout property to be used with each entry. Used for compatibility with [`metalsmith-layouts`](https://github.com/superwolff/metalsmith-layouts).

### markdown (optional, default `true`)

`Boolean`

Whether to parse the text of each entry from markdown to html. Based on this property the extension of each file will be `.html` or `.md`.

### `journals` (optional, default `null`)

`String | [String, ...]`

Filter which journals get built by doing a case insensitive match on the name of the journal.

By default all journals get built.

### `tags` (optional, default `null`)

`String | [String, ...]`

Filter which entries get built by doing a case insensitive match on the entries' tags.

By default all entries get built.


## Known Issues

- I've had one journal where the exported data is always missing a few images even though they are visible inside Day One


## LICENSE

MIT
