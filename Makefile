PROJECT:=transduce
BUILD:=build/$(PROJECT)
NPM_BIN:=$(shell npm bin)

.PHONY: all clean js test
all: test js

clean:
	rm -rf build

test: | node_modules
	$(NPM_BIN)/jshint array/*.js base/*.js iterator/*.js math/*.js push/*.js string/*.js transformer/*.js unique/*.js util/*.js test/*.js
	$(NPM_BIN)/tape test/*.js

test-bail:
	$(MAKE) test | $(NPM_BIN)/tap-bail

node_modules:
	npm install

%.min.js: %.js | node_modules
	$(NPM_BIN)/uglifyjs $< -o $@ -c -m

%.gz: %
	gzip -c9 $^ > $@

js: $(BUILD).js $(BUILD).min.js \
	$(BUILD).base.js $(BUILD).base.min.js

$(BUILD).js: index.js base/*.js array/*.js math/*.js iterator/*.js transformer/*.js string/*.js push/*.js unique/*.js util/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin -s transduce index.js > $@

$(BUILD).base.js: base/*.js iterator/*.js transformer/*.js util/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin -s transduce base/index.js > $@

build:
	mkdir -p build
