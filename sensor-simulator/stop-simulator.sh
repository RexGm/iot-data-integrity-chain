#!/bin/bash

# IoT Sensor Simulator Stop Script

echo "========================================="
echo "📛 Stopping IoT Sensor Simulator"
echo "========================================="
echo ""

# Kill any running producer processes
if pgrep -f "python3.*producer.py" > /dev/null; then
    echo "🛑 Stopping producer processes..."
    pkill -f "python3.*producer.py"
    sleep 1
    if pgrep -f "python3.*producer.py" > /dev/null; then
        echo "⚠️ Forcing kill..."
        pkill -9 -f "python3.*producer.py"
    fi
    echo "✅ Producer stopped"
else
    echo "ℹ️ No producer processes found"
fi

echo ""
echo "✅ Cleanup complete"
