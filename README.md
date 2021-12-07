# Metadata shuffler
A simple tool to shuffle an array of NFT metadata using a salt, like the transaction of a certain block

## Install

```
npm i @ndujalabs/metashu
```

## Help
``` 
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
  $ metadata-shuffler -i ../tmp/all-meta.json -o ../tmp/shuffled-meta.json \
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd

  # exports individual files, by tokenId, in the meta folder
  $ metadata-shuffler -i ../tmp/all-meta.json -o ../meta \
          -s 0x0863243f8d858815db8de23b7f1399b8f975672a750284209ac35e8d91d89afd
```

## Copyright

2021 (c) Nduja Labs
Author: [Francesco Sullo](https://francesco.sullo.co)

## License

MIT
~~~~
