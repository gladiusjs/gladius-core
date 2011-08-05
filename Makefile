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
LIB_DIR := ./lib
EXTERNAL_DIR := ./external
PALADIN_SRC := $(SRC_DIR)/$(PALADIN).js
PALADIN_DIST := $(DIST_DIR)/$(PALADIN).js
PALADIN_MIN := $(DIST_DIR)/$(PALADIN).min.js
PALADIN_COMPLETE := $(DIST_DIR)/$(PALADIN).complete.js
SUBSYS_DIR := $(SRC_DIR)/subsystem
TOOLS_DIR := ./tools
TESTS_DIR := $(DIST_DIR)/test

CUBICVR_LIB := $(EXTERNAL_DIR)/CubicVR.js/dist/CubicVR.min.js

CORE_FILES := $(SRC_DIR)/paladin.js

SUBSYSTEM_FILES := \
  $(SUBSYS_DIR)/paladin.subsystem.js \
  $(SUBSYS_DIR)/dummy/paladin.subsystem.dummy.js \
  $(SUBSYS_DIR)/graphics/paladin.subsystem.graphics.cubicvr.js \
  $(SUBSYS_DIR)/sound/paladin.subsystem.sound.js \
  $(SUBSYS_DIR)/physics/paladin.subsystem.physics.js

CONCAT_LIST := $(CORE_FILES) $(SUBSYSTEM_FILES)
COMPILE_LIST := $(patsubst %.js, --js %.js, $(CONCAT_LIST))

compile = java -jar $(TOOLS_DIR)/closure/compiler.jar \
                    $(COMPILE_LIST) \
	                  --compilation_level SIMPLE_OPTIMIZATIONS \
	                  --js_output_file $(1)

concat = cat $(CONCAT_LIST) > $(1)

complete = cat $(PALADIN_MIN) $(CUBICVR_LIB) > $(1)

jshint = echo "Linting $(1)" ; $$JSSHELL2 -f $(TOOLS_DIR)/jshint.js $(TOOLS_DIR)/jshint-cmdline.js < $(1)

all: $(DIST_DIR) $(PALADIN_DIST) $(PALADIN_MIN) $(PALADIN_COMPLETE)
	@@echo "Finished, see $(DIST_DIR)"

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(PALADIN_DIST): $(DIST_DIR) $(PALADIN_SRC)
	@@echo "Building $(PALADIN_DIST)"
	@@$(call concat,$(PALADIN_DIST))

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
