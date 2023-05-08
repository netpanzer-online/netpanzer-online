// Ran like "npm run extract-assets -- /path/to/old/netpanzer/code
// how the game works is all map tiles and movement data are in a "tile set" in wads/
// then each map simply indexes into that data.

const fs = require('fs')
const {SmartBuffer} = require('smart-buffer');

const tls_contents = fs.readFileSync('/home/winrid/dev/netpanzer-old/wads/summer12mb.tls');
const tls_buffer = SmartBuffer.fromBuffer(tls_contents);

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

const map_buffer = {}; // these are pointers into the tile set
for (let i = 0; i < map_size; i++) {
    map_buffer[i] = smart_buffer.readUInt16LE();
    // console.log(map_buffer[i])
}
/*
to get color of a pixel in the map (getWorldPixColor):
1. determine tileX and tileY of pixel
2. tile_number = map_buffer[tileY*getWidth() + tileX]
3. tile_data = (getTilePixel): tiles_data[tile_number * tile_size]
4. get the byte that represents the color: tile_data[(subPixY * getTileXsize()) + subPixX]
 */
// console.log('map_buffer', map_buffer);

// tile movement values: 0, 1, 2, 3, 4 (impassible), 5 (impassible)
// movement comes from:
// tile_number = map_buffer[tileY*getWidth() + tileX]
// then value is in tile set: tile_info[ index ].move_value
