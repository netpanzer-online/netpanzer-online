// Ran like "npm run extract-assets -- /path/to/old/netpanzer/code

//

const fs = require('fs')
const {SmartBuffer} = require('smart-buffer');

const file_contents = fs.readFileSync('/home/winrid/dev/netpanzer-old/maps/Bad Neuburg.npm');

const smart_buffer = SmartBuffer.fromBuffer(file_contents);

console.log('header', smart_buffer.readString(64, 'ascii'));
console.log('id', smart_buffer.readUInt16LE()); // id
console.log('name', smart_buffer.readString(256, 'ascii'));
console.log('description', smart_buffer.readString(1024, 'ascii'));
console.log('width', smart_buffer.readUInt16LE());
console.log('height', smart_buffer.readUInt16LE());
console.log('tile_set', smart_buffer.readString(256, 'ascii'));
console.log('thumbnail_width', smart_buffer.readUInt16LE());
console.log('thumbnail_height', smart_buffer.readUInt16LE());
