# 星星乘法岛

帮助孩子练习九九乘法的浏览器游戏。Vue 3 + TypeScript + Element Plus 前端，Express API，PostgreSQL 保存账号、学习记录、金币和衣柜。

## 功能

- 18 个关卡，地鼠、魔法对战、搭桥、甜品订单四种玩法。
- 薄弱题复习、提示、星级评价和金币奖励。
- 套装与配饰商城、试穿、心愿、部件混搭和角色动作反馈。
- 分层栅格角色渲染，部件锚点、表情、粒子及减少动效设置。
- 邮箱密码登录，跨设备存档；配置 SMTP 后支持密码重置。

美术仍在迭代：钢铁侠精绘套装暂未开放新兑换；角色使用程序控制的分层骨架，并非 Spine 导出资源。角色资产与适配说明见 [RIG.md](RIG.md)。这是家庭使用项目，包含用户指定的角色诠释；没有附带第三方角色的商业授权。

## 本地开发

需要 Node.js 24、npm、PostgreSQL 17。

```sh
npm ci
cp .env.example .env
# 修改 DATABASE_URL，指向已有的空数据库
npm run dev
```

默认前端 `http://localhost:5173`，API `http://localhost:3100`。服务启动时自动初始化数据库表。自定义端口时同时设置 `STAR_WEB_PORT`、`STAR_API_PORT`、`PORT` 和 `APP_ORIGIN`。

```sh
npm run lint
npm test
npm run build
# 启动开发服务后进行浏览器验证
npx playwright install chromium
TEST_URL=http://localhost:5173 npm run smoke:gallery
TEST_URL=http://localhost:5173 npm run smoke:rig
```

浏览器验证会创建测试账号，请使用测试数据库。图片生成原稿、截图和本机图库同步结果位于未提交的 `work/`；运行应用所需资产均包含在 `public/`。可选图库上传脚本依赖本机安装的图库技能，也可用 `GALLERY_UPLOADER` 指定上传器路径。

## NAS Jenkins 部署

使用 [Jenkinsfile](Jenkinsfile)、[compose.nas.yaml](compose.nas.yaml) 和 [deploy/nas.sh](deploy/nas.sh)。方式参考 aiManagerPrompter：Jenkins 同步代码到 NAS，在 NAS 上用 Docker 构建、验证、启动。

1. Jenkins 新建 Pipeline，选择「Pipeline script from SCM」，Git 仓库为 `git@github.com:makunsusu/star-island.git`，分支 `*/main`，脚本路径 `Jenkinsfile`。配置 GitHub 读取凭据；这是与 NAS SSH 凭据不同的用途。
2. NAS SSH 凭据默认复用 `fn-nas-ssh`。Jenkins 节点需要 Git、SSH、rsync；NAS 需要 Bash、rsync、curl、Docker 和支持 `up --wait` 的 Compose v2。NAS 用户需要 Docker 权限。
3. 首次构建注册参数，核对 NAS 地址、目录、端口和 `APP_ORIGIN` 后执行。默认端口 `18081`；默认地址 `http://192.168.10.70:18081`。通过 Tailscale 访问时将 `APP_ORIGIN` 改为对应地址，例如 `http://100.77.63.110:18081`。访问地址必须与配置一致。
4. 构建成功后访问参数中设置的地址，注册新账号。NAS 使用独立数据库，不会导入开发环境账号。

默认独立目录：

| 内容 | NAS 路径 |
| --- | --- |
| 代码 | `/vol3/@appdata/my_apps/star-island/repo` |
| 数据 | `/vol3/@appdata/my_apps/appdata/star-island/postgres` |
| 配置 | `/vol3/@appdata/my_apps/appdata/star-island/config/runtime.env` |
| 数据库备份 | `/vol3/@appdata/my_apps/appdata/star-island/backups` |

首次部署自动生成数据库随机密码并保留在 NAS 私有配置文件中，后续部署复用。不要删除该文件或随意修改已有数据库密码。配置文件支持 `SMTP_HOST`、`SMTP_PORT`、`SMTP_USER`、`SMTP_PASS`、`SMTP_FROM`。修改后重新构建。

构建会执行 lint、单元测试和前端构建；已有数据库在更新前用 pg_dump 备份，启动后检查 API 与首页。健康检查失败时尝试恢复上一应用镜像。数据库结构不会自动回滚，需要时由管理员从备份恢复；不要使用 `docker compose down -v`。备份保留策略需按 NAS 容量设置。

默认 HTTP 适用于可信家庭内网或 Tailscale。对外开放请配置 HTTPS 反向代理，并将 `APP_ORIGIN` 设置为 HTTPS；脚本据此开启安全 Cookie。使用一层受信任代理时，在私有配置中设置 `TRUST_PROXY=1`。首次 SSH 连接采用 accept-new 保存主机指纹，后续指纹变更会拒绝连接。

也可在 NAS 代码目录手动执行：

```sh
DATA_DIR=/vol3/@appdata/my_apps/appdata/star-island \
APP_PORT=18081 APP_ORIGIN=http://192.168.10.70:18081 \
IMAGE_TAG=manual-001 bash deploy/nas.sh
```

每次手工发布请使用不同镜像标签，以保留上一版本供回滚。

## 独立 HTTPS 部署

原有 `compose.yaml` 提供 PostgreSQL + 应用 + Caddy。设置 `DOMAIN` 和随机十六进制 `POSTGRES_PASSWORD`，确保域名解析及 80/443 端口可用，然后执行 `docker compose up -d --build`。不要与 NAS Compose 同时部署为同一实例。

`.env`、数据库目录、私钥、构建产物和本机工作文件均不提交 Git。
