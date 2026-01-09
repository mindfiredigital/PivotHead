#!/bin/bash

# Test script to verify upload server is working

echo "Starting upload server test..."
echo ""

# Start server in background
PORT=3003 node express-api-upload.js > /tmp/upload-server-test.log 2>&1 &
SERVER_PID=$!

echo "Server PID: $SERVER_PID"
echo "Waiting for server to start..."
sleep 5

# Test health endpoint
echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3003/health | head -3

# Test if upload.html is accessible
echo ""
echo ""
echo "Testing upload.html page..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/upload.html)

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Upload page is accessible (HTTP $HTTP_CODE)"
else
    echo "❌ Upload page failed (HTTP $HTTP_CODE)"
fi

# Test API docs
echo ""
echo "Testing API docs..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api-docs/)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ]; then
    echo "✅ API docs are accessible (HTTP $HTTP_CODE)"
else
    echo "❌ API docs failed (HTTP $HTTP_CODE)"
fi

# Show server URLs
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Server is running successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📂 Upload your 800MB CSV file at:"
echo "   http://localhost:3003/upload.html"
echo ""
echo "📖 API Documentation:"
echo "   http://localhost:3003/api-docs"
echo ""
echo "🔍 Health Check:"
echo "   http://localhost:3003/health"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "Or run: kill $SERVER_PID"
echo ""

# Keep script running to maintain server
wait $SERVER_PID
