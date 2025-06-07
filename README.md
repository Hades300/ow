# 守望先锋英雄数据分析面板

这是一个用于分析守望先锋英雄数据的交互式仪表盘，使用React和Vite构建。

## 功能特点

- 查看英雄的胜率、选择率和击杀数据
- 多英雄数据对比
- 显示游戏版本更新对英雄数据的影响
- 响应式设计，支持移动设备
- 按角色筛选英雄
- 搜索特定英雄

## 技术栈

- React
- TypeScript
- Vite
- Recharts (图表库)
- Day.js (日期处理)

## 本地开发

1. 克隆仓库
```bash
git clone <repository-url>
cd ow-dashboard
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 数据结构

数据存储在`/public/data/`目录下的JSON文件中:

- `merged_data.json`: 每日英雄数据
- `hero_meta.json`: 英雄元数据
- `seasons.json`: 赛季信息
- `patch_notes.json`: 游戏更新日志

## 项目结构

```
src/
├── components/      # React组件
├── hooks/           # 自定义React hooks
├── types/           # TypeScript类型定义
├── utils/           # 工具函数
└── pages/           # 页面组件
```

## 未来计划

- 添加更多数据可视化图表
- 实现英雄对比分析
- 添加地图胜率分析
- 实现用户自定义数据视图
- 添加数据导出功能

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request 