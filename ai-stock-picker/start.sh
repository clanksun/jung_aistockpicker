#!/bin/bash

# 启动脚本 - 孙铮的AI Stock Picker
# 同时启动 Python 后端和 Next.js 前端

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "========================================"
echo "  孙铮的AI Stock Picker"
echo "========================================"
echo -e "${NC}"

# 检查Python虚拟环境
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}创建Python虚拟环境...${NC}"
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    cd ..
else
    echo -e "${GREEN}Python虚拟环境已存在${NC}"
    cd backend
    source venv/bin/activate
    cd ..
fi

# 安装Python依赖
echo -e "${BLUE}安装Python依赖...${NC}"
cd backend
pip install -r requirements.txt --quiet
cd ..

# 安装Node依赖
echo -e "${BLUE}安装Node依赖...${NC}"
npm install --silent

# 启动Python后端 (在后台)
echo -e "${BLUE}启动Python后端服务器 (端口5000)...${NC}"
cd backend
source venv/bin/activate
python server.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# 等待后端启动
sleep 3

# 启动Next.js前端 (在后台)
echo -e "${BLUE}启动Next.js前端服务器 (端口3000)...${NC}"
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# 等待前端启动
sleep 2

echo -e "${GREEN}========================================"
echo "  服务已启动！"
echo "========================================${NC}"
echo -e "${YELLOW}前端: ${BLUE}http://localhost:3000${NC}"
echo -e "${YELLOW}后端: ${BLUE}http://localhost:5000${NC}"
echo -e "${NC}"
echo -e "查看日志："
echo "  tail -f /tmp/frontend.log"
echo "  tail -f /tmp/backend.log"
echo ""
echo -e "${YELLOW}停止所有服务：${NC}Ctrl+C 或运行："
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo -e "${NC}"

# 捕获Ctrl+C信号
trap "echo -e '${RED}停止所有服务...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# 等待进程
wait
