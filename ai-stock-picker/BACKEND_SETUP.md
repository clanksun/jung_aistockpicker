# 孙铮的AI Stock Picker - 后端设置说明

## 🚀 快速开始

### 一键启动（推荐）

```bash
./start.sh
```

这将自动：
1. 创建 Python 虚拟环境
2. 安装所有依赖
3. 启动 Python Flask 后端（端口 5000）
4. 启动 Next.js 前端（端口 3000）

### 手动启动

#### 1. 启动 Python 后端

```bash
cd backend

# 创建虚拟环境（如果还没有）
python3 -m venv venv
source venv/bin/activate

# 安装依赖
pip install -r requirements.txt

# 启动服务器
python server.py
```

后端将运行在 `http://localhost:5000`

#### 2. 启动 Next.js 前端

```bash
# 安装依赖（如果还没有）
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 `http://localhost:3000`

## 📋 可用的 API 端点

### 股票搜索
- `GET /api/stock/search?q=AAPL` - 搜索股票
- `GET /api/stock/AAPL/history?days=90` - 获取历史数据
- `GET /api/stock/AAPL/info` - 获取股票信息

### 示例 API 调用

```javascript
// 搜索股票
const response = await fetch('http://localhost:5000/api/stock/search?q=AAPL')
const data = await response.json()

// 获取历史数据
const historyRes = await fetch('http://localhost:5000/api/stock/AAPL/history?days=90')
const historyData = await historyRes.json()
```

## 🔧 技术栈

### 后端
- **Python 3.8+**
- **Flask** - Web 框架
- **yfinance** - 股票数据获取
- **pandas** - 数据处理
- **numpy** - 数值计算
- **Flask-CORS** - 跨域支持

### 前端
- **Next.js 15** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式
- **Shadcn/ui** - UI 组件
- **Recharts** - 图表库

## 📊 实现的功能

### 1. 智能搜索
- 实时股票搜索
- 自动补全建议
- 热门股票列表

### 2. 股票详情
- K 线图（可切换为趋势线）
- MA20 移动平均线
- 实时价格显示
- 涨跌幅指示
- 技术指标（RSI、MA5、MA10、MA20）

### 3. 技术指标
- RSI 相对强弱指标
- 移动平均线（MA5、MA10、MA20）
- 超买/超卖区域指示
- 成交量显示

### 4. 时间范围
- 1 个月（30天）
- 3 个月（90天）
- 6 个月（180天）
- 1 年（365天）

### 5. 优雅的加载动画
- 脉冲加载器
- 滑动效果
- 骨架屏加载
- 图表加载动画

## 🎨 UI 特点

- **暗黑主题** - 专业的交易界面风格
- **响应式设计** - 完美适配手机和桌面
- **流畅动画** - 丝滑的过渡效果
- **现代卡片** - 玻璃态设计
- **渐变色彩** - 蓝紫渐变色系

## 📝 开发说明

### 数据流

1. **Next.js 前端**
   - 用户搜索股票
   - 调用后端 API
   - 如果后端不可用，使用模拟数据

2. **Python 后端**
   - 使用 yfinance 获取真实股票数据
   - 计算技术指标（MA、RSI）
   - 返回 JSON 格式数据

### 错误处理

- API 调用失败时自动降级到模拟数据
- 保证前端始终可用
- 后端日志记录在 `/tmp/backend.log`
- 前端日志记录在 `/tmp/frontend.log`

## 🔐 安全提示

- 不要在公网暴露 5000 端口
- 考虑使用环境变量管理 API 密钥
- 添加 API 速率限制
- 实现 CORS 策略

## 📚 未来扩展

- [ ] 添加用户认证
- [ ] 实现股票收藏功能
- [ ] 添加 AI 分析功能（集成智谱/DeepSeek）
- [ ] 实现策略回测功能
- [ ] 添加价格提醒通知
- [ ] 实现投资组合管理
- [ ] 添加更多技术指标（MACD、布林带等）
- [ ] 支持更多市场（A股、港股等）

## 🐛 故障排查

### 后端无法启动
```bash
# 检查端口是否被占用
lsof -i:5000

# 如果被占用，kill 进程
kill -9 <PID>

# 检查 Python 版本
python --version
```

### 前端无法启动
```bash
# 清理缓存
rm -rf .next

# 重新安装依赖
npm install

# 启动开发模式
npm run dev
```

### API 调用失败
1. 检查后端是否运行：`curl http://localhost:5000/api/stock/search?q=AAPL`
2. 查看后端日志：`tail -f /tmp/backend.log`
3. 查看前端日志：`tail -f /tmp/frontend.log`

## 💡 提示

- 首次运行推荐使用 `./start.sh`
- 所有数据均为示例，需要配置真实 API 密钥才能使用
- 修改 `backend/server.py` 中的股票列表以添加更多股票
- 前端已内置错误处理，后端启动失败会使用模拟数据
- 可以在浏览器中直接访问 `http://localhost:3000` 查看效果
