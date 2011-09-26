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
GLADIUS_SRC := $(SRC_DIR)/$(GLADIUS).js
GLADIUS_DIST := $(DIST_DIR)/$(GLADIUS).js
GLADIUS_MIN := $(DIST_DIR)/$(GLADIUS).min.js
TOOLS_DIR := ./tools
DIST_TEST_DIR := $(DIST_DIR)/test

CORE_FILES := $(SRC_DIR)/gladius.js $(wildcard $(SRC_DIR)/core/*.js) $(wildcard $(SRC_DIR)/core/component/*.js)

SUBSYSTEM_FILES := \

compile = node $(TOOLS_DIR)/node_modules/uglify-js/bin/uglifyjs -o $(1) $(GLADIUS_DIST)

complete = cat $(GLADIUS_MIN) > $(1)

jshint = echo "Linting $(1)" ; node $(TOOLS_DIR)/jshint-cmdline.js $(1)

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

test: $(DIST_DIR) $(GLADIUS_MIN)
	@@echo "Creating tests in $(DIST_TEST_DIR)"
	@@mv $(GLADIUS_MIN) $(GLADIUS_DIST)
	@@cp -R $(TEST_DIR) $(DIST_TEST_DIR)
	@@echo "Starting web server in $(DIST_TEST_DIR), browse to http://localhost:9914/ (ctrl+c to stop)..."
	@@cd $(DIST_DIR) && python ../$(TOOLS_DIR)/test_server.py

clean:
	@@rm -fr $(DIST_DIR)

check-lint: check-lint-core check-lint-subsystems

check-lint-core:
	@@$(foreach corefile,$(CORE_FILES),echo "-----" ; $(call jshint,$(corefile)) ; )

check-lint-subsystems:
	@@$(foreach subsystem,$(SUBSYSTEM_FILES),echo "-----" ; $(call jshint,$(subsystem)) ; )

submodule:
	@@git submodule update --init --recursive
	@@git submodule status --recursive
