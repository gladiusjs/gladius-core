// See comments in build.js. This file is the
// same but includes the unit tests, to allow
// running the tests via test/index-dist.html
// to verify standalone build works.

// This file should be updated if build.js
// or the set of tests change.
({
  baseUrl: '../src',
  paths: {
    test: '../test'
  },
  optimize: 'none',
  name: '../tools/almond',
  include: ['paladin',
            'dummy',
            'graphics/cubicvr',
            'physics/default',
            'sound/default',
            'test/subsystem',
            //Tests
            'test/tasker',
            'test/event',
            'test/graphics',
            'test/sound'
            ],
  wrap: {
    startFile: 'wrap.start',
    endFile: 'wrap.end'
  },
  out: '../dist/paladin-withtests.js'
})
