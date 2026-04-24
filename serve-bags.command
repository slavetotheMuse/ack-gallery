#\!/bin/bash
# Double-click this file to start a local server and open bags.html

cd "$(dirname "$0")"

PORT=8080
# If 8080 is taken, try 8081, 8082, ... up to 8090
for p in 8080 8081 8082 8083 8084 8085 8086 8087 8088 8089 8090; do
  if \! lsof -i :$p -sTCP:LISTEN >/dev/null 2>&1; then
    PORT=$p
    break
  fi
done

echo ""
echo "========================================"
echo "  your bags — local server"
echo "========================================"
echo ""
echo "Serving from: $(pwd)"
echo "Port: $PORT"
echo ""
echo "Opening http://localhost:$PORT/bags.html"
echo ""
echo "When you are done: close this Terminal window (or press Ctrl+C)."
echo ""

# Open the page after a short delay so the server is up
(sleep 1; open "http://localhost:$PORT/bags.html") &

# Start the server (python3 is preinstalled on macOS 12+)
python3 -m http.server $PORT
