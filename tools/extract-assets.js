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
const width = smart_buffer.readUInt16LE();
console.log('width', width);
const height = smart_buffer.readUInt16LE();
console.log('height', height);
console.log('tile_set', smart_buffer.readString(256, 'ascii'));
console.log('thumbnail_width', smart_buffer.readUInt16LE());
console.log('thumbnail_height', smart_buffer.readUInt16LE());

const map_size = width * height;

const map_buffer = {}; // TODO what is this? are they
for (let i = 0; i < map_size; i++) {
    map_buffer[i] = smart_buffer.readUInt16LE();
    // console.log(map_buffer[i])
}
/*
to get color of a pixel in the map:
1. determine tileX and tileY of pixel
2. index = map_buffer[tileY*getWidth() + tileX]
3. get the tile by index: getTile(index) (char @ index)
4. get the bytes that represent the color: tile[(subPixY * getTileXsize()) + subPixX]
 */
// console.log('map_buffer', map_buffer);