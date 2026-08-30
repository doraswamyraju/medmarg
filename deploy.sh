#!/bin/bash
# ==============================================================================
# MEDMARG HOSTINGER VPS DEPLOYMENT SCRIPT
# Safe from ports 5000-5009 used by other hosted sites
# ==============================================================================

set -e

echo "=== 1. AUDITING ACTIVE PORTS ON VPS ==="
ss -tulnp | grep LISTEN || netstat -tuln

echo ""
echo "=== 2. CLONING / UPDATING MEDMARG REPOSITORY ==="
mkdir -p /var/www
if [ -d "/var/www/medmarg/.git" ]; then
    echo "Updating existing MedMarg repository..."
    cd /var/www/medmarg
    git reset --hard
    git clean -fd
    git pull origin main
else
    echo "Cloning repository into /var/www/medmarg..."
    git clone https://github.com/doraswamyraju/medmarg.git /var/www/medmarg
    cd /var/www/medmarg
fi

echo ""
echo "=== 3. BUILDING REACT WEB FRONTEND ==="
cd /var/www/medmarg/web
npm install --legacy-peer-deps
npm run build

echo ""
echo "=== 4. STARTING / RESTARTING WEB SERVER (PORT 5085) ==="
pm2 delete medmarg-web 2>/dev/null || true
pm2 serve /var/www/medmarg/web/dist 5085 --spa --name "medmarg-web"

echo ""
echo "=== 5. SETTING UP NODE.JS BACKEND (PORT 5080) ==="
cd /var/www/medmarg/backend
npm install --legacy-peer-deps

pm2 delete medmarg-api 2>/dev/null || true
PORT=5080 pm2 start server.js --name "medmarg-api"
pm2 save

echo ""
echo "=========================================================="
echo "🎉 MEDMARG DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "• Web App: http://147.93.107.21:5085/ (Landing Page)"
echo "• Login & Dashboards: http://147.93.107.21:5085/login"
echo "• Backend API: http://147.93.107.21:5080/api/health"
echo "=========================================================="
