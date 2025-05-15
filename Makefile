NODE_BIN=./node_modules/.bin

check: lint test

lint:
	$(NODE_BIN)/biome ci

format::
	$(NODE_BIN)/biome check --fix

test:
	node --test test/*.js test/lame-tiff/*.js

.PHONY: check lint test
