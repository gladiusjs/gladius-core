# src layout

* **gladius.js**: the entry point to gladius. In source form, internally uses
../external/require.js to load itself and then loads gladius-src.
The dist/ output for gladius.js does not need require.js to run.
* **gladius-src.js**: Contains the main top level code for gladius.
* **order.js**: the order plugin for require.js, used to load CubicVR.js in its
  source form. Not needed for the dist/ version of gladius.
* **common**: modules that are shared across the code base. Math is a special module because it is loaded
  directly into the environment before the engine prototype is constructed. It is accessible from the window
  context rather than from an engine instance.
* **core**: modules used directly by gladius.js
* **graphics**: for graphics subsystems.
* **input**: modules for handling input
* **physics**: for physics subsystems.
* **sound**: for sound subsystems.
