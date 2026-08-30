#!/bin/bash
# ==============================================================================
# MEDMARG HOSTINGER VPS DEPLOYMENT SCRIPT
# Runs safely without modifying ports 5000-5009 used by other hosted apps
# ==============================================================================

set -e

echo "=== 1. AUDITING ACTIVE PORTS ON VPS ==="
ss -tulnp | grep LISTEN || netstat -tuln

echo ""
echo "=== 2. CLONING / UPDATING MEDMARG REPOSITORY ==="
mkdir -p /var/www
if [ -d "/var/www/medmarg" ]; then
    echo "Directory /var/www/medmarg exists. Pulling latest code..."
    cd /var/www/medmarg
    git pull origin main
else
    echo "Cloning https://github.com/doraswamyraju/medmarg.git into /var/www/medmarg..."
    git clone https://github.com/doraswamyraju/medmarg.git /var/www/medmarg
    cd /var/www/medmarg
fi

echo ""
echo "=== 3. BUILDING REACT WEB FRONTEND ==="
cd /var/www/medmarg/web
npm install --legacy-peer-deps
npm run build

echo ""
echo "=== 4. SETTING UP NODE.JS BACKEND (PORT 5080) ==="
cd /var/www/medmarg/backend
npm install --legacy-peer-deps

# Verify port 5080 is free
if ss -tulnp | grep ':5080 '; then
    echo "Warning: Port 5080 is occupied, falling back to 5090..."
    export PORT=5090
else
    export PORT=5080
fi

# PM2 Process Manager
pm2 delete medmarg-api 2>/dev/null || true
PORT=$PORT pm2 start server.js --name "medmarg-api"
pm2 save

echo ""
echo "=== 5. CONFIGURING NGINX VIRTUAL HOST ==="
cat << 'EOF' > /etc/nginx/sites-available/medmarg.conf
server {
    listen 80;
    server_name medmarg.com www.medmarg.com;

    root /var/www/medmarg/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:5080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF

ln -sf /etc/nginx/sites-available/medmarg.conf /etc/nginx/sites-enabled/medmarg.conf
nginx -t
systemctl reload nginx

echo ""
echo "=========================================================="
echo "🎉 MEDMARG DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "• Web App: /var/www/medmarg/web/dist"
echo "• Backend API: Running on port 5080 (PM2 process: medmarg-api)"
echo "• Health Check: curl http://127.0.0.1:5080/api/health"
echo "=========================================================="
