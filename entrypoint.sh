#!/bin/sh
set -e

echo "--- MOOTRIP MINIMAL TEST ---"
echo "Port: $PORT"

# Create a minimal node server to test connectivity
cat <<EOF > test-server.js
const http = require('http');
const port = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Minimal Test Success\n');
});
server.listen(port, '0.0.0.0', () => {
  console.log(\`Server running at http://0.0.0.0:\${port}/\`);
});
EOF

echo "Starting minimal test server..."
node test-server.js &
TEST_PID=$!

sleep 5

echo "Starting Next.js..."
export HOSTNAME="0.0.0.0"
# Don't override PORT if Railway provided one
exec node server.js
