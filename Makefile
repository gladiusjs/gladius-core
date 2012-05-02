#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  * node: http://nodejs.org
#  * Unixy shell (use msys on Windows)
#
#############################################################################################

GLADIUS := gladius
SRC_DIR := ./wip-src
TEST_DIR := ./wip-test
DIST_DIR := ./dist
EXTERNAL_DIR := ./lib
EXAMPLE_DIR := ./examples
GLADIUS_SRC := $(SRC_DIR)/core/$(GLADIUS).js
GLADIUS_DIST := $(DIST_DIR)/$(GLADIUS).js
GLADIUS_MIN := $(DIST_DIR)/$(GLADIUS).min.js
TOOLS_DIR := ./tools
JSHINT := node_modules/.bin/jshint

compile = node node_modules/uglify-js/bin/uglifyjs --output $(1) $(GLADIUS_DIST)

.PHONY: check-lint

all: $(DIST_DIR) $(GLADIUS_DIST) $(GLADIUS_MIN)
	@@echo "Finished, see $(DIST_DIR)"

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(GLADIUS_DIST): $(DIST_DIR) $(GLADIUS_SRC) $(CUBICVR_LIB)
	@@echo "Building $(GLADIUS_DIST)"
	@@cd $(TOOLS_DIR) && node r.js -o build.js

$(GLADIUS_MIN): $(DIST_DIR) $(GLADIUS_SRC)
	@@echo "Building $(GLADIUS_MIN)"
	@@$(call compile,$(GLADIUS_MIN))

minify: $(GLADIUS_MIN)

test: $(DIST_DIR)
	@@echo "Creating tests in $(DIST_TEST_DIR)"
	@@cp -R $(TEST_DIR) $(DIST_DIR)
	@@mv $(DIST_TEST_DIR)/index.html.dist $(DIST_TEST_DIR)/index.html
	@@mkdir -p $(DIST_TOOLS_DIR)/qunit
	@@cp -R $(TOOLS_DIR)/qunit/qunit $(DIST_TOOLS_DIR)/qunit
	@@cp -R $(TOOLS_DIR)/sinon.js $(DIST_TOOLS_DIR)/sinon.js
	@@cp -R $(TOOLS_DIR)/sinon-qunit.js $(DIST_TOOLS_DIR)/sinon-qunit.js
	@@echo "Starting web server in $(DIST_DIR), browse to http://localhost:9914/ (ctrl+c to stop)..."
	@@cd $(DIST_DIR) && python ../$(TOOLS_DIR)/test_server.py

lint: check-lint 

jshint: check-lint

check-lint:
	$(JSHINT) .

clean:
	@@rm -fr $(DIST_DIR)

# TD: this will fail in a Windows environment, since symlinks don't work there.
install-precommit:
	rm -f .git/hooks/pre-commit
	ln -s "../../tools/pre-commit.sh" .git/hooks/pre-commit

submodule:
	@@git submodule update --init --recursive
	@@git submodule status --recursive
