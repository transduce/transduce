PROJECT:=transduce

JS_TARGET ?= build/$(PROJECT).js

.PHONY: all clean js test serve
all: test js

clean:
	rm -rf build

test: | node_modules
	`npm bin`/jshint array/*.js base/*.js iterator/*.js math/*.js push/*.js string/*.js transformer/*.js unique/*.js util/*.js test/*.js
	`npm bin`/tape test/*.js

node_modules:
	npm install

%.min.js: %.js | node_modules
	`npm bin`/uglifyjs $< -o $@ -c -m

%.gz: %
	gzip -c9 $^ > $@

js: $(JS_TARGET) $(JS_TARGET:.js=.min.js)

$(JS_TARGET): *.js base/*.js array/*.js math/*.js iterator/*.js transformer/*.js string/*.js push/*.js unique/*.js util/*.js | build
	`npm bin`/browserify -s transduce index.js > $@

build:
	mkdir -p build
