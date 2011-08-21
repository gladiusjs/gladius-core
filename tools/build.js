/**
 * Build profile for paladin. Replaces the use of requirejs with an AMD
 * loader shim, almond.js, since the built file does not need to use
 * all of requirejs.
 */
({
  // Where to find the module names listed below.
  baseUrl: '../src',

  // Where to find modules that are outside of src.
  // This setup assumes CubicVR.js is the built output,
  // so this build file assumes make has already run in CubicVR.js
  paths: {
    'CubicVR.js/CubicVR': '../external/CubicVR.js/dist/CubicVR'
  },

  // Use has branch trimming in the build to remove the document.write
  // code in src/paladin.js after a minification is done.
  has: {
    'source-config': false
  },

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
  // included. Subsystems are listed explicitly because paladin-src.js does not
  // have explicit dependencies for them, but uses them on demand. Also,
  // paladin.js references paladin-src in a document.write string, so it will
  // not be found by the AST analysis done in the optimizer.
  include: [
            'paladin',
            'paladin-src',
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
