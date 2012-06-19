Development repository for Gladius engine core.
If you're looking to get started with using Gladius, please checkout the main repository [here](https://github.com/gladiusjs/gladius).

# Getting Started

Before you can build and test, you'll need to set up your development environment:

1. Make sure you have a recent version of `node` installed (>=0.6). See [here](http://nodejs.org/) for details on how to do this for your platform.
2. Install `jake` globally.

            npm install -g jake

3. Clone the repository.

            git clone git://github.com/gladiusjs/gladius-core.git

4. Run `jake` in the project directory. You should see the following output:

            jake lint       # lint code  
            jake build      # compile code  
            jake clean      # remove compiled code
            jake serve      # start web server in project directory

## Running the tests

You will need a web server that can serve files from the project directory.
Follow these instructions if you would like to use the server that comes with Gladius.

1. Run the web server.

            jake serve

2. Go to the following URL in your browser to view the tests. Be sure to use a recent version of Firefox or Chrome.

            http://localhost:8080/tests


You can also run lint tests using `jake lint`.

## Building the module

You can build both the minified and unminified versions of the modules by running `jake build`.
Build output is stored in the `dist` directory.

# License and Notes

See [LICENSE](https://github.com/gladiusjs/gladius-core/blob/develop/LICENSE) for more information.

All our logos are handmade by [Sean Martell](https://twitter.com/#!/mart3ll).
