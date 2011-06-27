
PALADIN := paladin
SRC_DIR := ./src
DIST_DIR := ./dist
PALADIN_SRC := $(SRC_DIR)/$(PALADIN).js
PALADIN_DIST := $(DIST_DIR)/$(PALADIN).js
PALADIN_MIN := $(DIST_DIR)/$(PALADIN).min.js
SUBSYS_DIR := $(SRC_DIR)/subsystem
TOOLS_DIR := ./tools
TESTS_DIR := $(DIST_DIR)/test

CORE_FILES := $(SRC_DIR)/paladin.js
SUBSYSTEM_FILES := $(SUBSYS_DIR)/paladin.subsystem.js $(SUBSYS_DIR)/dummy/paladin.subsystem.dummy.js
CONCAT_LIST := $(CORE_FILES) $(SUBSYSTEM_FILES)
COMPILE_LIST := $(patsubst %.js, --js %.js, $(CONCAT_LIST))

compile = java -jar $(TOOLS_DIR)/closure/compiler.jar \
                    $(COMPILE_LIST) \
	                  --compilation_level SIMPLE_OPTIMIZATIONS \
	                  --js_output_file $(1)

concat = cat $(CONCAT_LIST) > $(1)

all: $(DIST_DIR) $(PALADIN_DIST) $(PALADIN_MIN)
	@@echo "Finished, see $(DIST_DIR)"

$(DIST_DIR):
	@@echo "Creating $(DIST_DIR)"
	@@mkdir $(DIST_DIR)

$(PALADIN_DIST): $(DIST_DIR) $(PALADIN_SRC)
	@@echo "Building $(PALADIN_DIST)"
	@@$(call concat,$(PALADIN_DIST))

$(PALADIN_MIN): $(DIST_DIR) $(PALADIN_SRC) $(PALADIN_DIST)
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

check-lint:
	${TOOLS_DIR}/jslint.py ${JSSHELL} paladin.js
