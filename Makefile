PROJECT:=transduce
BUILD:=build/$(PROJECT)
NPM_BIN:=$(shell npm bin)

.PHONY: all clean js test
all: test js

clean:
	rm -rf build

test: | node_modules
	$(NPM_BIN)/jshint array/*.js core/*.js transducers/*.js iterators/*.js math/*.js push/*.js string/*.js unique/*.js test/*.js
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

$(BUILD).js: index.js core/*.js transducers/*.js array/*.js math/*.js iterators/*.js string/*.js push/*.js unique/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin -s transduce index.js > $@

$(BUILD).base.js: core/*.js transducers/*.js | build
	$(NPM_BIN)/browserify -p bundle-collapser/plugin -s transduce base.js > $@

build:
	mkdir -p build
