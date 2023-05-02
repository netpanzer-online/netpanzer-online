# netpanzer-online
NetPanzer Revived as a Web-Based Game

## Project Status

This project is currently **just started** and is not yet usable. Stay tuned!

## Hosting a Server

Simply clone this repo and install/setup the [server](./server).

### Writing Mods

TODO - something about writing server-side mods in typescript.

# Development

## Project Structure

- [./client](./client) Contains the client renderer.
- [./core](./core) Contains core game structures and logic shared between client and server.
- [./master-server](./master-server) Contains the master server code.
- [./server](./server) Contains the server code.
- [./site](./site) Contains the code for the public facing site.

## Architecture

The server keeps clients in sync by sending small events, rather than the full game state every frame. This lowers bandwidth and CPU requirements.

Servers connect to the master server and maintain that connection via a websocket.

`Clients` query the `master server` to get the server list.
`Clients` then connect directly to the `server`. 
All game assets are downloaded from the `server` on game start, but are cached. This way, modded servers are easily supported.

### TypeScript Rational

For those curious :) Here are the thoughts so far on picking TS:

- TypeScript lets us develop fast while still having a type system.
- The major benefit is we can share code between server and client easily, and compile for the web. While frameworks like Rust's Bevy were considered, they don't seem mature enough yet.
- We can build UIs quickly using web technologies (CSS), which is a major pain point of game dev.
- Using a scripting language makes modding easy.
- The server code is very jit-friendly, since it's just the same code in a loop over and over, so after JIT kicks in the server will be very fast (100+fps) for many clients. In fact, we should be able to support many more clients than the original game.
