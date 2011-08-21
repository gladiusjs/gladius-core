# src layout

* **paladin.js**: the entry point to paladin. In source form, internally uses
../external/require.js to load itself and then loads paladin-src.
The dist/ output for paladin.js does not need require.js to run.
* **paladin-src.js**: Contains the main top level code for paladin.
* **order.js**: the order plugin for require.js, used to load CubicVR.js in its
  source form. Not needed for the dist/ version of paladin.
* **core**: modules used directly by paladin.js
* **graphics**: for graphics subsystems.
* **input**: modules for handling input
* **physics**: for physics subsystems.
* **sound**: for sound subsystems.
