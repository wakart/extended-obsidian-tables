.PHONY: install compile start stop restart logs version patch minor major

install:
	docker compose run --rm plugin npm install

compile:
	docker compose run --rm plugin npm run build

start:
	docker compose up -d

stop:
	docker compose down

restart: stop start

logs:
	docker compose logs -f plugin

version:
	@echo Current version:
	@jq -r '.version' manifest.json

patch:
	@$(MAKE) bump TYPE=patch

minor:
	@$(MAKE) bump TYPE=minor

major:
	@$(MAKE) bump TYPE=major

bump:
	@echo "Bumping $(TYPE) version..."
	@VERSION=$$(node -p "require('semver').inc(require('./manifest.json').version,'$(TYPE)')"); \
	echo "New version: $$VERSION"; \
	docker compose run --rm -e npm_package_version=$$VERSION plugin node version-bump.mjs
