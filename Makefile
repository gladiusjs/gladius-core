#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  * node: http://nodejs.org
#  * Unixy shell (use msys on Windows)
#
#############################################################################################

PALADIN := paladin
SRC_DIR := ./src
DIST_DIR := ./dist
EXTERNAL_DIR := ./external
PALADIN_SRC := $(SRC_DIR)/$(PALADIN).js
PALADIN_DIST := $(DIST_DIR)/$(PALADIN).js
PALADIN_MIN := $(DIST_DIR)/$(PALADIN).min.js
TOOLS_DIR := ./tools
TESTS_DIR := $(DIST_DIR)/test

CUBICVR_LIB := $(EXTERNAL_DIR)/CubicVR.js/dist/CubicVR.js

CORE_FILES := $(SRC_DIR)/paladin.js $(wildcard $(SRC_DIR)/core/*.js) $(wildcard $(SRC_DIR)/input/*.js)

SUBSYSTEM_FILES := \
  $(SRC_DIR)/dummy.js \
  $(SRC_DIR)/graphics/cubicvr.js \
  $(SRC_DIR)/sound/default.js \
  $(SRC_DIR)/physics/default.js

compile = node $(TOOLS_DIR)/node_modules/uglify-js/bin/uglifyjs -o $(1) $(PALADIN_DIST)

complete = cat $(PALADIN_MIN) $(CUBICVR_LIB) > $(1)

jshint = echo "Linting $(1)" ; node $(TOOLS_DIR)/jshint-cmdline.js $(1)

all: $(DIST_DIR) $(PALADIN_DIST) $(PALADIN_MIN)
	@@echo "Finished, see $(DIST_DIR)"

$(CUBICVR_LIB):
	@@echo "Creating $(CUBICVR_LIB)"
	@@cd $(EXTERNAL_DIR)/CubicVR.js && make

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(PALADIN_DIST): $(DIST_DIR) $(PALADIN_SRC) $(CUBICVR_LIB)
	@@echo "Building $(PALADIN_DIST)"
	@@cd $(TOOLS_DIR) && node r.js -o build.js

$(PALADIN_MIN): $(DIST_DIR) $(PALADIN_SRC)
	@@echo "Building $(PALADIN_MIN)"
	@@$(call compile,$(PALADIN_MIN))

tests: $(DIST_DIR) $(PALADIN_MIN)
	@@echo "Creating tests in $(TESTS_DIR)"
	@@mv $(PALADIN_MIN) $(PALADIN_DIST)
	@@cp -R $(SRC_DIR)/tests $(TESTS_DIR)
	@@echo "Starting web server in $(TESTS_DIR), browse to http://localhost:9914/ (ctrl+c to stop)..."
	@@cd $(DIST_DIR) && python ../$(TOOLS_DIR)/test_server.py

clean:
	@@rm -fr $(DIST_DIR)

check-lint: check-lint-core check-lint-subsystems

check-lint-core:
	@@$(foreach corefile,$(CORE_FILES),echo "-----" ; $(call jshint,$(corefile)) ; )

check-lint-subsystems:
	@@$(foreach subsystem,$(SUBSYSTEM_FILES),echo "-----" ; $(call jshint,$(subsystem)) ; )
