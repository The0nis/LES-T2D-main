COMPOSE_FILE=docker-compose.yaml

up:
	@echo "Starting containers..."
	@docker compose -f $(COMPOSE_FILE) up -d

down:
	@echo "Stopping containers..."
	@docker compose -f $(COMPOSE_FILE) down

build:
	@echo "Building containers..."
	@docker compose -f $(COMPOSE_FILE) up --build -d

logs:
	@echo "Showing logs..."
	@docker compose -f $(COMPOSE_FILE) logs -f $(container)
	
rebuild:
	@echo "Rebuilding containers..."
	@docker compose -f $(COMPOSE_FILE) down
	@docker compose -f $(COMPOSE_FILE) up --build -d