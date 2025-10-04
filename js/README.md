# JavaScript 文件拆分说明

## 文件结构

原 `script.js` (2990行) 已拆分为以下 6 个模块：

### 1. utils.js (81行)
- 常量定义 (BG_PRESETS, DEFAULT_MODE_ICONS, BUILTIN_DEFAULT_SETTINGS)
- 通用工具函数 (calculateScale, renderPageNumbers, createPageButton)

### 2. settings.js (667行)
- 背景设置相关函数
- 加载/保存设置
- 预设背景处理
- 透明度设置
- 文字设置
- 模式图标上传
- 默认设置管理
- URL 分享设置

### 3. mode-single.js (399行)
- 单张图片上传
- 单张图片裁剪
- 单张预览生成
- 单张模式重置

### 4. mode-batch.js (978行)
- 批量图片上传
- 批量编辑界面
- 批量预览生成
- 分页功能
- 批量处理逻辑

### 5. mode-text.js (775行)
- 文本文件上传
- 文本编辑界面  
- 文本预览生成
- 文本分页功能
- 文本处理逻辑

### 6. main.js (50行)
- 全局变量定义
- 页面初始化 (DOMContentLoaded)
- 模式切换函数
- 页面导航函数

## 引入顺序

在 `index.html` 中必须按以下顺序引入：

```html
<script src="js/utils.js"></script>      <!-- 1. 工具函数 -->
<script src="js/settings.js"></script>   <!-- 2. 设置功能 -->
<script src="js/mode-single.js"></script><!-- 3. 单张模式 -->
<script src="js/mode-batch.js"></script> <!-- 4. 批量模式 -->
<script src="js/mode-text.js"></script>  <!-- 5. 文本模式 -->
<script src="js/main.js"></script>       <!-- 6. 主逻辑（必须最后）-->
```

## 备份文件

- `script.js.backup` - 拆分前的原始文件 (11MB, 包含 base64 图片数据)
- `script.js` - 移除 base64 后的文件 (100KB, 2990行)

## 注意事项

1. 所有模块文件都不超过 2000 行
2. main.js 必须最后引入，因为它包含 DOMContentLoaded 监听器
3. utils.js 必须最先引入，因为其他文件依赖其中的常量和函数
4. 文件间通过全局作用域共享函数和变量
