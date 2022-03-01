const {assert} = require('chai')
const path = require('path')
const fs = require('fs-extra')
const _ = require('lodash')

const Metashu = require('../src/Metashu')

async function assertThrowsMessage(promise, message) {
  try {
    await promise
    console.log('It did not throw :-(')
    assert.isTrue(false)
  } catch (e) {
    const shouldBeTrue = e.message.indexOf(message) > -1
    if (!shouldBeTrue) {
      console.error('Expected:', message)
      console.error('Returned:', e.message)
      // console.log(e)
    }
    assert.isTrue(shouldBeTrue)
  }
}

describe('metashu', async function () {

  const tmpDir = path.resolve(__dirname, '../tmp/test')
  const blockHash = '0x5463243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd'

  before(async function () {
  })

  after(async function () {
    await fs.emptyDir(tmpDir)
  })

  describe('Shuffle an array using a block hash', async function () {

    let opt

    beforeEach(async function () {
      await fs.emptyDir(tmpDir)
      opt = {
        input: path.resolve(__dirname, 'fixtures/metadata.json'),
        output: path.resolve(tmpDir, 'output.json'),
        salt: blockHash
      }
    })

    it('should shuffle and produce a new array', async function () {

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Mosinhood')

    })

    it('should shuffle and rename the tokens using a mask', async function () {

      opt.nameMask = "Everdragons Genesis #{id} | {name}"
      let metashu = new Metashu(opt)
      let output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      let shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Everdragons Genesis #2 | Mosinhood')

      opt.nameMask = "Everdragon {name} Genesis #{id}"
      metashu = new Metashu(opt)
      output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Everdragon Mosinhood Genesis #2')

    })

    it('should shuffle a minimalistic array with just image and name', async function () {

      opt.input = 'test/fixtures/metadata-minimalistic.json'
      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Schumar')

    })

    it('should shuffle and create individual files', async function () {

      opt.output = path.dirname(opt.output)

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output + '/2', 'utf8'))
      assert.equal(shuffled.name, 'Mosinhood')
      assert.isUndefined(shuffled.tokenId)
      assert.isTrue(await fs.pathExists(output + '/4', 'utf8'))
    })

    it('should shuffle and create only 3 individual files', async function () {

      opt.output = path.dirname(opt.output)
      opt.limit = 3

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      assert.isFalse(await fs.pathExists(output + '/4', 'utf8'))

    })

    it('should shuffle and create individual files with name and extension', async function () {

      opt.output = path.dirname(opt.output)
      opt.jsonExt = true
      opt.jsonNamePrefix = 'meta-'

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output + '/meta-2.json', 'utf8'))
      assert.equal(shuffled.name, 'Mosinhood')
      assert.isUndefined(shuffled.tokenId)

    })

    it('should shuffle and create individual files, adding a tokenId field', async function () {

      opt.output = path.dirname(opt.output)
      opt.addTokenId = true

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output + '/2', 'utf8'))
      assert.equal(shuffled.name, 'Mosinhood')
      assert.equal(shuffled.tokenId, 2)

    })

    it('should shuffle, getting only 3 items out of 6', async function () {

      opt.subset = [0, 1] // gets first two items
      opt.remaining = 'tmp/test/mom/remaining.json'
      opt.prefix = 'Everdragons Genesis #'

      const metashu = new Metashu(opt)
      const [output, remaining] = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      const unshuffled = JSON.parse(await fs.readFile(remaining, 'utf8'))
      assert.equal(shuffled.length, 2)
      assert.equal(shuffled[1].name, 'Everdragons Genesis #2')
      assert.equal(unshuffled.length, 4)
      assert.equal(unshuffled[2].name, 'Voodel')

    })


    it('should throw if bad options', async function () {

      let metashu = new Metashu({
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'Input file missing'
      )

      metashu = new Metashu({
        input: 'test/fixtures/bringo.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'Input file not found'
      )

      metashu = new Metashu({
        input: 'test/fixtures/not-a-json.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'Input file not a JSON file'
      )

      metashu = new Metashu({
        input: 'test/fixtures/metadata.json',
        // output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'Output file missing'
      )

      metashu = new Metashu({
        input: 'test/fixtures/metadata.json',
        output: 'tmp/test/mom2/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'Folder containing output file not found'
      )

      metashu = new Metashu({
        input: 'test/fixtures/metadata.json',
        output: 'tmp/test/output.json',
        // salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'No salt specified'
      )

      metashu = new Metashu({
        input: 'test/fixtures/not-an-array.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metashu.shuffle(),
          'The array of metadata is not an array'
      )


    })


  })
})
