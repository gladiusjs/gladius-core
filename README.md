Gladius
=======

* [FAQ][FAQ]
* [IRC](irc://irc.mozilla.org/#games)
* [Mailing List](https://lists.mozilla.org/listinfo/community-games)

# What is Gladius?

## Framework for building 3D games on the web

Gladius is a game engine, written entirely in JavaScript, and designed to run in the browser. We leverage existing web technologies whenever possible and where gaps exist in support for games, we develop new solutions.

## Libraries

Gladius relies on functionality provided by other libraries. Some libraries are external (CubicVR for example), and other libraries exist as part of this project. The math and worker pool libraries exist as separate modules that can be used easily in other projects.

## Core + extensions

Gldaius consists of a core that provides low-level engine functionality like the game loop, messaging, tasks and timers. Common components like the spatial transform are also provided by the core. Services and components for specialized simulation elements, like graphics or physics, are provided by extensions. A common set of extensions is maintain as part of this project, but it's easy to write your own or import an extension from somewhere else.

# Getting Started

Make sure to clone all submodules. This can be done using 'make submodule'.

## Build and Test

No building is needed for development workflows. To build the engine for distribution, run make in the top-level
project directory. The build process produces a javascript file containing the entire engine and its dependencies
and also a minified version of that file.

Run unit tests by opening test/ directory in a web browser. Tests run automatically and failures are marked in red.

## Examples and tutorial

A short tutorial is provided [Tutorial].

# License

See LICENSE for more information.
