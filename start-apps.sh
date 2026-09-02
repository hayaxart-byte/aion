#!/bin/bash
# Start all Aion apps in background
APPS_DIR="/home/codigo/Work/Aion/apps"

echo "Starting doctor-dashboard (3002)..."
cd "$APPS_DIR/doctor-dashboard" && setsid npx next dev -H 0.0.0.0 -p 3002 > /tmp/doctor-dashboard.log 2>&1 &

echo "Starting patient-portal (3003)..."
cd "$APPS_DIR/patient-portal" && setsid npx next dev -H 0.0.0.0 -p 3003 > /tmp/patient-portal.log 2>&1 &

echo "Starting admin-panel (3001)..."
cd "$APPS_DIR/admin-panel" && setsid npx next dev -H 0.0.0.0 -p 3001 > /tmp/admin-panel.log 2>&1 &

sleep 15

echo "=== Status ==="
for port in 3001 3002 3003; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/login 2>&1)
  echo "Port $port: $status"
done

echo "Logs: /tmp/{doctor-dashboard,patient-portal,admin-panel}.log"
