#############################################################################################
# NOTES:
#
# This Makefile assumes that you have the following installed, setup:
#
#  * Java
#  * Unixy shell (use msys on Windows)
#  * SpiderMonkey JavaScript Shell (jsshell), binaries available at:
#      https://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-central/
#  * $JSSHELL environment variable in .profile or .bashrc pointing to a SpiderMonkey binary.
#    For example: export JSSHELL=/Users/dave/moz/jsshell/js
#
#############################################################################################

PALADIN := paladin
SRC_DIR := ./src
DIST_DIR := ./dist
EXTERNAL_DIR := ./external
PALADIN_SRC := $(SRC_DIR)/$(PALADIN).js
PALADIN_DIST := $(DIST_DIR)/$(PALADIN).js
PALADIN_MIN := $(DIST_DIR)/$(PALADIN).min.js
PALADIN_COMPLETE := $(DIST_DIR)/$(PALADIN).complete.js
TOOLS_DIR := ./tools
TESTS_DIR := $(DIST_DIR)/test

CUBICVR_LIB := $(EXTERNAL_DIR)/CubicVR.js/dist/CubicVR.min.js

CORE_FILES := $(SRC_DIR)/paladin.js $(SRC_DIR)/core/*.js $(SRC_DIR)/input/*.js

SUBSYSTEM_FILES := \
  $(SRC_DIR)/dummy.js \
  $(SRC_DIR)/graphics/cubicvr.js \
  $(SRC_DIR)/sound/default.js \
  $(SRC_DIR)/physics/default.js

compile = java -jar $(TOOLS_DIR)/closure/compiler.jar \
	                  --compilation_level SIMPLE_OPTIMIZATIONS \
	                  --js $(PALADIN_DIST) \
	                  --js_output_file $(1)

complete = cat $(PALADIN_MIN) $(CUBICVR_LIB) > $(1)

jshint = echo "Linting $(1)" ; $(JSSHELL) -f $(TOOLS_DIR)/jshint.js $(TOOLS_DIR)/jshint-cmdline.js < $(1)

all: $(DIST_DIR) $(PALADIN_DIST) $(PALADIN_MIN) $(PALADIN_COMPLETE)
	@@echo "Finished, see $(DIST_DIR)"

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(PALADIN_DIST): $(DIST_DIR) $(PALADIN_SRC)
	@@echo "Building $(PALADIN_DIST)"
	@@cd $(TOOLS_DIR) && java -classpath rhino.jar org.mozilla.javascript.tools.shell.Main r.js -o build.js

$(PALADIN_MIN): $(DIST_DIR) $(PALADIN_SRC)
	@@echo "Building $(PALADIN_MIN)"
	@@$(call compile,$(PALADIN_MIN))

$(PALADIN_COMPLETE): $(DIST_DIR) $(PALADIN_MIN)
	@@echo "Building $(PALADIN_COMPLETE)"
	@@$(call complete,$(PALADIN_COMPLETE))

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
	@@$(call jshint,$(CORE_FILES))

check-lint-subsystems:
	@@$(foreach subsystem,$(SUBSYSTEM_FILES),echo "-----" ; $(call jshint,$(subsystem)) ; )
