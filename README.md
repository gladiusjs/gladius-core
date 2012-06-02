Development repository for Gladius engine core.
If you're looking to get started with using Gladius, please checkout the main repository [here](https://github.com/gladiusjs/gladius).

# Getting Started

Before you can build and test, you'll need to set up your development environment:

1. Make sure you have a recent version of `node` installed (>=0.6). See [here](http://nodejs.org/) for details on how to do this for your platform.
2. Install `jake` globally.

            npm install -g jake

3. Clone the repository.

            git clone git://github.com/gladiusjs/gladius-core.git

4. Link `jake` into the project directory. Do this from inside the new working copy you just cloned. Note that on some platforms you may need to do this as superuser.

            npm link jake

5. Run `jake` in the project directory. You should see the following output:

            jake lint       # lint code  
            jake build      # compile code  
            jake clean      # remove compiled code  

## Running the tests

Before you can run the tests, you will need to install a web server on your machine.
Make sure it can serve files from the project directory.
You can run the unit tests by opening opening a web browser and pointing it to:

    http://localhost/<path-to-project-directory>/tests

You can also run lint tests using `jake lint`.

## Building the module

You can build both the minified and unminified versions of the modules by running `jake build`.
Build output is stored in the `dist` directory.

# License and Notes

See [LICENSE](https://github.com/gladiusjs/gladius-core/blob/develop/LICENSE) for more information.

All our logos are handmade by [Sean Martell](https://twitter.com/#!/mart3ll).
