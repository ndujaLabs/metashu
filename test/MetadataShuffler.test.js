const {assert} = require('chai')
const path = require('path')
const fs = require('fs-extra')

const MetadataShuffler = require('../src/MetadataShuffler')

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
    await fs.emptyDir(path.resolve(__dirname, '../tmp/test'))
  })

  describe('Shuffle an array using a block hash', async function () {

    let opt = {
      input: 'test/fixtures/metadata.json',
      output: 'tmp/test/output.json',
      salt: blockHash
    }

    beforeEach(async function () {
      // await fs.emptyDir(tmpDir)
    })

    it('should shuffle and produce a new array', async function () {

      const metadataShuffler = new MetadataShuffler(opt)
      const output = await metadataShuffler.start()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Mosinhood')

    })

    it('should shuffle and create individual files', async function () {

      opt.output = path.dirname(opt.output)

      const metadataShuffler = new MetadataShuffler(opt)
      const output = await metadataShuffler.start()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output+'/2', 'utf8'))
      assert.equal(shuffled.name, 'Mosinhood')
      assert.isUndefined(shuffled.tokenId)

    })

    it('should shuffle and create individual files, adding a tokenId field', async function () {

      opt.output = path.dirname(opt.output)
      opt.addTokenId = true

      const metadataShuffler = new MetadataShuffler(opt)
      const output = await metadataShuffler.start()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output+'/2', 'utf8'))
      assert.equal(shuffled.name, 'Mosinhood')
      assert.equal(shuffled.tokenId, 2)

    })

    it('should throw if bad options', async function () {

      let metadataShuffler = new MetadataShuffler({
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'Input file missing'
      )

      metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/bringo.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'Input file not found'
      )

      metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/not-a-json.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'Input file not a JSON file'
      )

       metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/metadata.json',
        // output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'Output file missing'
      )

      metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/metadata.json',
        output: 'tmp/test2/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'Folder containing output file not found'
      )

      metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/metadata.json',
        output: 'tmp/test/output.json',
        // salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'No salt specified'
      )

metadataShuffler = new MetadataShuffler({
        input: 'test/fixtures/not-an-array.json',
        output: 'tmp/test/output.json',
        salt: blockHash
      })
      await assertThrowsMessage(
          metadataShuffler.start(),
          'The array of metadata is not an array'
      )


    })


  })
})
