# metashu — NFT metadata shuffler
A simple tool to shuffle an array of NFT metadata using a salt, like the transaction of a certain block

## Install as a CLI

```
npm i -g @ndujalabs/metashu
```

Help:
``` 

Options:
  -h, --help         This help.
  -i, --input        A file containing an array of metadata json
  -s, --salt         The salt used to reshuffle the array
  -o, --output       The file where to save the shuffled array.
                     If output is a folder, the shuffled array will
                     generate individual files for any item  
      --subset       Apply the shuffle only to a subset                     
  -r, --remaining    Used with, and only with --subset, saves the metadata not
                     included in the subset in a new file             
  -f, --first-id     By default, it is 1. Set it if you need a different number
  --add-token-id     Adds a property tokenId in the metadata (not required by the
                     ERC721 standard, but required by some exchanges)                       
Example:
  
  # exports a single shuffled array to shuffled-meta.json
  $ metashu -i ../tmp/all-meta.json -o ../tmp/shuffled-meta.json \
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports individual files, by tokenId, in the meta folder
  $ metashu -i ../tmp/all-meta.json -o ../meta \
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports a subset of only the first 5 items, putting the remaining in a file  
  $ metashu -i ../tmp/all-meta.json -o ../meta \
          -e 0 5 -r ../tmp/not-shuffled-meta.json
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd
```

## Used inside other tools

Install as usual
```  
npm i @ndujalabs/metashu
```

Example:
```
const Metashu = require('@ndujalabs/metashu')
const options = {
    input: inputPath,
    output: outputPath,
    sale: someSalt
}
const metashu = new Metashu(options)
metashu.shuffle()
```

## Copyright

2021 (c) [Francesco Sullo](https://francesco.sullo.co) / ndujaLabs

## License

MIT

