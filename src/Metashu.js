const fs = require('fs-extra')
const path = require('path')
const ethers = require('ethers')

class Metashu {

  constructor(options) {
    this.options = options
    if (typeof this.options.firstId === 'undefined') {
      this.options.firstId = 1
    }
  }

  async getInput(opt) {
    if (!opt.input || typeof opt.input !== 'string') {
      throw new Error('Input file missing')
    }
    let input = opt.isCLI ? path.resolve(process.cwd(), opt.input) : opt.input
    if (!(await fs.pathExists(input))) {
      throw new Error('Input file not found')
    }
    return input
  }

  async getOutput(opt) {
    if (!opt.output || typeof opt.output !== 'string') {
      throw new Error('Output file missing')
    }
    let output = opt.isCLI ? path.resolve(process.cwd(), opt.output) : opt.output
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
    return {output, split}
  }

  async getRemaining(opt) {
    if (!opt.remaining || typeof opt.remaining !== 'string') {
      throw new Error('Remaining file missing')
    }
    return opt.isCLI ? path.resolve(process.cwd(), opt.remaining) : opt.remaining
  }

  getSalt(opt) {
    console.log(opt)
    if (!opt.salt || typeof opt.salt !== 'string') {
      throw new Error('No salt specified')
    }
    return opt.salt
  }

  async getMetadata(input) {
    let metadata
    try {
      metadata = JSON.parse(await fs.readFile(input, 'utf8'))
    } catch (e) {
      throw new Error('Input file not a JSON file')
    }
    if (!Array.isArray(metadata)) {
      throw new Error('The array of metadata is not an array')
    }
    return metadata
  }

  getShuffling(metadata, salt) {
    const shuffling = []
    for (let i = 0; i < metadata.length; i++) {
      shuffling.push({
        index: i,
        salted: ethers.utils.id(JSON.stringify(metadata[i]) + salt)
      })
    }
    shuffling.sort((a, b) => {
      a = a.salted
      b = b.salted
      return a > b ? 1 : a < b ? -1 : 0
    })
    return shuffling
  }

  async shuffle() {
    const opt = this.options
    const input = await this.getInput(opt)
    const {output, split} = await this.getOutput(opt)
    const salt = this.getSalt(opt)
    const metadata = await this.getMetadata(input)
    const shuffling = this.getShuffling(metadata, salt)
    const shuffled = []
    let first
    let last
    let remaining
    let remainingMetadata = []
    if (Array.isArray(opt.subset) && opt.subset[1]) {
      first = opt.subset[0]
      last = opt.subset[1]
      remaining = await this.getRemaining(opt)
    }
    for (let i = 0; i < shuffling.length; i++) {
      let item = metadata[shuffling[i].index]
      if (!last || (i >= first && i <= last)) {
        if (opt.addTokenId) {
          item.tokenId = i + opt.firstId
        }
        if (opt.prefix) {
          item.name = opt.prefix + (i + opt.firstId)
        }
        if (split) {
          await fs.writeFile(path.resolve(output, '' + (i + opt.firstId)), JSON.stringify(item, null, 2))
        } else {
          shuffled.push(item)
        }
      } else {
        remainingMetadata.push(item)
      }
    }

    console.log(output)
    if (!split) {
      await fs.writeFile(output, JSON.stringify(shuffled, null, 2))
    }

    if (remainingMetadata.length) {
      await fs.writeFile(remaining, JSON.stringify(remainingMetadata, null, 2))
      return [output, remaining]
    } else {
      return output
    }
  }


}


module.exports = Metashu
