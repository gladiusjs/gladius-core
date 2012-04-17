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
SRC_DIR := ./src
TEST_DIR := ./test
DIST_DIR := ./dist
EXTERNAL_DIR := ./external
EXAMPLE_DIR := ./example
GLADIUS_SRC := $(SRC_DIR)/$(GLADIUS).js
GLADIUS_DIST := $(DIST_DIR)/$(GLADIUS).js
GLADIUS_MIN := $(DIST_DIR)/$(GLADIUS).min.js
TOOLS_DIR := ./tools
DIST_TEST_DIR := $(DIST_DIR)/test
DIST_TOOLS_DIR := $(DIST_DIR)/tools
JSHINT := $(TOOLS_DIR)/node_modules/.bin/jshint

CUBICVR_LIB := $(EXTERNAL_DIR)/CubicVR.js/dist/CubicVR.js

compile = node $(TOOLS_DIR)/node_modules/uglify-js/bin/uglifyjs --output $(1) $(GLADIUS_DIST)

complete = cat $(GLADIUS_MIN) > $(1)

.PHONY: check-lint

all: $(DIST_DIR) $(GLADIUS_DIST) $(CUBICVR_LIB)
	@@echo "Finished, see $(DIST_DIR)"

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(CUBICVR_LIB):
	@@echo "Creating $(CUBICVR_LIB)"
	@@cd $(EXTERNAL_DIR)/CubicVR.js && make

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

setup: submodule install-precommit

install-precommit:
	rm -f .git/hooks/pre-commit
	ln -s tools/pre-commit.sh .git/hooks/pre-commit

submodule:
	@@git submodule update --init --recursive
	@@git submodule status --recursive
