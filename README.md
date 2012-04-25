Gladius
=======

* [FAQ](https://github.com/gladiusjs/gladius-core/wiki/Faq)
* [IRC](irc://irc.mozilla.org/#games)
* [Mailing List](https://lists.mozilla.org/listinfo/community-games)
* [Contributors](https://github.com/gladiusjs/gladius-core/contributors)

# Gladius is a 3D game engine

Gladius is a 3D game engine, written entirely in JavaScript, and designed to run in the browser. We leverage existing web technologies whenever possible and where gaps exist in support for games, we develop new solutions.

The engine consists of a core set of functionality that is common to all games and simulations like the game loop, messaging, tasks and timers. Common components like the spatial transform are also provided by the core. More specialized funcionality, like graphics or physics, is encapsulated into engine extensions that are designed to run on top of the core. A common set of extensions is maintained as part of this project, and support for third-party extensions is a strong design objective.

An engine instance is comprised of the engine core plus a set of extensions.

# Related projects

We are also building a set of tools and libraries for building games. They are designed to be generally useful and reusable in other projects as well.

<b>Check out our [roadmap](https://github.com/gladiusjs/gladius-core/wiki/Roadmap) for more details.<b>

# Getting Started

After cloning, be sure to execute `make setup` in the project directory to 
ensure that all the submodules are checked out, and the pre-commit hook is
installed.

## Build and Test

No building is needed for development workflows.

To build the engine for distribution, run make in the top-level
project directory. The build process produces a javascript file containing the entire engine and its dependencies
and also a minified version of that file.

Run unit tests by opening test/ directory in a web browser. Tests run automatically and failures are marked in red.

## Examples and tutorial

A short tutorial is provided [here](https://github.com/gladiusjs/gladius-core/wiki/Tutorial). Examples are available from the top-level project directory.

# License and Notes

See [LICENSE](https://github.com/gladiusjs/gladius-core/blob/develop/LICENSE) for more information.

All our logos are handmade by [Sean Martell](https://twitter.com/#!/mart3ll).
