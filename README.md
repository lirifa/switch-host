# switch-host

一个管理本地 hosts 文件和刷新 DNS 的 CLI 工具。

## 命令别名

- `switch-host`（完整命令）
- `shost`（简短别名）

## 功能特性

- 📋 列出所有 hosts 条目（区分 fetch 的和其他的）
- ➕ 添加新的 host 条目
- ❌ 删除 host 条目（支持交互式选择和模糊匹配）
- 🗑️ 清除所有 fetch 的条目
- 🔄 从远程 URL 获取 hosts 并更新
- ⚙️ 配置管理（自定义远程 URL）
- 🔄 刷新 DNS 缓存
- 🎨 友好的命令行界面
- 🔒 跨平台支持（Windows, macOS, Linux）

## 安装

### 从 npm 安装

```bash
npm install -g switch-host
```

### 本地开发

```bash
git clone <repository>
cd switch-host
npm install
npm run build
npm link
```

## 使用方法

### 基本命令

```bash
switch-host <command> [options]
# 或使用简短别名
shost <command> [options]
```

## 命令说明

### list / ls

列出所有 hosts 条目。

```bash
switch-host list
# 或
switch-host ls
```

**输出示例：**
```
=== Hosts List ===

Fetched entries (40):
IP                      Domain
--------------------------------------------------
140.82.112.26           alive.github.com
20.205.243.168          api.github.com

Other entries (1):
IP                      Domain
--------------------------------------------------
127.0.0.1               localhost

Total: 41 entries (40 fetched, 1 other)
```

### add

添加新的 host 条目。

```bash
switch-host add <ip> <domain> [comment]
```

**示例：**
```bash
switch-host add 127.0.0.1 example.local
switch-host add 127.0.0.1 mysite.local "local dev site"
```

### remove / rm

删除 host 条目。

**方式一：交互式选择**
```bash
switch-host remove
# 或
switch-host rm
```

显示所有条目，输入数字选择要删除的条目：
- 输入单个数字：`1`
- 输入多个数字（空格分隔）：`1 3 5`
- 按 Enter 或 Esc 取消

**方式二：模糊匹配**
```bash
switch-host remove <domain>
```

**示例：**
```bash
switch-host remove github
```

会显示所有匹配的条目并询问是否删除。

### clear

清除所有 fetch 的条目。

```bash
switch-host clear
```

### fetch

从远程 URL 获取 hosts 并更新。

```bash
switch-host fetch [url]
```

**示例：**
```bash
# 使用配置的 URL
switch-host fetch

# 使用指定的 URL
switch-host fetch https://example.com/hosts.json
```

**更新摘要：**
- 🟢 绿色 - 新增的条目
- 🟡 黄色 - 更新的条目
- 🔴 红色 - 删除的条目

### config

查看或设置配置。

```bash
# 查看所有配置
switch-host config

# 查看特定配置
switch-host config hostsUrl

# 设置配置
switch-host config hostsUrl https://example.com/hosts.json
```

**配置项：**
- `hostsUrl` - 远程 hosts 数据的 URL（默认：`https://raw.hellogithub.com/hosts.json`）

### flush

刷新 DNS 缓存。

```bash
switch-host flush
```

**注意：** Windows 上可能需要管理员权限。

### help

显示帮助信息。

```bash
switch-host help
```

## 配置

配置文件保存在项目根目录的 `.switch-host-config.json`。

**默认配置：**
```json
{
  "hostsUrl": "https://raw.hellogithub.com/hosts.json"
}
```

## 远程数据格式

支持以下数据格式：

### 格式 1：二维数组
```json
[
  ["192.0.66.2", "github.blog"],
  ["20.205.243.166", "github.com"]
]
```

### 格式 2：对象数组
```json
{
  "hosts": [
    { "ip": "192.0.66.2", "host": "github.blog" },
    { "ip": "20.205.243.166", "host": "github.com" }
  ]
}
```

### 格式 3：键值对
```json
{
  "github.blog": "192.0.66.2",
  "github.com": "20.205.243.166"
}
```

## 项目结构

```
switch-host/
├── index.js                    # 主入口文件
├── build.js                    # esbuild 构建配置
├── package.json                # 项目配置
├── .switch-host-config.json    # 用户配置（可选）
└── src/
    ├── utils.js                # 工具函数和常量
    ├── config.js               # 配置管理
    ├── hosts.js                # hosts 文件管理
    └── commands.js             # 命令实现
```

## 开发

### 构建项目

```bash
npm run build
```

输出文件：`dist/switch-host.js`（压缩混淆后的单文件）

### 本地测试

```bash
npm start -- help
npm start -- list
```

## 发布到 npm

1. 更新 `package.json` 中的版本号
2. 登录 npm：
   ```bash
   npm login
   ```
3. 发布：
   ```bash
   npm publish
   ```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request！
