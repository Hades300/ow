.PHONY: optimize-data fix-dates clean-data debug-patch-notes clean-debug fetch-patch-notes fetch-data copy-data build deploy

# Optimize all historical data
optimize-data:
	@echo "Optimizing historical data..."
	@node scripts/optimize-data.cjs

# Fix dates in historical data
fix-dates:
	@echo "Fixing dates in historical data..."
	@node scripts/fix-dates.cjs

# Clean up data directory
clean-data:
	@echo "Cleaning up data directory..."
	@rm -f data/daily/*.json
	@rm -f data/merged_data.json
	@echo "Data directory cleaned!"

# Debug patch notes fetching
debug-patch-notes:
	@echo "Running patch notes fetcher in debug mode..."
	@node scripts/test_fetch_patch_notes.js
	@echo "Debug information has been saved to the debug directory"

# Fetch patch notes
fetch-patch-notes:
	@echo "Fetching patch notes..."
	@node scripts/fetch_patch_notes.cjs

# Clean debug files
clean-debug:
	@echo "Cleaning debug files..."
	@rm -rf debug/
	@echo "Debug files cleaned!"

# Fetch data
fetch-data:
	@echo "Fetching patch notes and hero data..."
	node scripts/fetch_patch_notes.cjs

# Copy data
copy-data:
	@echo "Copying data files to public directory..."
	mkdir -p public/data
	cp -r data/* public/data/

# Build project
build: fetch-data copy-data
	@echo "Building project..."
	npm run build

# Deploy project
deploy: build
	@echo "Deployment complete!"

# Help command
help:
	@echo "Available commands:"
	@echo "  make optimize-data     - Optimize all historical data"
	@echo "  make fix-dates        - Fix dates in historical data"
	@echo "  make clean-data       - Clean up data directory"
	@echo "  make debug-patch-notes - Run patch notes fetcher in debug mode"
	@echo "  make fetch-patch-notes - Fetch patch notes"
	@echo "  make clean-debug      - Clean up debug files"
	@echo "  make fetch-data       - Fetch patch notes and hero data"
	@echo "  make copy-data        - Copy data files to public directory"
	@echo "  make build            - Build project"
	@echo "  make deploy           - Deploy project"
	@echo "  make help             - Show this help message" 