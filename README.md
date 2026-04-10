# War3 RE

浏览器里的 Warcraft III 风格 RTS 原型。

## 本地开发

```bash
npm install
npm run dev
```

默认会启动本地 Vite 开发服务器。

## 构建

```bash
npm run build
```

## GitHub Pages 部署

仓库已经包含 GitHub Pages 工作流：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- Vite 会在 GitHub Actions 环境下自动根据仓库名设置 `base`

### 启用方式

1. 在 GitHub 上创建一个新仓库
2. 把本地仓库 push 到 `main`
3. 在 GitHub 仓库的 `Settings -> Pages` 中把 `Source` 设为 `GitHub Actions`
4. 之后每次 push 到 `main`，都会自动部署到 GitHub Pages

### 线上地址

通常会是：

`https://<你的 GitHub 用户名>.github.io/<仓库名>/`

## 备注

- 当前项目是纯前端静态站点，适合 GitHub Pages
- 线上版本适合做试玩、归档和 milestone 回看

## 观看 glm 会话

如果你想在终端里实时旁观 `Claude Code / glm` 的执行过程，而不是只看最终汇报，可以用：

```bash
./scripts/glm-watch.sh start
```

它会：
- 在 `tmux` 里启动一个可持续的 `claude` 会话
- 默认使用 `--permission-mode bypassPermissions --effort high`
- 自动把终端输出写入 `logs/`

常用命令：

```bash
./scripts/glm-watch.sh attach   # 进入实时终端画面
./scripts/glm-watch.sh tail     # 只看最新日志
./scripts/glm-watch.sh status   # 看当前状态 + 最近输出
./scripts/glm-watch.sh capture  # 打印更多 pane 历史
./scripts/glm-watch.sh stop     # 结束会话
```

可选覆盖：

```bash
GLM_EFFORT=medium ./scripts/glm-watch.sh start
GLM_SESSION_NAME=my-run ./scripts/glm-watch.sh start
GLM_COMMAND='claude --permission-mode bypassPermissions --effort high' ./scripts/glm-watch.sh start
```
