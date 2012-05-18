/**
 * Build profile for gladius. Replaces the use of requirejs with an AMD
 * loader shim, almond.js, since the built file does not need to use
 * all of requirejs.
 */
({
  // Where to find the module names listed below.
  baseUrl: '../lib',

  // Where to find modules that are outside of src.
  // This setup assumes CubicVR.js is the built output,
  // so this build file assumes make has already run in CubicVR.js
  paths: {
    "src": "../src",
    "base": "../src/base",
    "common": "../src/common",
    "core": "../src/core",
    "tests": "../tests"
  },

  // Do not minify with the requirejs optimizer, to allow shipping
  // a non-minified and minified version. The Makefile will do the
  // minification.
  optimize: 'none',

  // Target the AMD loader shim as the main module to optimize,
  // so it shows up first in the built file,
  // since the gladius modules use the define/require APIs that the almond
  // provides. Path is relative to baseUrl.
  name: '../tools/almond',

  // Files to include along with almond. Their nested dependencies will also be
  // included. Subsystems are listed explicitly because gladius-src.js does not
  // have explicit dependencies for them, but uses them on demand. Also,
  // gladius.js references gladius-src in a document.write string, so it will
  // not be found by the AST analysis done in the optimizer.
  include: [
            'core/gladius-core',
           ],

  // Wraps the built file in a closure and exports gladius as a global.
  wrap: {
    startFile: 'wrap.start',
    endFile: 'wrap.end'
  },

  // The built gladius.js file for use by web sites.
  out: '../dist/gladius-core.js'
})
