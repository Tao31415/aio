#!/usr/bin/env bash
# kill-ports.sh - 从各项目的 .env.local 读取端口并终止进程
# 用法: ./kill-ports.sh [api_port] [web_port]

# 默认端口
API_PORT=30000
WEB_PORT=40000

# 命令行参数优先级最高
if [ -n "$1" ]; then
  API_PORT=$1
fi
if [ -n "$2" ]; then
  WEB_PORT=$2
fi

# 如果没有命令行参数，从 .env.local 读取
if [ -z "$1" ]; then
  if [ -f "apps/api/.env.local" ]; then
    _PORT=$(grep -E '^PORT=' apps/api/.env.local | cut -d'=' -f2 | tr -d ' \r')
    [ -n "$_PORT" ] && API_PORT=$_PORT
  fi
fi

if [ -z "$2" ]; then
  if [ -f "apps/web/.env.local" ]; then
    _PORT=$(grep -E '^PORT=' apps/web/.env.local | cut -d'=' -f2 | tr -d ' \r')
    [ -n "$_PORT" ] && WEB_PORT=$_PORT
  fi
fi

# 终止进程
echo "Killing processes on ports $API_PORT, $WEB_PORT..."
PIDS=$(lsof -ti:$API_PORT -ti:$WEB_PORT 2>/dev/null)

if [ -n "$PIDS" ]; then
  echo "$PIDS" | xargs kill -9 2>/dev/null
  echo "Done"
else
  echo "No processes found"
fi
