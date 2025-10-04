# 更新日志

## 2025-01-04 - 配置存储优化

### 主要改动

#### 1. 移除 localStorage 存储
- ❌ 移除所有 `localStorage.getItem()` 和 `localStorage.setItem()` 调用
- ✅ 配置改为内存变量存储（页面刷新后重置）
- ✅ 解决了 localStorage 配额超出问题

#### 2. 默认配置写死
```javascript
const DEFAULT_SETTINGS = {
    bgType: "image",
    bgValue: null,
    bgImage: "assets/default-bg.png",
    opacity: "85",
    all: {
        bgType: "image",
        bgValue: null,
        bgImage: "assets/default-bg.png",
        opacity: "70",
        fontFamily: "'SimSun', serif",
        textColor: "#333333"
    }
};
```

#### 3. 文件大小优化
- settings.js: 从 23KB (667行) 缩减到 12KB (378行)
- 移除了约 289 行不必要的代码

#### 4. 删除的功能
- 设置持久化存储
- "设为应用默认" 功能
- "恢复默认设置" 对话框功能
- `applyBuiltinDefaultsIfNeeded()`
- `setAsBuiltinDefault()`
- `initializeDefaultSettings()`
- `saveCurrentAsDefault()`
- `resetToDefault()`

#### 5. 保留的功能
- ✅ 运行时配置修改（内存中）
- ✅ URL 分享配置功能
- ✅ 背景图片/颜色设置
- ✅ 透明度设置
- ✅ 文字样式设置
- ✅ 模式图标上传（内存中）

### 技术细节

**变更前**:
```javascript
// 从 localStorage 读取
const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
// 保存到 localStorage
localStorage.setItem('appSettings', JSON.stringify(settings));
```

**变更后**:
```javascript
// 从内存变量读取
const settings = currentSettings[page] || currentSettings.all;
// 保存到内存变量
currentSettings[page] = { ...settings };
```

### 影响

**优点**:
- 🚀 更快的读写速度（无需序列化/反序列化）
- 💾 不占用 localStorage 空间
- 🔒 更好的隐私保护（不保存用户数据）
- 🐛 避免了配额超出错误

**缺点**:
- ⚠️ 页面刷新后配置重置为默认值
- ⚠️ 用户自定义配置不会保存

### 文件结构

```
js/
├── utils.js (95行)       - 常量和工具函数
├── settings.js (378行)   - 设置功能（已优化）
├── mode-single.js (399行)- 单张模式
├── mode-batch.js (978行) - 批量模式
├── mode-text.js (775行)  - 文本模式
└── main.js (49行)        - 主逻辑
```

总代码行数: **2,674 行** (优化前: 2,950 行)
