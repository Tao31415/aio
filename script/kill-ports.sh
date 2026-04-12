#!/usr/bin/env bash
# kill-ports.sh - 从各项目的 .env.local 读取端口并终止进程

# 默认端口
API_PORT=30000
WEB_PORT=40000

# 读取 apps/api/.env.local 的 PORT
if [ -f "apps/api/.env.local" ]; then
  API_PORT=$(grep -E '^PORT=' apps/api/.env.local | cut -d'=' -f2 | tr -d ' \r')
  [ -z "$API_PORT" ] && API_PORT=3000
fi

# 读取 apps/web/.env.local 的 PORT
if [ -f "apps/web/.env.local" ]; then
  WEB_PORT=$(grep -E '^PORT=' apps/web/.env.local | cut -d'=' -f2 | tr -d ' \r')
  [ -z "$WEB_PORT" ] && WEB_PORT=4000
fi

# 终止进程
echo "API_PORT=$API_PORT, WEB_PORT=$WEB_PORT"
PIDS=$(lsof -ti:$API_PORT -ti:$WEB_PORT 2>/dev/null)

if [ -n "$PIDS" ]; then
  echo "Killing processes on ports $API_PORT, $WEB_PORT..."
  echo "$PIDS" | xargs kill -9 2>/dev/null
  echo "Done"
else
  echo "No processes found on ports $API_PORT, $WEB_PORT"
fi
