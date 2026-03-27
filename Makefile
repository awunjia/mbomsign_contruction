SHELL := /bin/zsh

.PHONY: fresh dev build start lint docker-up docker-down docker-logs

fresh:
	npm install
	mkdir -p data
	test -f data/subscribers.json || echo "[]" > data/subscribers.json
	npm run build
	npm start

dev:
	npm install
	mkdir -p data
	test -f data/subscribers.json || echo "[]" > data/subscribers.json
	npm run dev

build:
	npm run build

start:
	npm start

lint:
	npm run lint

docker-up:
	mkdir -p data
	test -f data/subscribers.json || echo "[]" > data/subscribers.json
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f
