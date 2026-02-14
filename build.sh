#!/bin/bash
# Complete build and deployment script
# 1. Build shared-library explicitly
# 2. Docker build with --no-cache (ensures latest code)
# 3. Prune old images/containers
# 4. Start the application

set -e

echo "🔨 Building Global Patient Track System..."
echo ""

# Step 1: Clean Maven artifacts
echo "Step 1: Cleaning Maven artifacts..."
mvn clean -q

# Step 2: Build shared-library first, then all services
echo "Step 2: Building shared-library and all services..."
mvn package -DskipTests -T 1C -q

# Step 3: Verify shared-library was built with current enums
echo "Step 3: Verifying shared-library contains all roles..."
ENUMS=$(unzip -p shared-library/target/shared-library-1.0.0.jar com/globalpatienttrack/shared/model/UserRole.class 2>/dev/null | strings | grep -E "^(ADMIN|DOCTOR|PATIENT|LABTECHNICIAN)$" | wc -l)
echo "   ✓ Found $ENUMS user roles (ADMIN, DOCTOR, PATIENT, LABTECHNICIAN)"

# Step 4: Stop existing containers
echo "Step 4: Stopping existing containers..."
docker compose down 2>/dev/null || true

# Step 5: Prune old images and containers
echo "Step 5: Pruning old Docker images and containers..."
docker image prune -af --filter "until=1h" 2>/dev/null || true
docker container prune -f 2>/dev/null || true

# Step 6: Build Docker images with --no-cache (always uses latest compiled code)
echo "Step 6: Building Docker images (no cache - uses latest compiled code)..."
docker compose build --no-cache

# Step 7: Start the application
echo "Step 7: Starting all services..."
docker compose up -d

# Step 8: Wait for services to be ready
echo "Step 8: Waiting for services to start..."
sleep 10

# Step 9: Verify services are running
echo ""
echo "Step 9: Verifying services..."
docker ps | grep -E "auth-service|user-data-service|api-gateway" || echo "⚠️  Check service status"

echo ""
echo "✅ Build complete! Application is running."
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔐 API Gateway: http://localhost:8080"
echo ""
echo "Test technician login:"
echo "  curl -X POST http://localhost:8080/auth/login \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"username\":\"tech_mmc_1\",\"password\":\"TechJohn@2026\"}'"
echo ""
echo "To stop: docker compose down"


