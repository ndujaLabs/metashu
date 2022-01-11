const {assert} = require('chai')
const path = require('path')
const fs = require('fs-extra')

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

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output, 'utf8'))
      assert.equal(shuffled[1].name, 'Mosinhood')

    })

    it('should shuffle and create individual files', async function () {

      opt.output = path.dirname(opt.output)

      const metashu = new Metashu(opt)
      const output = await metashu.shuffle()
      assert.isTrue(await fs.pathExists(output))
      const shuffled = JSON.parse(await fs.readFile(output + '/2', 'utf8'))
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
        output: 'tmp/test2/output.json',
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
