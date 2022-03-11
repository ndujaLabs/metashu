#!/usr/bin/env node
const fs = require('fs-extra')
const chalk = require('chalk')
const commandLineArgs = require('command-line-args')
const Metashu = require('../src/Metashu')
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
    name: 'remaining',
    alias: 'r',
    type: String
  },
  {
    name: 'name-prefix',
    alias: 'n',
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
    name: 'subset',
    multiple: true,
    type: Number
  },
  {
    name:'add-token-id',
    alias: 'a',
    type: Boolean
  },
  {
    name: 'json-ext',
    alias: 'j',
    type: Boolean
  },
  {
    name: 'json-name-prefix',
    alias: 'J',
    type: Boolean
  },
  {
    name: 'limit',
    alias: 'l',
    type: Number
  },
  {
    name: 'no-not-save',
    alias: 'd',
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

options.isCLI = true

console.info(chalk.bold.grey(`@ndujalabs/metadata-shuffler v${pkg.version}`))

if (options.help) {
  console.info(`${pkg.description}

Options:
  -h, --help              This help.
  -i, --input             A file containing an array of metadata json
  -s, --salt              The salt used to reshuffle the array
  -o, --output            The file where to save the shuffled array.
                            If output is a folder, the shuffled array will
                            generate individual files for any item  
  --subset                Apply the shuffle only to a subset        
  -p, --prefix            Rename the items using the prefix + tokenId  
  -n, --name-mask         A mask to generate the final name
  -r, --remaining         Used with with --subset and --limit. It saves the 
                            metadata not included in the subset in a new file. If
                            not specified, an automatic file is generated in the same
                            folder of the input.   
  -f, --first-id          By default, it is 1. Set it if you need a different number
  --add-token-id          Adds a property tokenId in the metadata (not required by the
                            ERC721 standard, but required by some exchanges)
  -j, --json-ext          If true — only for individual files — the metadata JSON 
                            files will be saved as "1.json" instead of "1"         
  -J, --json-name-prefix  Set a name prexif for the metadata JSON files. It works
                            only with individual json files    
  -l, --limit             Save only a limited number of the shuffled data. 
                            "-l 1000" is equivalent to "--subset 0 1000"                                                                           
Example:
  
  # exports a single shuffled array to shuffled-meta.json, 
  # renaming any token as Super Ape #1, Super Ape #2, etc.
  $ metashu -i ../tmp/all-meta.json -o ../tmp/shuffled-meta.json \\
          -p "Super Ape #"
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports individual files, by tokenId, in the meta folder
  $ metashu -i ../tmp/all-meta.json -o ../meta \\
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports a subset of only the first 5 items, putting the remaining in a file
      and rename the token, for example, from "Jorgor" to "Everdragons Genesis #23 | Jorgor"   
  $ metashu -i ../tmp/all-meta.json -o ../meta \\
          -n "Everdragons Genesis #{id} | {name}"
          -e 0 4 -r ../tmp/not-shuffled-meta.json
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

`)
  // eslint-disable-next-line no-process-exit
  process.exit(0)
}

async function main() {
  const metashu = new Metashu(options)
  return metashu.shuffle()
}

main()
    .then(() => process.exit(0))
    .catch(e => {
      console.error(chalk.red(e.message))
      process.exit(1)
    })

