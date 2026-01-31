#!/bin/bash
# AttentionOS Agent - Verification Test Script

echo "=========================================="
echo "AttentionOS Agent - Verification Tests"
echo "=========================================="
echo ""

# Test 1: Database Schema
echo "TEST 1: Verifying Database Schema"
echo "------------------------------------------"

# Start agent briefly to create database
timeout 5 python3 main.py > /dev/null 2>&1 &
sleep 3
kill %1 2>/dev/null

if [ -f "data/attentionos.db" ]; then
    echo "✅ Database created successfully"
    
    # Check tables
    echo ""
    echo "Tables in database:"
    sqlite3 data/attentionos.db ".tables"
    
    echo ""
    echo "Timeline table schema:"
    sqlite3 data/attentionos.db "PRAGMA table_info(timeline);"
    
    echo ""
    echo "Activity logs schema:"
    sqlite3 data/attentionos.db "PRAGMA table_info(activity_logs);"
else
    echo "❌ Database not created"
    exit 1
fi

echo ""
echo "TEST 2: API Server Startup"
echo "------------------------------------------"

# Start the agent
python3 main.py > /tmp/agent_test.log 2>&1 &
AGENT_PID=$!

echo "Agent PID: $AGENT_PID"

# Wait for API server to start
sleep 5

# Test API endpoints
echo ""
echo "Testing GET /api/agent/status:"
curl -s http://localhost:8001/api/agent/status | json_pp || echo "Using basic output:"
curl -s http://localhost:8001/api/agent/status

echo ""
echo ""
echo "Testing GET /api/agent/focus-score:"
curl -s http://localhost:8001/api/agent/focus-score | json_pp || echo "Using basic output:"
curl -s http://localhost:8001/api/agent/focus-score

echo ""
echo ""
echo "TEST 3: Let agent run for 90 seconds to test timeline logging..."
echo "(Timeline logs every 30 seconds)"
echo ""

sleep 90

echo "Checking timeline entries:"
echo ""
sqlite3 data/attentionos.db "SELECT timestamp, app_name, is_idle FROM timeline ORDER BY timestamp DESC LIMIT 5;"

echo ""
echo "Checking activity logs with metadata:"
echo ""
sqlite3 data/attentionos.db "SELECT app_name, window_title, bundle_id FROM activity_logs WHERE window_title IS NOT NULL LIMIT 3;"

# Stop the agent
echo ""
echo "Stopping agent (PID: $AGENT_PID)..."
kill $AGENT_PID 2>/dev/null
wait $AGENT_PID 2>/dev/null

echo ""
echo "=========================================="
echo "Verification Tests Complete!"
echo "=========================================="
echo ""
echo "Agent log saved to: /tmp/agent_test.log"
echo "Database location: $(pwd)/data/attentionos.db"
