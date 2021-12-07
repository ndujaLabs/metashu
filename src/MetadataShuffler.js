const fs = require('fs-extra')
const path = require('path')
const ethers = require('ethers')

class MetadataShuffler {

  constructor(options) {
    this.options = options
    if (typeof this.options.firstId === 'undefined') {
      this.options.firstId = 1
    }
  }

  async start() {
    const opt = this.options
    if (!opt.input || typeof opt.input !== 'string') {
      throw new Error('Input file missing')
    }
    let input = path.resolve(process.cwd(), opt.input)
    if (!(await fs.pathExists(input))) {
      throw new Error('Input file not found')
    }
    if (!opt.output || typeof opt.output !== 'string') {
      throw new Error('Output file missing')
    }
    let output = path.resolve(process.cwd(), opt.output)
    let split = false
    if (await fs.pathExists(output)) {
      if ((await fs.lstat(output)).isDirectory()) {
        split = true
      }
    } else {
      if (!(await fs.pathExists(path.dirname(output)))) {
          throw new Error('Folder containing output file not found')
      }
    }
    if (!opt.salt || typeof opt.salt !== 'string') {
      throw new Error('No salt specified')
    }
    let metadata
    try {
      metadata = JSON.parse(await fs.readFile(input, 'utf8'))
    } catch (e) {
      throw new Error('Input file not a JSON file')
    }
    if (!Array.isArray(metadata)) {
      throw new Error('The array of metadata is not an array')
    }
    const shuffling = []
    for (let i = 0; i < metadata.length; i++) {
      shuffling.push({
        index: i,
        salted: ethers.utils.id(JSON.stringify(metadata[i]) + opt.salt)
      })
    }
    shuffling.sort((a, b) => {
      a = a.salted
      b = b.salted
      return a > b ? 1 : a < b ? -1 : 0
    })
    const shuffled = []
    for (let i = 0; i < shuffling.length; i++) {
      let item = metadata[shuffling[i].index]
      if (split) {
        if (opt.addTokenId) {
          item.tokenId = i + opt.firstId
        }
        await fs.writeFile(path.resolve(output, '' + (i + opt.firstId)), JSON.stringify(item, null, 2))
      } else {
        shuffled.push(item)
      }
    }
    if (!split) {
      await fs.writeFile(output, JSON.stringify(shuffled, null, 2))
    }
    return output
  }


}


module.exports = MetadataShuffler
