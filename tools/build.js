/**
 * Build profile for paladin. Replaces the use of requirejs with an AMD
 * loader shim, almond.js, since the built file does not need to use
 * all of requirejs. The entire file is wrapped in a closure that exports
 * a global "paladin" object.
 */
({
  // Where to find the module names listed below.
  baseUrl: '../src',

  // Do not minify with the requirejs optimizer, to allow shipping
  // a non-minified and minified version. The Makefile will do the
  // minification.
  optimize: 'none',

  // Target the AMD loader shim as the main module to optimize,
  // so it shows up first in the built file,
  // since the paladin modules use the define/require APIs that the almond
  // provides. Path is relative to baseUrl.
  name: '../tools/almond',

  // Files to include along with almond. Their nested dependencies will also be
  // included. Subsystems are listed explicitly because paladin.js does not
  // have explicit dependencies for them, but uses them on demand.
  include: [
            'paladin',
            'dummy',
            'graphics/cubicvr',
            'physics/default',
            'sound/default'
           ],

  // Wraps the built file in a closure and exports paladin as a global.
  wrap: {
    startFile: 'wrap.start',
    endFile: 'wrap.end'
  },

  // The built paladin.js file for use by web sites.
  out: '../dist/paladin.js'
})
