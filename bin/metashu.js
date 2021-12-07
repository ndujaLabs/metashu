#!/usr/bin/env node
const fs = require('fs-extra')
const chalk = require('chalk')
const commandLineArgs = require('command-line-args')
const MetadataShuffler = require('../src/MetadataShuffler')
const pkg = require('../package.json')

const optionDefinitions = [
  {
    name: 'help',
    alias: 'h',
    type: Boolean
  },
  {
    name: 'input',
    alias: 'i',
    type: String
  },
  {
    name: 'output',
    alias: 'o',
    type: String
  },
  {
    name: 'salt',
    alias: 's',
    type: String
  },
  {
    name: 'first-id',
    alias: 'f',
    type: Number
  },
  {
    name:'add-token-id',
    alias: 'a',
    type: Boolean
  }
]

function error(message) {
  if (!Array.isArray(message)) {
    message = [message]
  }
  console.error(chalk.red(message[0]))
  if (message[1]) {
    console.info(message[1])
  }
  /*eslint-disable-next-line*/
  process.exit(1)
}

let options = {}
try {
  options = commandLineArgs(optionDefinitions, {
    camelCase: true
  })
} catch (e) {
  error(e.message)
}

console.info(chalk.bold.grey(`@ndujalabs/metadata-shuffler v${pkg.version}`))

if (options.help) {
  console.info(`${pkg.description}

Options:
  -h, --help         This help.
  -i, --input        A file containing an array of metadata json
  -s, --salt         The salt used to reshuffle the array
  -o, --output       The file where to save the shuffled array.
                     If output is a folder, the shuffled array will
                     generate individual files for any item  
  -f, --first-id     By default, it is 1. Set it if you need a different number
  --add-token-id     Adds a property tokenId in the metadata (not required by the
                     ERC721 standard, but required by some exchanges)                       
Example:
  
  # exports a single shuffled array to shuffled-meta.json
  $ metadata-shuffler -i ../tmp/all-meta.json -o ../tmp/shuffled-meta.json \\
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports individual files, by tokenId, in the meta folder
  $ metadata-shuffler -i ../tmp/all-meta.json -o ../meta \\
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd
`)
  // eslint-disable-next-line no-process-exit
  process.exit(0)
}

async function main() {

  const metadataShuffler = new MetadataShuffler(options)
  return metadataShuffler.start()
}

main()
    .then(() => process.exit(0))
    .catch(e => {
      console.error(chalk.red(e.message))
      process.exit(1)
    })

